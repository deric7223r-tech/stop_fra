/**
 * Data Retention Policy Service
 *
 * Implements 6-year data retention as required by UK fraud prevention regulations
 * Automated archival and deletion processes
 */

import { db } from '../db/connection';
import { AuditLogger, AuditEventType, AuditSeverity } from './auditLogger';

export enum RetentionPolicy {
  // 6 years for fraud-related records (UK requirement)
  ASSESSMENTS = 6 * 365,
  AUDIT_LOGS = 6 * 365,
  RISK_REGISTER = 6 * 365,
  SIGNATURES = 6 * 365,

  // 7 years for financial records (UK tax requirement)
  PAYMENTS = 7 * 365,
  INVOICES = 7 * 365,

  // 2 years for operational data
  KEY_PASSES = 2 * 365,
  FEEDBACK = 2 * 365,

  // 90 days for session data
  SESSIONS = 90,
}

export interface RetentionRecord {
  tableName: string;
  recordId: string;
  retentionDays: number;
  createdAt: Date;
  deleteAt: Date;
  archived: boolean;
}

export class DataRetentionService {
  /**
   * Calculate deletion date based on retention policy
   */
  static calculateDeleteDate(createdAt: Date, retentionDays: number): Date {
    const deleteDate = new Date(createdAt);
    deleteDate.setDate(deleteDate.getDate() + retentionDays);
    return deleteDate;
  }

  /**
   * Archive old records (move to cold storage)
   */
  static async archiveOldRecords(
    tableName: string,
    retentionDays: number,
    archiveAfterDays: number = 365
  ): Promise<number> {
    const archiveDate = new Date();
    archiveDate.setDate(archiveDate.getDate() - archiveAfterDays);

    try {
      // Create archive table if it doesn't exist
      await db.query(`
        CREATE TABLE IF NOT EXISTS ${tableName}_archive (LIKE ${tableName} INCLUDING ALL);
      `);

      // Move old records to archive
      const result = await db.query(
        `WITH moved AS (
          DELETE FROM ${tableName}
          WHERE created_at < $1
          AND id NOT IN (SELECT record_id FROM ${tableName}_archive WHERE record_id = ${tableName}.id)
          RETURNING *
        )
        INSERT INTO ${tableName}_archive
        SELECT * FROM moved
        RETURNING id`,
        [archiveDate]
      );

      const archivedCount = result.rowCount || 0;

      if (archivedCount > 0) {
        await AuditLogger.log({
          eventType: AuditEventType.SYSTEM_BACKUP,
          severity: AuditSeverity.INFO,
          details: {
            tableName,
            archivedCount,
            archiveDate,
          },
          timestamp: new Date(),
          success: true,
        });
      }

      return archivedCount;
    } catch (error: any) {
      await AuditLogger.logCritical(
        AuditEventType.SYSTEM_ERROR,
        {
          operation: 'archiveOldRecords',
          tableName,
          error: error.message,
        },
        error.message
      );
      throw error;
    }
  }

  /**
   * Delete expired records (after retention period)
   */
  static async deleteExpiredRecords(
    tableName: string,
    retentionDays: number
  ): Promise<number> {
    const deleteDate = new Date();
    deleteDate.setDate(deleteDate.getDate() - retentionDays);

    try {
      // First, archive the records
      const archived = await this.archiveOldRecords(tableName, retentionDays);

      // Then, delete from archive if retention period expired
      const result = await db.query(
        `DELETE FROM ${tableName}_archive
         WHERE created_at < $1
         RETURNING id`,
        [deleteDate]
      );

      const deletedCount = result.rowCount || 0;

      if (deletedCount > 0) {
        await AuditLogger.log({
          eventType: AuditEventType.DATA_DELETED,
          severity: AuditSeverity.WARNING,
          details: {
            tableName,
            deletedCount,
            deleteDate,
            reason: 'Retention policy expired',
          },
          timestamp: new Date(),
          success: true,
        });
      }

      return deletedCount;
    } catch (error: any) {
      await AuditLogger.logCritical(
        AuditEventType.SYSTEM_ERROR,
        {
          operation: 'deleteExpiredRecords',
          tableName,
          error: error.message,
        },
        error.message
      );
      throw error;
    }
  }

