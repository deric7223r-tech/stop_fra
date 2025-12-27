import { Context, Next } from 'hono';
import { authService, TokenPayload } from '../services/auth.service';

declare module 'hono' {
  interface ContextVariableMap {
    user: TokenPayload;
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Authentication required',
        },
      },
      401
    );
  }

  const token = authHeader.substring(7);

  try {
    const payload = authService.verifyAccessToken(token);
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Invalid or expired token',
        },
      },
      401
    );
  }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(...allowedRoles: Array<'employer' | 'employee' | 'admin'>) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json(
        {
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Authentication required',
          },
        },
        401
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
          },
        },
        403
      );
    }

    await next();
  };
}

/**
 * Organisation access middleware - ensures user belongs to the organisation
 */
export function requireOrganisationAccess(orgIdParam: string = 'orgId') {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    const targetOrgId = c.req.param(orgIdParam);

    if (!user) {
      return c.json(
        {
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Authentication required',
          },
        },
        401
      );
    }

    // Admins can access any organisation
    if (user.role === 'admin') {
      await next();
      return;
    }

    // Check user belongs to organisation
    if (user.organisationId !== targetOrgId) {
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

    await next();
  };
}
