import { Hono } from 'hono';
import { KeypassController } from '../controllers/keypass.controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.middleware.js';
import { rateLimit } from '../middleware/rateLimit.middleware.js';

const keypassRoutes = new Hono();
const keypassController = new KeypassController();

// Public endpoints (no authentication required)
keypassRoutes.post(
  '/validate',
  rateLimit({ windowMs: 60_000, max: 10, keyPrefix: 'keypass:validate' }),
  keypassController.validateKeypass
);
keypassRoutes.post(
  '/use',
  rateLimit({ windowMs: 60_000, max: 10, keyPrefix: 'keypass:use' }),
  keypassController.useKeypass
);

// Protected endpoints (require authentication)
keypassRoutes.use('*', authMiddleware);

// Allocate key-passes (employers and admins only)
keypassRoutes.post(
  '/allocate',
  requireRole('employer', 'admin'),
  keypassController.allocateKeypasses
);

// Get organisation key-passes
keypassRoutes.get(
  '/organisation/:orgId',
  keypassController.getOrganisationKeypasses
);

// Get key-pass statistics
keypassRoutes.get(
  '/organisation/:orgId/stats',
  keypassController.getKeypassStats
);

// Revoke key-passes
keypassRoutes.post(
  '/revoke',
  requireRole('employer', 'admin'),
  keypassController.revokeKeypasses
);

export default keypassRoutes;
