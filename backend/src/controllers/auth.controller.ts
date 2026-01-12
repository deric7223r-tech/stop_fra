import { Context } from 'hono';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { db, users, organisations } from '../db/index.js';
import { eq } from 'drizzle-orm';

// Validation schemas
const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organisationName: z.string().min(2, 'Organisation name must be at least 2 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string(),
});

const keypassLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  keyPassCode: z.string().length(16, 'Invalid key-pass format'),
});

export class AuthController {
  /**
   * POST /api/v1/auth/signup
   * Register new employer account
   */
  async signup(c: Context) {
    try {
      const body = await c.req.json();
      const validation = signupSchema.safeParse(body);

      if (!validation.success) {
        return c.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: validation.error.errors,
            },
          },
          400
        );
      }

      const { email, password, organisationName } = validation.data;

      // Check if user already exists
      const existingUser = await authService.findUserByEmail(email);
      if (existingUser) {
        return c.json(
          {
            success: false,
            error: {
              code: 'EMAIL_EXISTS',
              message: 'An account with this email already exists',
            },
          },
          409
        );
      }

      // Validate password strength
      const passwordValidation = authService.validatePassword(password);
      if (!passwordValidation.valid) {
        return c.json(
          {
            success: false,
            error: {
              code: 'WEAK_PASSWORD',
              message: 'Password does not meet security requirements',
              details: passwordValidation.errors,
            },
          },
          400
        );
      }

      // Hash password
      const passwordHash = await authService.hashPassword(password);

      // Create organisation first
      const [organisation] = await db
        .insert(organisations)
        .values({
          name: organisationName,
        })
        .returning();

      // Create user
      const [user] = await db
        .insert(users)
        .values({
          email,
          passwordHash,
          name: organisationName,
          role: 'employer',
          organisationId: organisation.organisationId,
        })
        .returning();

      // Generate tokens
      const tokens = authService.generateTokens({
        userId: user.userId,
        email: user.email,
        role: user.role,
        organisationId: user.organisationId,
      });

      // Update last login
      await authService.updateLastLogin(user.userId);

      return c.json(
        {
          success: true,
          data: {
            user: {
              userId: user.userId,
              email: user.email,
              name: user.name,
              role: user.role,
              organisationId: user.organisationId,
            },
            organisation: {
              organisationId: organisation.organisationId,
              name: organisation.name,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          },
        },
        201
      );
    } catch (error) {
      console.error('Signup error:', error);
      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An error occurred during signup',
          },
        },
        500
      );
    }
  }

  /**
   * POST /api/v1/auth/login
   * Login with email and password
   */
  async login(c: Context) {
    try {
      const body = await c.req.json();
      const validation = loginSchema.safeParse(body);

      if (!validation.success) {
        return c.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: validation.error.errors,
            },
          },
          400
        );
      }

      const { email, password } = validation.data;

      // Find user
      const user = await authService.findUserByEmail(email);
      if (!user) {
        return c.json(
          {
            success: false,
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid email or password',
            },
          },
          401
        );
      }

      // Verify password
      const isPasswordValid = await authService.verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return c.json(
          {
            success: false,
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid email or password',
            },
          },
          401
        );
      }

      // Get organisation details
      let organisation = null;
      if (user.organisationId) {
        [organisation] = await db
          .select()
          .from(organisations)
          .where(eq(organisations.organisationId, user.organisationId))
          .limit(1);
      }

      // Generate tokens
      const tokens = authService.generateTokens({
        userId: user.userId,
        email: user.email,
        role: user.role,
        organisationId: user.organisationId,
      });

      // Update last login
      await authService.updateLastLogin(user.userId);

      return c.json({
        success: true,
        data: {
          user: {
            userId: user.userId,
            email: user.email,
            name: user.name,
            role: user.role,
            organisationId: user.organisationId,
          },
          organisation: organisation
            ? {
                organisationId: organisation.organisationId,
                name: organisation.name,
                type: organisation.type,
                packageType: organisation.packageType,
              }
            : null,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An error occurred during login',
          },
        },
        500
      );
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token using refresh token
   */
  async refresh(c: Context) {
    try {
      const body = await c.req.json();
      const { refreshToken } = body;

      if (!refreshToken) {
        return c.json(
          {
            success: false,
            error: {
              code: 'REFRESH_TOKEN_MISSING',
              message: 'Refresh token is required',
            },
          },
          400
        );
      }

      // Verify refresh token
      const payload = authService.verifyRefreshToken(refreshToken);

      // Generate new tokens
      const tokens = authService.generateTokens({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        organisationId: payload.organisationId,
      });

      return c.json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      return c.json(
        {
          success: false,
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token',
          },
        },
        401
      );
    }
  }

  /**
   * GET /api/v1/auth/me
   * Get current user information
   */
  async me(c: Context) {
    try {
      const user = c.get('user');
      const dbUser = await authService.findUserById(user.userId);

      if (!dbUser) {
        return c.json(
          {
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found',
            },
          },
          404
        );
      }

      return c.json({
        success: true,
        data: {
          userId: dbUser.userId,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          organisationId: dbUser.organisationId,
          createdAt: dbUser.createdAt,
        },
      });
    } catch (error) {
      console.error('Me endpoint error:', error);
      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'An error occurred',
          },
        },
        500
      );
    }
  }
}

export const authController = new AuthController();
