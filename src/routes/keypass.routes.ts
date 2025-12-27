import { Hono } from 'hono';
import { KeypassController } from '../controllers/keypass.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const keypassRoutes = new Hono();
const keypassController = new KeypassController();

// Public endpoints (no authentication required)
keypassRoutes.post('/validate', keypassController.validateKeypass);
keypassRoutes.post('/use', keypassController.useKeypass);

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
