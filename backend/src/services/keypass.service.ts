import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db';
import { keypasses, organisations, employeeAssessments } from '../db/schema';
import crypto from 'crypto';

// Infer type from schema
type Keypass = typeof keypasses.$inferSelect;

export interface AllocateKeypassesInput {
  organisationId: string;
  quantity: number;
  expiryDays?: number; // Default 90 days
}

export interface ValidateKeypassInput {
  code: string;
}

export interface UseKeypassInput {
  code: string;
  employeeEmail: string;
  employeeName: string;
}

export class KeypassService {
  private readonly CODE_LENGTH = 12;
  private readonly DEFAULT_EXPIRY_DAYS = 90;

  /**
   * Generate a unique key-pass code
   */
  private generateKeypassCode(): string {
    // Generate a random string using crypto for security
    const buffer = crypto.randomBytes(Math.ceil((this.CODE_LENGTH * 3) / 4));
    return buffer
      .toString('base64')
      .replace(/\+/g, '0')
      .replace(/\//g, '0')
      .slice(0, this.CODE_LENGTH)
      .toUpperCase();
  }

  /**
   * Allocate key-passes to an organisation
   */
  async allocateKeypasses(input: AllocateKeypassesInput): Promise<Keypass[]> {
    const { organisationId, quantity, expiryDays = this.DEFAULT_EXPIRY_DAYS } = input;

    if (quantity <= 0 || quantity > 1000) {
      throw new Error('INVALID_QUANTITY');
    }

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // Generate unique codes
    const codes = new Set<string>();
    while (codes.size < quantity) {
      codes.add(this.generateKeypassCode());
    }

    // Insert key-passes
    const keypassValues = Array.from(codes).map((code) => ({
      organisationId,
      code,
      status: 'unused' as const,
      expiresAt,
    }));

    const createdKeypasses = await db.insert(keypasses).values(keypassValues).returning();

    // Update organisation key-pass count
    await db
      .update(organisations)
      .set({
        keypassesAllocated: sql`${organisations.keypassesAllocated} + ${quantity}`,
      })
      .where(eq(organisations.organisationId, organisationId));

    return createdKeypasses;
  }

  /**
   * Validate a key-pass code
   */
  async validateKeypass(input: ValidateKeypassInput): Promise<{
    valid: boolean;
    keypass?: Keypass;
    reason?: string;
  }> {
    const { code } = input;

    // Find key-pass
    const [keypass] = await db
      .select()
      .from(keypasses)
      .where(eq(keypasses.code, code))
      .limit(1);

    if (!keypass) {
      return {
        valid: false,
        reason: 'KEYPASS_NOT_FOUND',
      };
    }

    // Check if already used
    if (keypass.status === 'used') {
      return {
        valid: false,
        keypass,
        reason: 'KEYPASS_ALREADY_USED',
      };
    }

    // Check if expired
    if (keypass.expiresAt && new Date() > keypass.expiresAt) {
      return {
        valid: false,
        keypass,
        reason: 'KEYPASS_EXPIRED',
      };
    }

    return {
      valid: true,
      keypass,
    };
  }

  /**
   * Use a key-pass to create employee assessment
   * NOTE: Employee assessments functionality needs schema alignment
   */
  async useKeypass(input: UseKeypassInput): Promise<{
    keypass: Keypass;
    employeeAssessmentId?: string;
  }> {
    const { code, employeeEmail } = input;

    // Validate key-pass
    const validation = await this.validateKeypass({ code });

    if (!validation.valid) {
      throw new Error(validation.reason || 'INVALID_KEYPASS');
    }

    const keypass = validation.keypass!;

    // TODO: Create employee assessment when schema is updated
    // Employee assessments table needs: keypassId, employeeEmail, employeeName, status fields

    // Mark key-pass as used
    const [updatedKeypass] = await db
      .update(keypasses)
      .set({
        status: 'used',
        usedAt: new Date(),
        // usedByUserId would be set if we had a userId for the employee
      })
      .where(eq(keypasses.keypassId, keypass.keypassId))
      .returning();

    // Update organisation used key-pass count
    await db
      .update(organisations)
      .set({
        keypassesUsed: sql`${organisations.keypassesUsed} + 1`,
      })
      .where(eq(organisations.organisationId, keypass.organisationId));

    return {
      keypass: updatedKeypass,
      // employeeAssessmentId will be returned when schema is updated
    };
  }

  /**
   * Get key-passes for an organisation
   */
  async getOrganisationKeypasses(
    organisationId: string,
    status?: 'unused' | 'used' | 'expired'
  ): Promise<Keypass[]> {
    let query = db.select().from(keypasses).where(eq(keypasses.organisationId, organisationId));

    if (status) {
      query = query.where(
        and(eq(keypasses.organisationId, organisationId), eq(keypasses.status, status))
      );
    }

    const results = await query;

    return results;
  }

  /**
   * Get key-pass by code
   */
  async getKeypassByCode(code: string): Promise<Keypass | null> {
    const [keypass] = await db.select().from(keypasses).where(eq(keypasses.code, code)).limit(1);

    return keypass || null;
  }

  /**
   * Get key-pass usage statistics for an organisation
   */
  async getKeypassStats(organisationId: string): Promise<{
    allocated: number;
    used: number;
    unused: number;
    expired: number;
    usageRate: number;
  }> {
    const [org] = await db
      .select()
      .from(organisations)
      .where(eq(organisations.organisationId, organisationId))
      .limit(1);

    if (!org) {
      throw new Error('ORGANISATION_NOT_FOUND');
    }

    // Count unused and expired
    const allKeypasses = await db
      .select()
      .from(keypasses)
      .where(eq(keypasses.organisationId, organisationId));

    const now = new Date();
    let unused = 0;
    let expired = 0;

    for (const keypass of allKeypasses) {
      if (keypass.status === 'unused') {
        if (keypass.expiresAt && now > keypass.expiresAt) {
          expired++;
        } else {
          unused++;
        }
      }
    }

    const allocated = org.keypassesAllocated;
    const used = org.keypassesUsed;
    const usageRate = allocated > 0 ? (used / allocated) * 100 : 0;

    return {
      allocated,
      used,
      unused,
      expired,
      usageRate: Math.round(usageRate * 100) / 100, // Round to 2 decimal places
    };
  }

  /**
   * Revoke/expire a key-pass
   */
  async revokeKeypass(keypassId: string): Promise<Keypass> {
    const [keypass] = await db
      .update(keypasses)
      .set({
        status: 'expired',
      })
      .where(eq(keypasses.keypassId, keypassId))
      .returning();

    if (!keypass) {
      throw new Error('KEYPASS_NOT_FOUND');
    }

    return keypass;
  }

  /**
   * Bulk revoke key-passes for an organisation
   */
  async bulkRevokeKeypasses(organisationId: string, keypassIds: string[]): Promise<number> {
    if (keypassIds.length === 0) {
      return 0;
    }

    const result = await db
      .update(keypasses)
      .set({
        status: 'expired',
      })
      .where(
        and(
          eq(keypasses.organisationId, organisationId),
          sql`${keypasses.keypassId} = ANY(${keypassIds})`
        )
      );

    // Drizzle returns array length, not rowCount
    return Array.isArray(result) ? result.length : 0;
  }
}
