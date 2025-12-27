import { Context } from 'hono';
import { z } from 'zod';
import { PaymentService } from '../services/payment.service';

const createPurchaseSchema = z.object({
  organisationId: z.string().uuid(),
  packageId: z.string().uuid(),
});

const confirmPurchaseSchema = z.object({
  paymentIntentId: z.string(),
});

const refundPurchaseSchema = z.object({
  reason: z.enum(['fraudulent', 'requested_by_customer']).optional(),
});

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * GET /api/v1/packages
   * Get all available packages
   */
  getPackages = async (c: Context) => {
    try {
      const packages = await this.paymentService.getPackages();

      return c.json({
        success: true,
        data: { packages },
      });
    } catch (error: any) {
      console.error('Get packages error:', error);

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to retrieve packages',
          },
        },
        500
      );
    }
  };

  /**
   * GET /api/v1/packages/recommended
   * Get recommended package based on organisation size
   */
  getRecommendedPackage = async (c: Context) => {
    try {
      const size = c.req.query('size') || 'small';

      const pkg = await this.paymentService.getRecommendedPackage(size);

      return c.json({
        success: true,
        data: { package: pkg },
      });
    } catch (error: any) {
      console.error('Get recommended package error:', error);

      if (error.message === 'PACKAGE_NOT_FOUND') {
        return c.json(
          {
            success: false,
            error: {
              code: 'PACKAGE_NOT_FOUND',
              message: 'No packages available',
            },
          },
          404
        );
      }

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to get recommendation',
          },
        },
        500
      );
    }
  };

  /**
   * POST /api/v1/purchases
   * Create a new purchase
   */
  createPurchase = async (c: Context) => {
    try {
      const user = c.get('user');
      const body = await c.req.json();

      // Validate input
      const validated = createPurchaseSchema.parse(body);

      // Verify user has access to organisation
      if (user.role !== 'admin' && user.organisationId !== validated.organisationId) {
        return c.json(
          {
            success: false,
            error: {
              code: 'ORGANISATION_ACCESS_DENIED',
              message: 'You do not have access to this organisation',
            },
          },
          403
        );
      }

      const result = await this.paymentService.createPurchase({
        ...validated,
        userId: user.userId,
      });

      return c.json(
        {
          success: true,
          data: {
            purchase: result.purchase,
            clientSecret: result.clientSecret,
          },
          message: 'Payment intent created successfully',
        },
        201
      );
    } catch (error: any) {
      console.error('Create purchase error:', error);

      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: error.errors,
            },
          },
          400
        );
      }

      if (error.message === 'PACKAGE_NOT_FOUND') {
        return c.json(
          {
            success: false,
            error: {
              code: 'PACKAGE_NOT_FOUND',
              message: 'The selected package does not exist',
            },
          },
          404
        );
      }

      if (error.message === 'ORGANISATION_NOT_FOUND') {
        return c.json(
          {
            success: false,
            error: {
              code: 'ORGANISATION_NOT_FOUND',
              message: 'Organisation not found',
            },
          },
          404
        );
      }

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to create purchase',
          },
        },
        500
      );
    }
  };

  /**
   * POST /api/v1/purchases/:id/confirm
   * Confirm a purchase after payment
   */
  confirmPurchase = async (c: Context) => {
    try {
      const user = c.get('user');
      const purchaseId = c.req.param('id');
      const body = await c.req.json();

      // Validate input
      const validated = confirmPurchaseSchema.parse(body);

      // Get purchase to verify access
      const existingPurchase = await this.paymentService.getPurchaseById(purchaseId);

      if (!existingPurchase) {
        return c.json(
          {
            success: false,
            error: {
              code: 'PURCHASE_NOT_FOUND',
              message: 'Purchase not found',
            },
          },
          404
        );
      }

      // Verify user has access
      if (user.role !== 'admin' && user.organisationId !== existingPurchase.organisationId) {
        return c.json(
          {
            success: false,
            error: {
              code: 'ORGANISATION_ACCESS_DENIED',
              message: 'You do not have access to this purchase',
            },
          },
          403
        );
      }

      const purchase = await this.paymentService.confirmPurchase({
        purchaseId,
        paymentIntentId: validated.paymentIntentId,
      });

      return c.json({
        success: true,
        data: { purchase },
        message: 'Payment confirmed successfully',
      });
    } catch (error: any) {
      console.error('Confirm purchase error:', error);

      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: error.errors,
            },
          },
          400
        );
      }

      if (error.message === 'PURCHASE_NOT_FOUND') {
        return c.json(
          {
            success: false,
            error: {
              code: 'PURCHASE_NOT_FOUND',
              message: 'Purchase not found',
            },
          },
          404
        );
      }

      if (error.message === 'PAYMENT_NOT_COMPLETED') {
        return c.json(
          {
            success: false,
            error: {
              code: 'PAYMENT_NOT_COMPLETED',
              message: 'Payment has not been completed',
            },
          },
          400
        );
      }

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to confirm purchase',
          },
        },
        500
      );
    }
  };

  /**
   * GET /api/v1/purchases/:id
   * Get purchase by ID
   */
  getPurchase = async (c: Context) => {
    try {
      const user = c.get('user');
      const purchaseId = c.req.param('id');

      const purchase = await this.paymentService.getPurchaseById(purchaseId);

      if (!purchase) {
        return c.json(
          {
            success: false,
            error: {
              code: 'PURCHASE_NOT_FOUND',
              message: 'Purchase not found',
            },
          },
          404
        );
      }

      // Verify access
      if (user.role !== 'admin' && user.organisationId !== purchase.organisationId) {
        return c.json(
          {
            success: false,
            error: {
              code: 'ORGANISATION_ACCESS_DENIED',
              message: 'You do not have access to this purchase',
            },
          },
          403
        );
      }

      return c.json({
        success: true,
        data: { purchase },
      });
    } catch (error: any) {
      console.error('Get purchase error:', error);

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to retrieve purchase',
          },
        },
        500
      );
    }
  };

  /**
   * GET /api/v1/purchases/organisation/:orgId
   * Get all purchases for an organisation
   */
  getOrganisationPurchases = async (c: Context) => {
    try {
      const user = c.get('user');
      const orgId = c.req.param('orgId');

      // Verify access
      if (user.role !== 'admin' && user.organisationId !== orgId) {
        return c.json(
          {
            success: false,
            error: {
              code: 'ORGANISATION_ACCESS_DENIED',
              message: 'You do not have access to this organisation',
            },
          },
          403
        );
      }

      const purchases = await this.paymentService.getOrganisationPurchases(orgId);

      return c.json({
        success: true,
        data: { purchases },
      });
    } catch (error: any) {
      console.error('Get organisation purchases error:', error);

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to retrieve purchases',
          },
        },
        500
      );
    }
  };

  /**
   * POST /api/v1/purchases/:id/refund
   * Refund a purchase (admin only)
   */
  refundPurchase = async (c: Context) => {
    try {
      const purchaseId = c.req.param('id');
      const body = await c.req.json();

      // Validate input
      const validated = refundPurchaseSchema.parse(body);

      const purchase = await this.paymentService.refundPurchase(
        purchaseId,
        validated.reason
      );

      return c.json({
        success: true,
        data: { purchase },
        message: 'Refund processed successfully',
      });
    } catch (error: any) {
      console.error('Refund purchase error:', error);

      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: error.errors,
            },
          },
          400
        );
      }

      if (error.message === 'PURCHASE_NOT_FOUND') {
        return c.json(
          {
            success: false,
            error: {
              code: 'PURCHASE_NOT_FOUND',
              message: 'Purchase not found',
            },
          },
          404
        );
      }

      if (error.message === 'PURCHASE_NOT_COMPLETED') {
        return c.json(
          {
            success: false,
            error: {
              code: 'PURCHASE_NOT_COMPLETED',
              message: 'Cannot refund incomplete purchase',
            },
          },
          400
        );
      }

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to process refund',
          },
        },
        500
      );
    }
  };

  /**
   * POST /api/v1/webhooks/stripe
   * Handle Stripe webhook events
   */
  handleStripeWebhook = async (c: Context) => {
    try {
      const payload = await c.req.text();
      const signature = c.req.header('stripe-signature');

      if (!signature) {
        return c.json(
          {
            success: false,
            error: {
              code: 'MISSING_SIGNATURE',
              message: 'Stripe signature header is missing',
            },
          },
          400
        );
      }

      const result = await this.paymentService.handleWebhook(payload, signature);

      return c.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Stripe webhook error:', error);

      if (error.message === 'INVALID_SIGNATURE') {
        return c.json(
          {
            success: false,
            error: {
              code: 'INVALID_SIGNATURE',
              message: 'Invalid webhook signature',
            },
          },
          400
        );
      }

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to process webhook',
          },
        },
        500
      );
    }
  };
}
