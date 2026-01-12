/**
 * ECCTA 2023 Compliance Reporting Service
 *
 * Automated compliance reporting for Economic Crime and Corporate Transparency Act 2023
 * Generates reports demonstrating "reasonable prevention procedures" for fraud prevention
 */

import { db, sql as rawSql } from '../db/connection.js';
import { AuditLogger, AuditEventType, AuditSeverity } from './auditLogger.js';
import { DataRetentionService } from './dataRetention.js';

export interface ECCTA2023Report {
  organisationId: string;
  organisationName: string;
  reportPeriod: {
    startDate: Date;
    endDate: Date;
  };
  generatedAt: Date;

  // Section 1: Governance & Risk Management
  governance: {
    assessmentsCompleted: number;
    riskRegistersUpdated: number;
    highRisksIdentified: number;
    highRisksResolved: number;
    fraudResponsePlansActive: boolean;
  };

  // Section 2: Due Diligence & Controls
  dueDiligence: {
    employeeAssessmentsCompleted: number;
    trainingSessionsDelivered: number;
    employeesCertified: number;
    controlsImplemented: number;
    controlsEffectiveness: number; // percentage
  };

  // Section 3: Communication & Training
  communication: {
    policyUpdatesIssued: number;
    awarenessTrainingAttendance: number;
    fraudReportsReceived: number;
    whistleblowingCasesHandled: number;
  };

  // Section 4: Monitoring & Review
  monitoring: {
    auditLogsRecorded: number;
    securityIncidents: number;
    dataAccessReviews: number;
    complianceReviewsConducted: number;
  };

  // Section 5: Data Retention Compliance
  dataRetention: {
    totalRecords: number;
    archivedRecords: number;
    recordsScheduledForDeletion: number;
    retentionPolicyCompliance: number; // percentage
  };

  // Section 6: Risk Scoring Summary
  riskSummary: {
    averageInherentRisk: number;
    averageResidualRisk: number;
    riskReductionPercentage: number;
    topRiskCategories: Array<{
      category: string;
      count: number;
      averageScore: number;
    }>;
  };

  // Section 7: Compliance Status
  complianceStatus: {
    overallCompliance: 'compliant' | 'partial' | 'non-compliant';
    gaps: string[];
    recommendations: string[];
  };
}

