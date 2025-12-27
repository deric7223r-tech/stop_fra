/**
 * Audit Logging Service
 *
 * Comprehensive audit trail for all critical operations
 * Complies with GovS-013 and ECCTA 2023 requirements
 */

import { db, sql as rawSql } from '../db/connection';

export enum AuditEventType {
  // Authentication Events
  AUTH_LOGIN = 'auth.login',
  AUTH_LOGOUT = 'auth.logout',
  AUTH_FAILED_LOGIN = 'auth.failed_login',
  AUTH_PASSWORD_CHANGE = 'auth.password_change',
  AUTH_PASSWORD_RESET = 'auth.password_reset',

  // Assessment Events
  ASSESSMENT_CREATED = 'assessment.created',
  ASSESSMENT_UPDATED = 'assessment.updated',
  ASSESSMENT_SUBMITTED = 'assessment.submitted',
  ASSESSMENT_VIEWED = 'assessment.viewed',
  ASSESSMENT_DELETED = 'assessment.deleted',

  // User Management
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_ROLE_CHANGED = 'user.role_changed',

  // Organisation Events
  ORG_CREATED = 'organisation.created',
  ORG_UPDATED = 'organisation.updated',
  ORG_DELETED = 'organisation.deleted',

  // Payment Events
  PAYMENT_INITIATED = 'payment.initiated',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_REFUNDED = 'payment.refunded',

  // Key-Pass Events
  KEYPASS_GENERATED = 'keypass.generated',
  KEYPASS_USED = 'keypass.used',
  KEYPASS_REVOKED = 'keypass.revoked',

  // Data Access Events
  DATA_EXPORTED = 'data.exported',
  DATA_DELETED = 'data.deleted',
  DATA_ACCESSED = 'data.accessed',

  // System Events
  SYSTEM_CONFIG_CHANGE = 'system.config_change',
  SYSTEM_ERROR = 'system.error',
  SYSTEM_BACKUP = 'system.backup',

  // Compliance Events
  COMPLIANCE_REPORT = 'compliance.report',
}

