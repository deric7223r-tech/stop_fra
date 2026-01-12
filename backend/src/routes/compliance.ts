/**
 * Compliance API Routes
 *
 * ECCTA 2023 compliance reporting endpoints
 * Audit log querying and data retention status
 */

import { Hono } from 'hono';
import { ECCTA2023ComplianceReporter } from '../services/complianceReporting.js';
import { AuditLogger } from '../services/auditLogger.js';
import { DataRetentionService } from '../services/dataRetention.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const compliance = new Hono();

// Apply authentication to all routes
compliance.use('*', authMiddleware);

/**
 * GET /api/compliance/report
 * Generate ECCTA 2023 compliance report for organisation
 */
compliance.get('/report', async (c) => {
  try {
    const user = c.get('user');
    const organisationId = user.organisationId;

    if (!organisationId) {
      return c.json({ error: 'Organisation not found' }, 403);
    }

    // Get date range from query params (default to last 90 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const startParam = c.req.query('startDate');
    const endParam = c.req.query('endDate');

    if (startParam) {
      startDate.setTime(new Date(startParam).getTime());
    }
    if (endParam) {
      endDate.setTime(new Date(endParam).getTime());
    }

    // Generate report
    const report = await ECCTA2023ComplianceReporter.generateReport(
      organisationId,
      startDate,
      endDate
    );

    return c.json(report);
  } catch (error: any) {
    console.error('[COMPLIANCE] Report generation error:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /api/compliance/report/html
 * Generate ECCTA 2023 compliance report in HTML format
 */
compliance.get('/report/html', async (c) => {
  try {
    const user = c.get('user');
    const organisationId = user.organisationId;

    if (!organisationId) {
      return c.json({ error: 'Organisation not found' }, 403);
    }

    // Get date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const startParam = c.req.query('startDate');
    const endParam = c.req.query('endDate');

    if (startParam) {
      startDate.setTime(new Date(startParam).getTime());
    }
    if (endParam) {
      endDate.setTime(new Date(endParam).getTime());
    }

    // Generate report
    const report = await ECCTA2023ComplianceReporter.generateReport(
      organisationId,
      startDate,
      endDate
    );

    // Export as HTML
    const html = await ECCTA2023ComplianceReporter.exportReportHTML(report);

    return c.html(html);
  } catch (error: any) {
    console.error('[COMPLIANCE] HTML report generation error:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /api/compliance/report/json
 * Generate ECCTA 2023 compliance report in JSON format (for download)
 */
compliance.get('/report/json', async (c) => {
  try {
    const user = c.get('user');
    const organisationId = user.organisationId;

    if (!organisationId) {
      return c.json({ error: 'Organisation not found' }, 403);
    }

    // Get date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const startParam = c.req.query('startDate');
    const endParam = c.req.query('endDate');

    if (startParam) {
      startDate.setTime(new Date(startParam).getTime());
    }
    if (endParam) {
      endDate.setTime(new Date(endParam).getTime());
    }

    // Generate report
    const report = await ECCTA2023ComplianceReporter.generateReport(
      organisationId,
      startDate,
      endDate
    );

    // Export as JSON string
    const json = await ECCTA2023ComplianceReporter.exportReportJSON(report);

    // Return as downloadable file
    c.header('Content-Type', 'application/json');
    c.header(
      'Content-Disposition',
      `attachment; filename="eccta-compliance-report-${report.organisationName.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.json"`
    );

    return c.body(json);
  } catch (error: any) {
    console.error('[COMPLIANCE] JSON report generation error:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /api/compliance/audit-logs
 * Query audit logs for organisation
 */
compliance.get('/audit-logs', async (c) => {
  try {
    const user = c.get('user');
    const organisationId = user.organisationId;

    if (!organisationId) {
      return c.json({ error: 'Organisation not found' }, 403);
    }

    // Get query parameters
    const startDate = c.req.query('startDate')
      ? new Date(c.req.query('startDate')!)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = c.req.query('endDate')
      ? new Date(c.req.query('endDate')!)
      : new Date();
    const eventType = c.req.query('eventType');
    const severity = c.req.query('severity');
    const limit = parseInt(c.req.query('limit') || '100');

    // Query audit logs
    const logs = await AuditLogger.query({
      organisationId,
      startDate,
      endDate,
      eventType: eventType as any,
      severity: severity as any,
      limit,
    });

    return c.json({ logs, count: logs.length });
  } catch (error: any) {
    console.error('[COMPLIANCE] Audit log query error:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /api/compliance/audit-logs/summary
 * Get audit log summary for organisation
 */
compliance.get('/audit-logs/summary', async (c) => {
  try {
    const user = c.get('user');
    const organisationId = user.organisationId;

    if (!organisationId) {
      return c.json({ error: 'Organisation not found' }, 403);
    }

    const startDate = c.req.query('startDate')
      ? new Date(c.req.query('startDate')!)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = c.req.query('endDate')
      ? new Date(c.req.query('endDate')!)
      : new Date();

    const summary = await AuditLogger.generateComplianceReport(
      organisationId,
      startDate,
      endDate
    );

    return c.json(summary);
  } catch (error: any) {
    console.error('[COMPLIANCE] Audit summary error:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /api/compliance/data-retention
 * Get data retention compliance status
 */
compliance.get('/data-retention', async (c) => {
  try {
    const report = await DataRetentionService.generateComplianceReport();
    return c.json(report);
  } catch (error: any) {
    console.error('[COMPLIANCE] Data retention report error:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /api/compliance/data-retention/status/:table/:recordId
 * Get retention status for specific record
 */
compliance.get('/data-retention/status/:table/:recordId', async (c) => {
  try {
    const tableName = c.req.param('table');
    const recordId = c.req.param('recordId');

    const status = await DataRetentionService.getRetentionStatus(
      tableName,
      recordId
    );

    if (!status) {
      return c.json({ error: 'Record not found' }, 404);
    }

    return c.json(status);
  } catch (error: any) {
    console.error('[COMPLIANCE] Retention status error:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /api/compliance/data-retention/run
 * Manually trigger data retention job (admin only)
 */
compliance.post('/data-retention/run', async (c) => {
  try {
    const user = c.get('user');

    // Check if user is admin
    if (user.role !== 'admin') {
      return c.json({ error: 'Unauthorized - admin only' }, 403);
    }

    const result = await DataRetentionService.runRetentionJob();

    return c.json({
      message: 'Data retention job completed',
      ...result,
    });
  } catch (error: any) {
    console.error('[COMPLIANCE] Manual retention job error:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default compliance;
