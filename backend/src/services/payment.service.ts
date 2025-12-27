import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { purchases, packages, organisations } from '../db/schema';
import { KeypassService } from './keypass.service';

// Infer types from schema
type Purchase = typeof purchases.$inferSelect;
type Package = typeof packages.$inferSelect;

export interface CreatePurchaseInput {
  organisationId: string;
  assessmentId: string;
  packageId: string;
  userId: string;
}

export interface ConfirmPurchaseInput {
  purchaseId: string;
  paymentIntentId: string;
}

export class PaymentService {
  private stripe: Stripe;
  private keypassService: KeypassService;

  constructor() {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia',
    });

    this.keypassService = new KeypassService();
  }

  /**
   * Get all available packages
   */
  async getPackages(): Promise<Package[]> {
    const allPackages = await db.select().from(packages);
    return allPackages;
  }

  /**
   * Get recommended package based on organisation size
   */
  async getRecommendedPackage(organisationSize: string): Promise<Package> {
    let recommendedType: 'health-check' | 'with-awareness' | 'with-dashboard' = 'health-check';

    switch (organisationSize) {
      case 'small': // 1-50 employees
        recommendedType = 'health-check'; // Basic Health Check
        break;
      case 'medium': // 51-250 employees
        recommendedType = 'with-awareness'; // Health Check + Training
        break;
      case 'large': // 251+ employees
        recommendedType = 'with-dashboard'; // Full Dashboard
        break;
      default:
        recommendedType = 'health-check';
    }

    const [pkg] = await db
      .select()
      .from(packages)
      .where(eq(packages.packageType, recommendedType))
      .limit(1);

    if (!pkg) {
      throw new Error('PACKAGE_NOT_FOUND');
    }

    return pkg;
  }

  /**
   * Create a purchase and Stripe Payment Intent
   */
  async createPurchase(input: CreatePurchaseInput): Promise<{
    purchase: Purchase;
    clientSecret: string;
  }> {
    const { organisationId, assessmentId, packageId, userId } = input;

    // Get package details
    const [pkg] = await db.select().from(packages).where(eq(packages.packageId, packageId)).limit(1);

    if (!pkg) {
      throw new Error('PACKAGE_NOT_FOUND');
    }

    // Get organisation details
    const [org] = await db
      .select()
      .from(organisations)
      .where(eq(organisations.organisationId, organisationId))
      .limit(1);

    if (!org) {
      throw new Error('ORGANISATION_NOT_FOUND');
    }

    // Create Stripe Payment Intent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(parseFloat(pkg.price) * 100), // Convert to pence
      currency: 'gbp',
      metadata: {
        organisationId,
        assessmentId,
        packageId,
        packageName: pkg.name,
        organisationName: org.name,
      },
      description: `${pkg.name} - ${org.name}`,
    });

    // Create purchase record
    const [purchase] = await db
      .insert(purchases)
      .values({
        organisationId,
        assessmentId,
        packageId,
        amount: pkg.price,
        currency: 'GBP',
        status: 'pending',
        transactionReference: paymentIntent.id,
      })
      .returning();

    return {
      purchase,
      clientSecret: paymentIntent.client_secret!,
    };
  }

  /**
   * Confirm a purchase after successful payment
   */
  async confirmPurchase(input: ConfirmPurchaseInput): Promise<Purchase> {
    const { purchaseId, paymentIntentId } = input;

    // Get purchase
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.purchaseId, purchaseId))
      .limit(1);

    if (!purchase) {
      throw new Error('PURCHASE_NOT_FOUND');
    }

    if (purchase.status === 'success') {
      return purchase; // Already confirmed
    }

    // Verify payment with Stripe
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('PAYMENT_NOT_COMPLETED');
    }

    // Get package details to determine key-pass allocation
    const [pkg] = await db
      .select()
      .from(packages)
      .where(eq(packages.packageId, purchase.packageId))
      .limit(1);

    if (!pkg) {
      throw new Error('PACKAGE_NOT_FOUND');
    }

    // Update purchase status
    const [updatedPurchase] = await db
      .update(purchases)
      .set({
        status: 'success',
        updatedAt: new Date(),
      })
      .where(eq(purchases.purchaseId, purchaseId))
      .returning();

    // Update organisation package type
    await db
      .update(organisations)
      .set({
        packageType: pkg.packageType,
        updatedAt: new Date(),
      })
      .where(eq(organisations.organisationId, purchase.organisationId));

    // Allocate key-passes based on package
    const keypassCount = pkg.maxKeypassesDefault || 0;
    if (keypassCount > 0) {
      await this.keypassService.allocateKeypasses({
        organisationId: purchase.organisationId,
        quantity: keypassCount,
        expiryDays: 90, // 3 months expiry
      });
    }

    return updatedPurchase;
  }

  /**
   * Get purchase by ID
   */
  async getPurchaseById(purchaseId: string): Promise<Purchase | null> {
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.purchaseId, purchaseId))
      .limit(1);

    return purchase || null;
  }

  /**
   * Get all purchases for an organisation
   */
  async getOrganisationPurchases(organisationId: string): Promise<Purchase[]> {
    const results = await db
      .select()
      .from(purchases)
      .where(eq(purchases.organisationId, organisationId))
      .orderBy(purchases.createdAt);

    return results;
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(
    payload: string,
    signature: string
  ): Promise<{ received: boolean; message?: string }> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message);
      throw new Error('INVALID_SIGNATURE');
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment succeeded: ${paymentIntent.id}`);

        // Find purchase by payment intent ID
        const [purchase] = await db
          .select()
          .from(purchases)
          .where(eq(purchases.transactionReference, paymentIntent.id))
          .limit(1);

        if (purchase && purchase.status === 'pending') {
          await this.confirmPurchase({
            purchaseId: purchase.purchaseId,
            paymentIntentId: paymentIntent.id,
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error(`Payment failed: ${paymentIntent.id}`);

        // Update purchase status to failed
        await db
          .update(purchases)
          .set({
            status: 'failed',
            updatedAt: new Date(),
          })
          .where(eq(purchases.transactionReference, paymentIntent.id));
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true, message: `Webhook processed: ${event.type}` };
  }

  /**
   * Refund a purchase
   */
  async refundPurchase(purchaseId: string, reason?: string): Promise<Purchase> {
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.purchaseId, purchaseId))
      .limit(1);

    if (!purchase) {
      throw new Error('PURCHASE_NOT_FOUND');
    }

    if (purchase.status !== 'success') {
      throw new Error('PURCHASE_NOT_COMPLETED');
    }

    if (!purchase.transactionReference) {
      throw new Error('NO_PAYMENT_INTENT');
    }

    // Create refund in Stripe
    const refund = await this.stripe.refunds.create({
      payment_intent: purchase.transactionReference,
      reason: reason === 'fraudulent' ? 'fraudulent' : 'requested_by_customer',
    });

    // Update purchase status
    const [updatedPurchase] = await db
      .update(purchases)
      .set({
        status: 'refunded',
        updatedAt: new Date(),
      })
      .where(eq(purchases.purchaseId, purchaseId))
      .returning();

    return updatedPurchase;
  }
}
