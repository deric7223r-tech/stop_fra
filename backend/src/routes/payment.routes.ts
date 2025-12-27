import { Hono } from 'hono';
import { PaymentController } from '../controllers/payment.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const paymentRoutes = new Hono();
const paymentController = new PaymentController();

// Public package endpoints (no authentication required)
paymentRoutes.get('/packages', paymentController.getPackages);
paymentRoutes.get('/packages/recommended', paymentController.getRecommendedPackage);

// Webhook endpoint (no authentication - verified by Stripe signature)
paymentRoutes.post('/webhooks/stripe', paymentController.handleStripeWebhook);

// Protected purchase endpoints (require authentication)
paymentRoutes.use('/purchases*', authMiddleware);

// Create purchase (employers and admins only)
paymentRoutes.post(
  '/purchases',
  requireRole('employer', 'admin'),
  paymentController.createPurchase
);

// Confirm purchase after payment
paymentRoutes.post('/purchases/:id/confirm', paymentController.confirmPurchase);

// Get purchase by ID
paymentRoutes.get('/purchases/:id', paymentController.getPurchase);

// Get organisation purchases
paymentRoutes.get(
  '/purchases/organisation/:orgId',
  paymentController.getOrganisationPurchases
);

// Refund purchase (admin only)
paymentRoutes.post(
  '/purchases/:id/refund',
  requireRole('admin'),
  paymentController.refundPurchase
);

export default paymentRoutes;