  /**
   * Run data retention job (should be scheduled daily)
   */
  static async runRetentionJob(): Promise<{
    archived: Record<string, number>;
    deleted: Record<string, number>;
    errors: string[];
  }> {
    console.log('[DATA RETENTION] Starting retention job...');

    const archived: Record<string, number> = {};
    const deleted: Record<string, number> = {};
    const errors: string[] = [];

    // Process each table with its retention policy
    const policies = [
      { table: 'assessments', retentionDays: RetentionPolicy.ASSESSMENTS },
      { table: 'audit_logs', retentionDays: RetentionPolicy.AUDIT_LOGS },
      { table: 'risk_register_items', retentionDays: RetentionPolicy.RISK_REGISTER },
      { table: 'signatures', retentionDays: RetentionPolicy.SIGNATURES },
      { table: 'purchases', retentionDays: RetentionPolicy.PAYMENTS },
      { table: 'keypasses', retentionDays: RetentionPolicy.KEY_PASSES },
      { table: 'feedback', retentionDays: RetentionPolicy.FEEDBACK },
    ];

    for (const policy of policies) {
      try {
        // Archive records older than 1 year
        const archivedCount = await this.archiveOldRecords(
          policy.table,
          policy.retentionDays
        );
        archived[policy.table] = archivedCount;

        // Delete records past retention period
        const deletedCount = await this.deleteExpiredRecords(
          policy.table,
          policy.retentionDays
        );
        deleted[policy.table] = deletedCount;
      } catch (error: any) {
        const errorMsg = `${policy.table}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`[DATA RETENTION ERROR] ${errorMsg}`);
      }
    }

    console.log('[DATA RETENTION] Job completed', {
      archived,
      deleted,
      errors: errors.length,
    });

    // Log summary
    await AuditLogger.log({
      eventType: AuditEventType.SYSTEM_BACKUP,
      severity: errors.length > 0 ? AuditSeverity.WARNING : AuditSeverity.INFO,
      details: {
        archived,
        deleted,
        errors,
        completedAt: new Date(),
      },
      timestamp: new Date(),
      success: errors.length === 0,
      errorMessage: errors.length > 0 ? errors.join('; ') : undefined,
    });

    return { archived, deleted, errors };
  }

  /**
   * Get retention status for a specific record
   */
  static async getRetentionStatus(
    tableName: string,
    recordId: string
  ): Promise<{
    recordId: string;
    createdAt: Date;
    retentionDays: number;
    deleteAt: Date;
    daysUntilDeletion: number;
    archived: boolean;
  } | null> {
    // Get retention policy for table
    const retentionDays = (RetentionPolicy as any)[tableName.toUpperCase()] || 365;

    // Check main table
    let result = await db.query(
      `SELECT id, created_at FROM ${tableName} WHERE id = $1`,
      [recordId]
    );

    let archived = false;
    if (result.rowCount === 0) {
      // Check archive table
      result = await db.query(
        `SELECT id, created_at FROM ${tableName}_archive WHERE id = $1`,
        [recordId]
      );
      archived = true;
    }

    if (result.rowCount === 0) {
      return null;
    }

    const record = result.rows[0];
    const createdAt = new Date(record.created_at);
    const deleteAt = this.calculateDeleteDate(createdAt, retentionDays);
    const daysUntilDeletion = Math.ceil(
      (deleteAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return {
      recordId: record.id,
      createdAt,
      retentionDays,
      deleteAt,
      daysUntilDeletion,
      archived,
    };
  }

  /**
   * Generate retention compliance report
   */
  static async generateComplianceReport(): Promise<{
    totalRecords: number;
    archivedRecords: number;
    recordsDueForDeletion: number;
    policyCompliance: Array<{
      table: string;
      policy: string;
      totalRecords: number;
      expiredRecords: number;
      compliant: boolean;
    }>;
  }> {
    const policies = [
      { table: 'assessments', name: 'ASSESSMENTS', days: RetentionPolicy.ASSESSMENTS },
      { table: 'audit_logs', name: 'AUDIT_LOGS', days: RetentionPolicy.AUDIT_LOGS },
      { table: 'risk_register_items', name: 'RISK_REGISTER', days: RetentionPolicy.RISK_REGISTER },
      { table: 'signatures', name: 'SIGNATURES', days: RetentionPolicy.SIGNATURES },
      { table: 'purchases', name: 'PAYMENTS', days: RetentionPolicy.PAYMENTS },
    ];

    const policyCompliance = [];
    let totalRecords = 0;
    let archivedRecords = 0;
    let recordsDueForDeletion = 0;

    for (const policy of policies) {
      try {
        // Count main table records
        const mainResult = await db.query(
          `SELECT COUNT(*) as count FROM ${policy.table}`
        );
        const mainCount = parseInt(mainResult.rows[0].count);

        // Count archive table records
        let archiveCount = 0;
        try {
          const archiveResult = await db.query(
            `SELECT COUNT(*) as count FROM ${policy.table}_archive`
          );
          archiveCount = parseInt(archiveResult.rows[0].count);
        } catch {
          // Archive table might not exist yet
        }

        // Count expired records
        const deleteDate = new Date();
        deleteDate.setDate(deleteDate.getDate() - policy.days);

        const expiredResult = await db.query(
          `SELECT COUNT(*) as count FROM ${policy.table}
           WHERE created_at < $1`,
          [deleteDate]
        );
        const expiredCount = parseInt(expiredResult.rows[0].count);

        totalRecords += mainCount;
        archivedRecords += archiveCount;
        recordsDueForDeletion += expiredCount;

        policyCompliance.push({
          table: policy.table,
          policy: policy.name,
          totalRecords: mainCount + archiveCount,
          expiredRecords: expiredCount,
          compliant: expiredCount === 0, // Compliant if no expired records remain
        });
      } catch (error: any) {
        console.error(`Error checking ${policy.table}:`, error.message);
      }
    }

    return {
      totalRecords,
      archivedRecords,
      recordsDueForDeletion,
      policyCompliance,
    };
  }
}

/**
 * Schedule daily retention job (using cron or similar)
 */
export function scheduleRetentionJob() {
  // Run at 2 AM daily
  const schedule = '0 2 * * *'; // Cron expression

  console.log(`[DATA RETENTION] Scheduling daily job: ${schedule}`);

  // Using node-cron or similar
  // cron.schedule(schedule, async () => {
  //   await DataRetentionService.runRetentionJob();
  // });

  // For now, just provide the hook
  return {
    schedule,
    run: () => DataRetentionService.runRetentionJob(),
  };
}
