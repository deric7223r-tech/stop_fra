import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, users } from '../db';
import { eq, and, isNull } from 'drizzle-orm';
import { validatePassword } from '../utils/password';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'employer' | 'employee' | 'admin';
  organisationId: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private readonly ACCESS_TOKEN_SECRET = process.env.JWT_SECRET!;
  private readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;
  private readonly ACCESS_TOKEN_EXPIRY: string = process.env.JWT_EXPIRES_IN || '24h';
  private readonly REFRESH_TOKEN_EXPIRY: string = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  private readonly SALT_ROUNDS = 12;

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate access and refresh tokens
   */
  generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = jwt.sign(
      payload,
      this.ACCESS_TOKEN_SECRET,
      { expiresIn: this.ACCESS_TOKEN_EXPIRY } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { ...payload, tokenType: 'refresh' },
      this.REFRESH_TOKEN_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, this.ACCESS_TOKEN_SECRET) as TokenPayload;
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, this.REFRESH_TOKEN_SECRET) as any;
      if (payload.tokenType !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        organisationId: payload.organisationId,
      };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Find user by email (excluding soft-deleted users)
   */
  async findUserByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    return user;
  }

  /**
   * Find user by ID (excluding soft-deleted users)
   */
  async findUserById(userId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.userId, userId), isNull(users.deletedAt)))
      .limit(1);

    return user;
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(userId: string) {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.userId, userId));
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    return validatePassword(password);
  }
}

export const authService = new AuthService();