export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface AuditLogEntry {
  eventType: AuditEventType;
  userId?: string;
  organisationId?: string;
  severity: AuditSeverity;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

export class AuditLogger {
  /**
   * Log an audit event
   */
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      await rawSql`INSERT INTO audit_logs (
          event_type,
          user_id,
          organisation_id,
          severity,
          ip_address,
          user_agent,
          details,
          success,
          error_message,
          created_at
        ) VALUES (${entry.eventType}, ${entry.userId || null},
          ${entry.organisationId || null},
          ${entry.severity},
          ${entry.ipAddress || null},
          ${entry.userAgent || null},
          ${JSON.stringify(entry.details)},
          ${entry.success},
          ${entry.errorMessage || null},
          ${entry.timestamp || new Date()}
        )`;

      // Log to console in development
      if (process.env.NODE_ENV !== 'production') {
        console.log('[AUDIT]', {
          type: entry.eventType,
          user: entry.userId,
          success: entry.success,
          details: entry.details,
        });
      }
    } catch (error) {
      // Critical: audit logging failure should be logged to system logs
      console.error('[AUDIT LOGGER ERROR]', error);
      // Don't throw - we don't want audit logging failures to break application flow
    }
  }

  /**
   * Log authentication events
   */
  static async logAuth(
    eventType: AuditEventType,
    userId: string | undefined,
    success: boolean,
    ipAddress: string,
    userAgent: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.log({
      eventType,
      userId,
      severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
      ipAddress,
      userAgent,
      details,
      timestamp: new Date(),
      success,
      errorMessage: success ? undefined : details.error,
    });
  }

  /**
   * Log assessment events
   */
  static async logAssessment(
    eventType: AuditEventType,
    userId: string,
    organisationId: string,
    assessmentId: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.log({
      eventType,
      userId,
      organisationId,
      severity: AuditSeverity.INFO,
      details: {
        assessmentId,
        ...details,
      },
      timestamp: new Date(),
      success: true,
    });
  }

  /**
   * Log payment events
   */
  static async logPayment(
    eventType: AuditEventType,
    userId: string,
    organisationId: string,
    success: boolean,
    details: Record<string, any>
  ): Promise<void> {
    await this.log({
      eventType,
      userId,
      organisationId,
      severity: success ? AuditSeverity.INFO : AuditSeverity.ERROR,
      details,
      timestamp: new Date(),
      success,
      errorMessage: success ? undefined : details.error,
    });
  }

  /**
   * Log data access events (GDPR compliance)
   */
  static async logDataAccess(
    eventType: AuditEventType,
    userId: string,
    organisationId: string | undefined,
    dataType: string,
    recordIds: string[],
    ipAddress: string
  ): Promise<void> {
    await this.log({
      eventType,
      userId,
      organisationId,
      severity: AuditSeverity.INFO,
      ipAddress,
      details: {
        dataType,
        recordIds,
        recordCount: recordIds.length,
      },
      timestamp: new Date(),
      success: true,
    });
  }

  /**
   * Log critical system events
   */
  static async logCritical(
    eventType: AuditEventType,
    details: Record<string, any>,
    errorMessage?: string
  ): Promise<void> {
    await this.log({
      eventType,
      severity: AuditSeverity.CRITICAL,
      details,
      timestamp: new Date(),
      success: false,
      errorMessage,
    });

    // In production, this should trigger alerts (PagerDuty, Slack, etc.)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with alerting system
      console.error('[CRITICAL EVENT]', eventType, details, errorMessage);
    }
  }

  /**
   * Query audit logs (for compliance reporting)
   */
  static async query(filters: {
    userId?: string;
    organisationId?: string;
    eventType?: AuditEventType;
    startDate?: Date;
    endDate?: Date;
    severity?: AuditSeverity;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      params.push(filters.userId);
    }

    if (filters.organisationId) {
      conditions.push(`organisation_id = $${paramIndex++}`);
      params.push(filters.organisationId);
    }

    if (filters.eventType) {
      conditions.push(`event_type = $${paramIndex++}`);
      params.push(filters.eventType);
    }

    if (filters.startDate) {
      conditions.push(`created_at >= $${paramIndex++}`);
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      conditions.push(`created_at <= $${paramIndex++}`);
      params.push(filters.endDate);
    }

    if (filters.severity) {
      conditions.push(`severity = $${paramIndex++}`);
      params.push(filters.severity);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    // Build dynamic query using postgres.js
    const query = `SELECT * FROM audit_logs ${whereClause} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const result = await rawSql.unsafe(query, params);

    return result;
  }

  /**
   * Generate audit report for compliance (ECCTA 2023)
   */
  static async generateComplianceReport(
    organisationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    summary: any;
    criticalEvents: any[];
    assessmentActivity: any[];
    dataAccess: any[];
  }> {
    // Get all logs for the period
    const logs = await this.query({
      organisationId,
      startDate,
      endDate,
      limit: 10000,
    });

    // Categorize events
    const criticalEvents = logs.filter((log) => log.severity === AuditSeverity.CRITICAL);
    const assessmentActivity = logs.filter((log) =>
      log.event_type.startsWith('assessment.')
    );
    const dataAccess = logs.filter((log) => log.event_type.startsWith('data.'));

    // Generate summary statistics
    const summary = {
      totalEvents: logs.length,
      criticalEvents: criticalEvents.length,
      assessmentsCompleted: logs.filter(
        (log) => log.event_type === AuditEventType.ASSESSMENT_SUBMITTED
      ).length,
      failedLogins: logs.filter(
        (log) => log.event_type === AuditEventType.AUTH_FAILED_LOGIN
      ).length,
      dataExports: logs.filter(
        (log) => log.event_type === AuditEventType.DATA_EXPORTED
      ).length,
      period: { startDate, endDate },
      organisationId,
    };

    return {
      summary,
      criticalEvents,
      assessmentActivity,
      dataAccess,
    };
  }
}

/**
 * Middleware to automatically log HTTP requests
 */
export function auditMiddleware() {
  return async (c: any, next: any) => {
    const start = Date.now();
    const userId = c.get('userId'); // From JWT middleware
    const organisationId = c.get('organisationId');

    await next();

    // Log significant API calls
    const path = c.req.path;
    const method = c.req.method;
    const statusCode = c.res.status;

    // Only log write operations and authentication
    if (
      method !== 'GET' ||
      path.includes('/auth/') ||
      path.includes('/assessment/')
    ) {
      const success = statusCode < 400;

      let eventType: AuditEventType | undefined;

      // Map routes to event types
      if (path.includes('/auth/login')) {
        eventType = success
          ? AuditEventType.AUTH_LOGIN
          : AuditEventType.AUTH_FAILED_LOGIN;
      } else if (path.includes('/assessment') && method === 'POST') {
        eventType = AuditEventType.ASSESSMENT_CREATED;
      } else if (path.includes('/assessment') && method === 'PUT') {
        eventType = AuditEventType.ASSESSMENT_UPDATED;
      } else if (path.includes('/submit')) {
        eventType = AuditEventType.ASSESSMENT_SUBMITTED;
      }

      if (eventType) {
        await AuditLogger.log({
          eventType,
          userId,
          organisationId,
          severity: success ? AuditSeverity.INFO : AuditSeverity.WARNING,
          ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
          userAgent: c.req.header('user-agent'),
          details: {
            path,
            method,
            statusCode,
            duration: Date.now() - start,
          },
          timestamp: new Date(),
          success,
        });
      }
    }
  };
}
