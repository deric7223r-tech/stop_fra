import { Context } from 'hono';
import { z } from 'zod';
import { KeypassService } from '../services/keypass.service.js';

const allocateKeypassesSchema = z.object({
  organisationId: z.string().uuid(),
  quantity: z.number().int().min(1).max(1000),
  expiryDays: z.number().int().min(1).max(365).optional(),
});

const validateKeypassSchema = z.object({
  code: z.string().length(12),
});

const useKeypassSchema = z.object({
  code: z.string().length(12),
  employeeEmail: z.string().email(),
  employeeName: z.string().min(1).max(255),
});

const revokeKeypassesSchema = z.object({
  keypassIds: z.array(z.string().uuid()),
});

export class KeypassController {
  private keypassService: KeypassService;

  constructor() {
    this.keypassService = new KeypassService();
  }

  /**
   * POST /api/v1/keypasses/allocate
   * Allocate key-passes to an organisation
   */
  allocateKeypasses = async (c: Context) => {
    try {
      const user = c.get('user');
      const body = await c.req.json();

      // Validate input
      const validated = allocateKeypassesSchema.parse(body);

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

      const keypasses = await this.keypassService.allocateKeypasses(validated);

      return c.json(
        {
          success: true,
          data: {
            keypasses,
            count: keypasses.length,
          },
          message: `${keypasses.length} key-passes allocated successfully`,
        },
        201
      );
    } catch (error: any) {
      console.error('Allocate keypasses error:', error);

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

      if (error.message === 'INVALID_QUANTITY') {
        return c.json(
          {
            success: false,
            error: {
              code: 'INVALID_QUANTITY',
              message: 'Quantity must be between 1 and 1000',
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
            message: 'Failed to allocate key-passes',
          },
        },
        500
      );
    }
  };

  /**
   * POST /api/v1/keypasses/validate
   * Validate a key-pass code (public endpoint for employees)
   */
  validateKeypass = async (c: Context) => {
    try {
      const body = await c.req.json();

      // Validate input
      const validated = validateKeypassSchema.parse(body);

      const result = await this.keypassService.validateKeypass(validated);

      if (!result.valid) {
        return c.json(
          {
            success: false,
            error: {
              code: result.reason,
              message: this.getKeypassErrorMessage(result.reason),
            },
          },
          400
        );
      }

      return c.json({
        success: true,
        data: {
          valid: true,
          organisationId: result.keypass?.organisationId,
        },
      });
    } catch (error: any) {
      console.error('Validate keypass error:', error);

      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid key-pass code format',
              details: error.errors,
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
            message: 'Failed to validate key-pass',
          },
        },
        500
      );
    }
  };

  /**
   * POST /api/v1/keypasses/use
   * Use a key-pass to start employee assessment (public endpoint)
   */
  useKeypass = async (c: Context) => {
    try {
      const body = await c.req.json();

      // Validate input
      const validated = useKeypassSchema.parse(body);

      const result = await this.keypassService.useKeypass(validated);

      return c.json(
        {
          success: true,
          data: {
            employeeAssessmentId: result.employeeAssessmentId,
            organisationId: result.keypass.organisationId,
          },
          message: 'Key-pass used successfully. You can now start your assessment.',
        },
        201
      );
    } catch (error: any) {
      console.error('Use keypass error:', error);

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

      if (
        ['KEYPASS_NOT_FOUND', 'KEYPASS_ALREADY_USED', 'KEYPASS_EXPIRED', 'INVALID_KEYPASS'].includes(
          error.message
        )
      ) {
        return c.json(
          {
            success: false,
            error: {
              code: error.message,
              message: this.getKeypassErrorMessage(error.message),
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
            message: 'Failed to use key-pass',
          },
        },
        500
      );
    }
  };

  /**
   * GET /api/v1/keypasses/organisation/:orgId
   * Get all key-passes for an organisation
   */
  getOrganisationKeypasses = async (c: Context) => {
    try {
      const user = c.get('user');
      const orgId = c.req.param('orgId');
      const status = c.req.query('status') as 'unused' | 'used' | 'expired' | undefined;

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

      const keypasses = await this.keypassService.getOrganisationKeypasses(orgId, status);

      return c.json({
        success: true,
        data: {
          keypasses,
          count: keypasses.length,
        },
      });
    } catch (error: any) {
      console.error('Get organisation keypasses error:', error);

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to retrieve key-passes',
          },
        },
        500
      );
    }
  };

  /**
   * GET /api/v1/keypasses/organisation/:orgId/stats
   * Get key-pass usage statistics
   */
  getKeypassStats = async (c: Context) => {
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

      const stats = await this.keypassService.getKeypassStats(orgId);

      return c.json({
        success: true,
        data: { stats },
      });
    } catch (error: any) {
      console.error('Get keypass stats error:', error);

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
            message: 'Failed to retrieve statistics',
          },
        },
        500
      );
    }
  };

  /**
   * POST /api/v1/keypasses/revoke
   * Revoke/expire key-passes
   */
  revokeKeypasses = async (c: Context) => {
    try {
      const user = c.get('user');
      const body = await c.req.json();

      // Validate input
      const validated = revokeKeypassesSchema.parse(body);

      // For now, we'll need to verify access per keypass
      // This is a simplified version - in production you'd want to check organisation access
      if (user.role !== 'admin' && user.role !== 'employer') {
        return c.json(
          {
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: 'You do not have permission to revoke key-passes',
            },
          },
          403
        );
      }

      // If not admin, verify all keypasses belong to user's organisation
      if (user.role !== 'admin' && user.organisationId) {
        const revokedCount = await this.keypassService.bulkRevokeKeypasses(
          user.organisationId,
          validated.keypassIds
        );

        return c.json({
          success: true,
          data: { revokedCount },
          message: `${revokedCount} key-passes revoked successfully`,
        });
      }

      // Admin can revoke any keypasses (implement individual revoke for cross-org)
      let revokedCount = 0;
      for (const keypassId of validated.keypassIds) {
        try {
          await this.keypassService.revokeKeypass(keypassId);
          revokedCount++;
        } catch (error) {
          console.error(`Failed to revoke keypass ${keypassId}:`, error);
        }
      }

      return c.json({
        success: true,
        data: { revokedCount },
        message: `${revokedCount} key-passes revoked successfully`,
      });
    } catch (error: any) {
      console.error('Revoke keypasses error:', error);

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

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to revoke key-passes',
          },
        },
        500
      );
    }
  };

  /**
   * Helper method to get user-friendly error messages
   */
  private getKeypassErrorMessage(reason?: string): string {
    switch (reason) {
      case 'KEYPASS_NOT_FOUND':
        return 'The key-pass code you entered does not exist. Please check and try again.';
      case 'KEYPASS_ALREADY_USED':
        return 'This key-pass has already been used and cannot be used again.';
      case 'KEYPASS_EXPIRED':
        return 'This key-pass has expired. Please contact your employer for a new key-pass.';
      case 'INVALID_KEYPASS':
        return 'Invalid key-pass code. Please check and try again.';
      default:
        return 'Unable to validate key-pass. Please try again.';
    }
  }
}