export class ECCTA2023ComplianceReporter {
  /**
   * Generate comprehensive ECCTA 2023 compliance report
   */
  static async generateReport(
    organisationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ECCTA2023Report> {
    console.log('[ECCTA 2023] Generating compliance report...', {
      organisationId,
      startDate,
      endDate,
    });

    // Get organisation details
    const orgResult = await rawSql`
      SELECT organisation_id as id, name
      FROM organisations
      WHERE organisation_id = ${organisationId}
    `;

    if (orgResult.length === 0) {
      throw new Error('Organisation not found');
    }

    const organisation = orgResult[0];

    // Section 1: Governance & Risk Management
    const governance = await this.getGovernanceMetrics(
      organisationId,
      startDate,
      endDate
    );

    // Section 2: Due Diligence & Controls
    const dueDiligence = await this.getDueDiligenceMetrics(
      organisationId,
      startDate,
      endDate
    );

    // Section 3: Communication & Training
    const communication = await this.getCommunicationMetrics(
      organisationId,
      startDate,
      endDate
    );

    // Section 4: Monitoring & Review
    const monitoring = await this.getMonitoringMetrics(
      organisationId,
      startDate,
      endDate
    );

    // Section 5: Data Retention Compliance
    const dataRetention = await DataRetentionService.generateComplianceReport();

    // Section 6: Risk Scoring Summary
    const riskSummary = await this.getRiskSummary(
      organisationId,
      startDate,
      endDate
    );

    // Section 7: Compliance Status
    const complianceStatus = this.assessComplianceStatus({
      governance,
      dueDiligence,
      communication,
      monitoring,
      dataRetention,
      riskSummary,
    });

    const report: ECCTA2023Report = {
      organisationId,
      organisationName: organisation.name,
      reportPeriod: { startDate, endDate },
      generatedAt: new Date(),
      governance,
      dueDiligence,
      communication,
      monitoring,
      dataRetention: {
        totalRecords: dataRetention.totalRecords,
        archivedRecords: dataRetention.archivedRecords,
        recordsScheduledForDeletion: dataRetention.recordsDueForDeletion,
        retentionPolicyCompliance:
          dataRetention.policyCompliance.filter((p) => p.compliant).length /
          dataRetention.policyCompliance.length *
          100,
      },
      riskSummary,
      complianceStatus,
    };

    // Log report generation
    await AuditLogger.log({
      eventType: AuditEventType.COMPLIANCE_REPORT,
      organisationId,
      severity: AuditSeverity.INFO,
      details: {
        reportPeriod: { startDate, endDate },
        overallCompliance: complianceStatus.overallCompliance,
      },
      timestamp: new Date(),
      success: true,
    });

    console.log('[ECCTA 2023] Report generated successfully', {
      overallCompliance: complianceStatus.overallCompliance,
    });

    return report;
  }

  /**
   * Get governance and risk management metrics
   */
  private static async getGovernanceMetrics(
    organisationId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Assessments completed
    const assessmentsResult = await rawSql`
      SELECT COUNT(*) as count
      FROM assessments
      WHERE organisation_id = ${organisationId}
      AND status = 'submitted'
      AND submitted_at BETWEEN ${startDate} AND ${endDate}
    `;
    const assessmentsCompleted = parseInt(assessmentsResult[0].count);

    // Risk register updates
    const riskRegisterResult = await rawSql`
      SELECT COUNT(*) as count
      FROM risk_register_items
      WHERE organisation_id = ${organisationId}
      AND updated_at BETWEEN ${startDate} AND ${endDate}
    `;
    const riskRegistersUpdated = parseInt(riskRegisterResult[0].count);

    // High risks identified
    const highRisksResult = await rawSql`
      SELECT COUNT(*) as count
      FROM risk_register_items
      WHERE organisation_id = ${organisationId}
      AND priority = 'high'
      AND created_at BETWEEN ${startDate} AND ${endDate}
    `;
    const highRisksIdentified = parseInt(highRisksResult[0].count);

    // High risks resolved (mitigated or residual score reduced below 15)
    const highRisksResolvedResult = await rawSql`
      SELECT COUNT(*) as count
      FROM risk_register_items
      WHERE organisation_id = ${organisationId}
      AND priority = 'high'
      AND residual_risk_score < 15
      AND updated_at BETWEEN ${startDate} AND ${endDate}
    `;
    const highRisksResolved = parseInt(highRisksResolvedResult[0].count);

    // Fraud response plans active
    const fraudResponseResult = await rawSql`
      SELECT COUNT(*) as count
      FROM assessments
      WHERE organisation_id = ${organisationId}
      AND status = 'submitted'
      AND assessment_data->'fraudResponse' IS NOT NULL
    `;
    const fraudResponsePlansActive = parseInt(fraudResponseResult[0].count) > 0;

    return {
      assessmentsCompleted,
      riskRegistersUpdated,
      highRisksIdentified,
      highRisksResolved,
      fraudResponsePlansActive,
    };
  }

  /**
   * Get due diligence and controls metrics
   */
  private static async getDueDiligenceMetrics(
    organisationId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Employee assessments completed
    const employeeAssessmentsResult = await rawSql`
      SELECT COUNT(*) as count
      FROM employee_assessments
      WHERE organisation_id = ${organisationId}
      AND status = 'completed'
      AND completed_at BETWEEN ${startDate} AND ${endDate}
    `;
    const employeeAssessmentsCompleted = parseInt(
      employeeAssessmentsResult[0].count
    );

    // Training sessions delivered (Package 2/3)
    const trainingResult = await rawSql`
      SELECT COUNT(*) as count
      FROM assessments
      WHERE organisation_id = ${organisationId}
      AND assessment_data->'trainingAwareness'->'q1' = '"yes"'
      AND submitted_at BETWEEN ${startDate} AND ${endDate}
    `;
    const trainingSessionsDelivered = parseInt(trainingResult[0].count);

    // Employees certified (completed training)
    const employeesCertified = employeeAssessmentsCompleted;

    // Controls implemented (from controls-technology module)
    const controlsResult = await rawSql`
      SELECT
        COUNT(*) FILTER (WHERE assessment_data->'controlsTechnology'->'q1' IN ('"strong"', '"reasonable"')) as implemented,
        COUNT(*) as total
      FROM assessments
      WHERE organisation_id = ${organisationId}
      AND submitted_at BETWEEN ${startDate} AND ${endDate}
    `;
    const controlsImplemented = parseInt(controlsResult[0].implemented);
    const totalAssessments = parseInt(controlsResult[0].total);
    const controlsEffectiveness =
      totalAssessments > 0 ? (controlsImplemented / totalAssessments) * 100 : 0;

    return {
      employeeAssessmentsCompleted,
      trainingSessionsDelivered,
      employeesCertified,
      controlsImplemented,
      controlsEffectiveness,
    };
  }

  /**
   * Get communication and training metrics
   */
  private static async getCommunicationMetrics(
    organisationId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Policy updates issued (from audit logs)
    const policyUpdatesResult = await rawSql`
      SELECT COUNT(*) as count
      FROM audit_logs
      WHERE organisation_id = ${organisationId}
      AND event_type LIKE 'policy.%'
      AND created_at BETWEEN ${startDate} AND ${endDate}
    `;
    const policyUpdatesIssued = parseInt(policyUpdatesResult[0].count);

    // Awareness training attendance (employee assessments)
    const trainingAttendanceResult = await rawSql`
      SELECT COUNT(*) as count
      FROM employee_assessments
      WHERE organisation_id = ${organisationId}
      AND status = 'completed'
      AND completed_at BETWEEN ${startDate} AND ${endDate}
    `;
    const awarenessTrainingAttendance = parseInt(
      trainingAttendanceResult[0].count
    );

    // Fraud reports received (from fraud response module)
    const fraudReportsResult = await rawSql`
      SELECT COUNT(*) as count
      FROM risk_register_items
      WHERE organisation_id = ${organisationId}
      AND category = 'fraud_incident'
      AND created_at BETWEEN ${startDate} AND ${endDate}
    `;
    const fraudReportsReceived = parseInt(fraudReportsResult[0].count);

    // Whistleblowing cases handled
    const whistleblowingResult = await rawSql`
      SELECT COUNT(*) as count
      FROM risk_register_items
      WHERE organisation_id = ${organisationId}
      AND category = 'whistleblowing'
      AND created_at BETWEEN ${startDate} AND ${endDate}
    `;
    const whistleblowingCasesHandled = parseInt(
      whistleblowingResult[0].count
    );

    return {
      policyUpdatesIssued,
      awarenessTrainingAttendance,
      fraudReportsReceived,
      whistleblowingCasesHandled,
    };
  }

  /**
   * Get monitoring and review metrics
   */
  private static async getMonitoringMetrics(
    organisationId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Audit logs recorded
    const auditLogsResult = await rawSql`
      SELECT COUNT(*) as count
      FROM audit_logs
      WHERE organisation_id = ${organisationId}
      AND created_at BETWEEN ${startDate} AND ${endDate}
    `;
    const auditLogsRecorded = parseInt(auditLogsResult[0].count);

    // Security incidents
    const securityIncidentsResult = await rawSql`
      SELECT COUNT(*) as count
      FROM audit_logs
      WHERE organisation_id = ${organisationId}
      AND severity IN ('error', 'critical')
      AND event_type LIKE 'security.%'
      AND created_at BETWEEN ${startDate} AND ${endDate}
    `;
    const securityIncidents = parseInt(securityIncidentsResult[0].count);

    // Data access reviews
    const dataAccessReviewsResult = await rawSql`
      SELECT COUNT(*) as count
      FROM audit_logs
      WHERE organisation_id = ${organisationId}
      AND event_type = 'data.exported'
      AND created_at BETWEEN ${startDate} AND ${endDate}
    `;
    const dataAccessReviews = parseInt(dataAccessReviewsResult[0].count);

    // Compliance reviews conducted
    const complianceReviewsResult = await rawSql`
      SELECT COUNT(*) as count
      FROM assessments
      WHERE organisation_id = ${organisationId}
      AND status = 'submitted'
      AND assessment_data->'complianceMapping' IS NOT NULL
      AND submitted_at BETWEEN ${startDate} AND ${endDate}
    `;
    const complianceReviewsConducted = parseInt(
      complianceReviewsResult[0].count
    );

    return {
      auditLogsRecorded,
      securityIncidents,
      dataAccessReviews,
      complianceReviewsConducted,
    };
  }

  /**
   * Get risk scoring summary
   */
  private static async getRiskSummary(
    organisationId: string,
    startDate: Date,
    endDate: Date
  ) {
    // Average inherent and residual risk
    const riskScoresResult = await rawSql`
      SELECT
        AVG(inherent_risk_score) as avg_inherent,
        AVG(residual_risk_score) as avg_residual
      FROM risk_register_items
      WHERE organisation_id = ${organisationId}
      AND created_at BETWEEN ${startDate} AND ${endDate}
    `;

    const avgInherent = parseFloat(riskScoresResult[0].avg_inherent) || 0;
    const avgResidual = parseFloat(riskScoresResult[0].avg_residual) || 0;
    const riskReductionPercentage =
      avgInherent > 0 ? ((avgInherent - avgResidual) / avgInherent) * 100 : 0;

    // Top risk categories
    const topCategoriesResult = await rawSql`
      SELECT
        category,
        COUNT(*) as count,
        AVG(residual_risk_score) as avg_score
      FROM risk_register_items
      WHERE organisation_id = ${organisationId}
      AND created_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY category
      ORDER BY count DESC
      LIMIT 5
    `;

    const topRiskCategories = topCategoriesResult.map((row: any) => ({
      category: row.category,
      count: parseInt(row.count),
      averageScore: parseFloat(row.avg_score),
    }));

    return {
      averageInherentRisk: avgInherent,
      averageResidualRisk: avgResidual,
      riskReductionPercentage,
      topRiskCategories,
    };
  }

  /**
   * Assess overall compliance status
   */
  private static assessComplianceStatus(metrics: any): {
    overallCompliance: 'compliant' | 'partial' | 'non-compliant';
    gaps: string[];
    recommendations: string[];
  } {
    const gaps: string[] = [];
    const recommendations: string[] = [];

    // Check governance metrics
    if (metrics.governance.assessmentsCompleted === 0) {
      gaps.push('No fraud risk assessments completed in reporting period');
      recommendations.push(
        'Complete at least one comprehensive fraud risk assessment quarterly'
      );
    }

    if (
      metrics.governance.highRisksIdentified > 0 &&
      metrics.governance.highRisksResolved === 0
    ) {
      gaps.push('High-priority risks identified but not resolved');
      recommendations.push(
        'Implement action plans to mitigate or reduce high-priority fraud risks'
      );
    }

    if (!metrics.governance.fraudResponsePlansActive) {
      gaps.push('No active fraud response plan documented');
      recommendations.push(
        'Document and maintain an up-to-date fraud response plan'
      );
    }

    // Check due diligence metrics
    if (metrics.dueDiligence.controlsEffectiveness < 70) {
      gaps.push('Control effectiveness below recommended threshold (70%)');
      recommendations.push(
        'Strengthen fraud prevention controls to improve effectiveness'
      );
    }

    if (metrics.dueDiligence.trainingSessionsDelivered === 0) {
      gaps.push('No fraud awareness training delivered');
      recommendations.push(
        'Implement regular fraud awareness training for all employees'
      );
    }

    // Check monitoring metrics
    if (metrics.monitoring.auditLogsRecorded === 0) {
      gaps.push('Insufficient audit logging for compliance tracking');
      recommendations.push(
        'Ensure comprehensive audit logging is enabled for all critical operations'
      );
    }

    if (metrics.monitoring.securityIncidents > 5) {
      gaps.push('High number of security incidents detected');
      recommendations.push(
        'Conduct security review and strengthen access controls'
      );
    }

    // Check data retention
    if (metrics.dataRetention.retentionPolicyCompliance < 95) {
      gaps.push('Data retention policy compliance below 95%');
      recommendations.push(
        'Review and enforce 6-year data retention policy across all systems'
      );
    }

    // Determine overall compliance
    let overallCompliance: 'compliant' | 'partial' | 'non-compliant';

    if (gaps.length === 0) {
      overallCompliance = 'compliant';
    } else if (gaps.length <= 3) {
      overallCompliance = 'partial';
    } else {
      overallCompliance = 'non-compliant';
    }

    return {
      overallCompliance,
      gaps,
      recommendations,
    };
  }

  /**
   * Export report to JSON format
   */
  static async exportReportJSON(report: ECCTA2023Report): Promise<string> {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Export report to HTML format (for PDF generation)
   */
  static async exportReportHTML(report: ECCTA2023Report): Promise<string> {
    const statusColor =
      report.complianceStatus.overallCompliance === 'compliant'
        ? '#00703C'
        : report.complianceStatus.overallCompliance === 'partial'
        ? '#F47738'
        : '#D4351C';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ECCTA 2023 Compliance Report</title>
  <style>
    body {
      font-family: "GDS Transport", Arial, sans-serif;
      line-height: 1.6;
      color: #0b0c0c;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #1d70b8; font-size: 32px; }
    h2 { color: #1d70b8; font-size: 24px; margin-top: 30px; }
    h3 { color: #0b0c0c; font-size: 19px; margin-top: 20px; }
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      background: ${statusColor};
      color: white;
      font-weight: bold;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .metric {
      background: #f3f2f1;
      padding: 15px;
      margin: 10px 0;
      border-left: 4px solid #1d70b8;
    }
    .metric-label { font-weight: bold; color: #505a5f; }
    .metric-value { font-size: 24px; color: #0b0c0c; }
    .gap {
      background: #fff7f0;
      border-left: 4px solid #f47738;
      padding: 10px;
      margin: 10px 0;
    }
    .recommendation {
      background: #f0f4f5;
      border-left: 4px solid #00703c;
      padding: 10px;
      margin: 10px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #b1b4b6;
    }
    th { background: #f3f2f1; font-weight: bold; }
  </style>
</head>
<body>
  <h1>ECCTA 2023 Compliance Report</h1>

  <div>
    <p><strong>Organisation:</strong> ${report.organisationName}</p>
    <p><strong>Report Period:</strong> ${report.reportPeriod.startDate.toLocaleDateString()} - ${report.reportPeriod.endDate.toLocaleDateString()}</p>
    <p><strong>Generated:</strong> ${report.generatedAt.toLocaleString()}</p>
    <p><strong>Overall Compliance Status:</strong> <span class="status-badge">${report.complianceStatus.overallCompliance}</span></p>
  </div>

  <h2>1. Governance & Risk Management</h2>
  <div class="metric">
    <div class="metric-label">Assessments Completed</div>
    <div class="metric-value">${report.governance.assessmentsCompleted}</div>
  </div>
  <div class="metric">
    <div class="metric-label">High Risks Identified / Resolved</div>
    <div class="metric-value">${report.governance.highRisksIdentified} / ${report.governance.highRisksResolved}</div>
  </div>
  <div class="metric">
    <div class="metric-label">Fraud Response Plans Active</div>
    <div class="metric-value">${report.governance.fraudResponsePlansActive ? 'Yes' : 'No'}</div>
  </div>

  <h2>2. Due Diligence & Controls</h2>
  <div class="metric">
    <div class="metric-label">Employee Assessments Completed</div>
    <div class="metric-value">${report.dueDiligence.employeeAssessmentsCompleted}</div>
  </div>
  <div class="metric">
    <div class="metric-label">Training Sessions Delivered</div>
    <div class="metric-value">${report.dueDiligence.trainingSessionsDelivered}</div>
  </div>
  <div class="metric">
    <div class="metric-label">Controls Effectiveness</div>
    <div class="metric-value">${report.dueDiligence.controlsEffectiveness.toFixed(1)}%</div>
  </div>

  <h2>3. Communication & Training</h2>
  <div class="metric">
    <div class="metric-label">Policy Updates Issued</div>
    <div class="metric-value">${report.communication.policyUpdatesIssued}</div>
  </div>
  <div class="metric">
    <div class="metric-label">Awareness Training Attendance</div>
    <div class="metric-value">${report.communication.awarenessTrainingAttendance}</div>
  </div>
  <div class="metric">
    <div class="metric-label">Fraud Reports Received</div>
    <div class="metric-value">${report.communication.fraudReportsReceived}</div>
  </div>

  <h2>4. Monitoring & Review</h2>
  <div class="metric">
    <div class="metric-label">Audit Logs Recorded</div>
    <div class="metric-value">${report.monitoring.auditLogsRecorded}</div>
  </div>
  <div class="metric">
    <div class="metric-label">Security Incidents</div>
    <div class="metric-value">${report.monitoring.securityIncidents}</div>
  </div>
  <div class="metric">
    <div class="metric-label">Compliance Reviews Conducted</div>
    <div class="metric-value">${report.monitoring.complianceReviewsConducted}</div>
  </div>

  <h2>5. Data Retention Compliance</h2>
  <div class="metric">
    <div class="metric-label">Total Records / Archived</div>
    <div class="metric-value">${report.dataRetention.totalRecords} / ${report.dataRetention.archivedRecords}</div>
  </div>
  <div class="metric">
    <div class="metric-label">Retention Policy Compliance</div>
    <div class="metric-value">${report.dataRetention.retentionPolicyCompliance.toFixed(1)}%</div>
  </div>

  <h2>6. Risk Scoring Summary</h2>
  <div class="metric">
    <div class="metric-label">Average Inherent Risk</div>
    <div class="metric-value">${report.riskSummary.averageInherentRisk.toFixed(2)}</div>
  </div>
  <div class="metric">
    <div class="metric-label">Average Residual Risk</div>
    <div class="metric-value">${report.riskSummary.averageResidualRisk.toFixed(2)}</div>
  </div>
  <div class="metric">
    <div class="metric-label">Risk Reduction</div>
    <div class="metric-value">${report.riskSummary.riskReductionPercentage.toFixed(1)}%</div>
  </div>

  <h3>Top Risk Categories</h3>
  <table>
    <thead>
      <tr>
        <th>Category</th>
        <th>Count</th>
        <th>Average Score</th>
      </tr>
    </thead>
    <tbody>
      ${report.riskSummary.topRiskCategories
        .map(
          (cat) => `
        <tr>
          <td>${cat.category}</td>
          <td>${cat.count}</td>
          <td>${cat.averageScore.toFixed(2)}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <h2>7. Compliance Gaps & Recommendations</h2>
  ${
    report.complianceStatus.gaps.length > 0
      ? `
    <h3>Identified Gaps</h3>
    ${report.complianceStatus.gaps.map((gap) => `<div class="gap">${gap}</div>`).join('')}
  `
      : '<p>No compliance gaps identified.</p>'
  }

  ${
    report.complianceStatus.recommendations.length > 0
      ? `
    <h3>Recommendations</h3>
    ${report.complianceStatus.recommendations.map((rec) => `<div class="recommendation">${rec}</div>`).join('')}
  `
      : ''
  }

  <hr style="margin-top: 40px;">
  <p style="font-size: 14px; color: #505a5f;">
    This report is generated automatically by the Stop FRA platform in compliance with the
    Economic Crime and Corporate Transparency Act 2023. It demonstrates the organisation's
    reasonable prevention procedures for fraud prevention.
  </p>
</body>
</html>
    `.trim();
  }
}
