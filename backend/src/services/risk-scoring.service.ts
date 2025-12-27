import { type RiskRegisterItem } from '../db/schema';

export interface RiskFactor {
  riskIdCode: string;
  title: string;
  category: string;
  impact: number; // 1-5
  likelihood: number; // 1-5
  controlStrength: 'very_strong' | 'reasonably_strong' | 'weak_or_gaps';
}

export class RiskScoringService {
  /**
   * Calculate risk scores based on assessment answers
   */
  calculateRiskScores(
    assessmentId: string,
    answers: Record<string, any>
  ): Omit<RiskRegisterItem, 'riskItemId' | 'createdAt' | 'updatedAt'>[] {
    const riskFactors = this.extractRiskFactors(answers);
    const riskItems: Omit<RiskRegisterItem, 'riskItemId' | 'createdAt' | 'updatedAt'>[] = [];

    for (const factor of riskFactors) {
      // Calculate inherent risk score (Impact × Likelihood)
      const inherentScore = factor.impact * factor.likelihood;

      // Calculate control reduction percentage
      let controlReduction = 0;
      switch (factor.controlStrength) {
        case 'very_strong':
          controlReduction = 0.4; // 40% reduction
          break;
        case 'reasonably_strong':
          controlReduction = 0.2; // 20% reduction
          break;
        case 'weak_or_gaps':
          controlReduction = 0; // No reduction
          break;
      }

      // Calculate residual risk score
      const residualScore = Math.round(inherentScore * (1 - controlReduction));

      // Determine priority band
      const priority = this.calculatePriority(residualScore);

      riskItems.push({
        assessmentId,
        riskIdCode: factor.riskIdCode,
        title: factor.title,
        category: factor.category,
        impact: factor.impact,
        likelihood: factor.likelihood,
        inherentScore,
        residualScore,
        controlStrength: factor.controlStrength,
        priority,
      });
    }

    return riskItems;
  }

  /**
   * Calculate priority band based on residual score
   */
  calculatePriority(residualScore: number): string {
    if (residualScore >= 15) {
      return 'high';
    } else if (residualScore >= 8) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Calculate overall risk level for the entire assessment
   */
  calculateOverallRiskLevel(
    riskItems: Array<{ priority: string; residualScore: number }>
  ): string {
    if (riskItems.length === 0) {
      return 'low';
    }

    const highRiskCount = riskItems.filter((item) => item.priority === 'high').length;
    const mediumRiskCount = riskItems.filter((item) => item.priority === 'medium').length;

    // Calculate average residual score
    const avgResidualScore =
      riskItems.reduce((sum, item) => sum + item.residualScore, 0) / riskItems.length;

    // Determine overall risk level
    if (highRiskCount >= 3 || avgResidualScore >= 15) {
      return 'high';
    } else if (highRiskCount >= 1 || mediumRiskCount >= 3 || avgResidualScore >= 8) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Extract risk factors from assessment answers
   */
  private extractRiskFactors(answers: Record<string, any>): RiskFactor[] {
    const riskFactors: RiskFactor[] = [];

    // Risk Appetite Module
    if (answers['risk-appetite']) {
      const riskAppetite = answers['risk-appetite'];

      if (riskAppetite.riskTolerance === 'very_low' || riskAppetite.riskTolerance === 'low') {
        riskFactors.push({
          riskIdCode: 'RA-01',
          title: 'Low risk tolerance with potential fraud exposure',
          category: 'Risk Appetite',
          impact: 4,
          likelihood: riskAppetite.riskTolerance === 'very_low' ? 4 : 3,
          controlStrength: riskAppetite.hasRiskPolicy ? 'reasonably_strong' : 'weak_or_gaps',
        });
      }
    }

    // Fraud Triangle Module
    if (answers['fraud-triangle']) {
      const fraudTriangle = answers['fraud-triangle'];

      // Pressure/Incentive risks
      if (fraudTriangle.financialPressure?.includes('high_targets') ||
          fraudTriangle.financialPressure?.includes('performance_based_pay')) {
        riskFactors.push({
          riskIdCode: 'FT-01',
          title: 'Financial pressure on employees creating fraud incentive',
          category: 'Fraud Triangle - Pressure',
          impact: 4,
          likelihood: 4,
          controlStrength: fraudTriangle.hasWhistleblowing ? 'reasonably_strong' : 'weak_or_gaps',
        });
      }

      // Opportunity risks
      if (fraudTriangle.segregationOfDuties === 'no' ||
          fraudTriangle.segregationOfDuties === 'partial') {
        riskFactors.push({
          riskIdCode: 'FT-02',
          title: 'Lack of segregation of duties enabling fraud opportunity',
          category: 'Fraud Triangle - Opportunity',
          impact: 5,
          likelihood: 4,
          controlStrength: fraudTriangle.segregationOfDuties === 'partial' ? 'reasonably_strong' : 'weak_or_gaps',
        });
      }

      // Rationalization risks
      if (fraudTriangle.ethicalCulture === 'weak' || fraudTriangle.ethicalCulture === 'unclear') {
        riskFactors.push({
          riskIdCode: 'FT-03',
          title: 'Weak ethical culture enabling fraud rationalization',
          category: 'Fraud Triangle - Rationalization',
          impact: 4,
          likelihood: 3,
          controlStrength: fraudTriangle.hasCodeOfConduct ? 'reasonably_strong' : 'weak_or_gaps',
        });
      }
    }

    // Procurement Module
    if (answers['procurement']) {
      const procurement = answers['procurement'];

      if (procurement.supplierVetting === 'minimal' || procurement.supplierVetting === 'none') {
        riskFactors.push({
          riskIdCode: 'PR-01',
          title: 'Inadequate supplier vetting creating procurement fraud risk',
          category: 'Procurement',
          impact: 5,
          likelihood: 4,
          controlStrength: 'weak_or_gaps',
        });
      }

      if (procurement.poApprovalProcess === 'single_person' ||
          procurement.poApprovalProcess === 'informal') {
        riskFactors.push({
          riskIdCode: 'PR-02',
          title: 'Weak purchase order approval enabling procurement fraud',
          category: 'Procurement',
          impact: 4,
          likelihood: 4,
          controlStrength: procurement.poApprovalProcess === 'single_person' ? 'weak_or_gaps' : 'weak_or_gaps',
        });
      }
    }

    // Cash & Banking Module
    if (answers['cash-banking']) {
      const cashBanking = answers['cash-banking'];

      if (cashBanking.bankReconciliation === 'monthly' ||
          cashBanking.bankReconciliation === 'quarterly' ||
          cashBanking.bankReconciliation === 'rarely') {
        riskFactors.push({
          riskIdCode: 'CB-01',
          title: 'Infrequent bank reconciliation enabling cash fraud',
          category: 'Cash & Banking',
          impact: 5,
          likelihood: cashBanking.bankReconciliation === 'rarely' ? 5 : 3,
          controlStrength: cashBanking.bankReconciliation === 'monthly' ? 'reasonably_strong' : 'weak_or_gaps',
        });
      }

      if (cashBanking.paymentAuthorization === 'single' ||
          cashBanking.paymentAuthorization === 'none') {
        riskFactors.push({
          riskIdCode: 'CB-02',
          title: 'Inadequate payment authorization controls',
          category: 'Cash & Banking',
          impact: 5,
          likelihood: 5,
          controlStrength: 'weak_or_gaps',
        });
      }
    }

    // Payroll & HR Module
    if (answers['payroll-hr']) {
      const payrollHr = answers['payroll-hr'];

      if (payrollHr.ghostEmployeeControls === 'weak' ||
          payrollHr.ghostEmployeeControls === 'none') {
        riskFactors.push({
          riskIdCode: 'PH-01',
          title: 'Insufficient controls over ghost employee fraud',
          category: 'Payroll & HR',
          impact: 4,
          likelihood: 4,
          controlStrength: 'weak_or_gaps',
        });
      }

      if (payrollHr.timesheetApproval === 'self_certified' ||
          payrollHr.timesheetApproval === 'none') {
        riskFactors.push({
          riskIdCode: 'PH-02',
          title: 'Weak timesheet controls enabling payroll fraud',
          category: 'Payroll & HR',
          impact: 3,
          likelihood: 4,
          controlStrength: 'weak_or_gaps',
        });
      }
    }

    // Revenue Module
    if (answers['revenue']) {
      const revenue = answers['revenue'];

      if (revenue.cashHandlingControls === 'weak' ||
          revenue.cashHandlingControls === 'none') {
        riskFactors.push({
          riskIdCode: 'RV-01',
          title: 'Inadequate cash handling controls enabling revenue fraud',
          category: 'Revenue',
          impact: 5,
          likelihood: 4,
          controlStrength: 'weak_or_gaps',
        });
      }

      if (revenue.creditNoteApproval === 'single_person' ||
          revenue.creditNoteApproval === 'none') {
        riskFactors.push({
          riskIdCode: 'RV-02',
          title: 'Weak credit note approval enabling revenue manipulation',
          category: 'Revenue',
          impact: 4,
          likelihood: 3,
          controlStrength: 'weak_or_gaps',
        });
      }
    }

    // IT Systems Module
    if (answers['it-systems']) {
      const itSystems = answers['it-systems'];

      if (itSystems.accessControls === 'basic' ||
          itSystems.accessControls === 'none') {
        riskFactors.push({
          riskIdCode: 'IT-01',
          title: 'Weak IT access controls enabling system fraud',
          category: 'IT Systems',
          impact: 5,
          likelihood: 4,
          controlStrength: itSystems.accessControls === 'basic' ? 'weak_or_gaps' : 'weak_or_gaps',
        });
      }

      if (itSystems.dataBackup === 'monthly' ||
          itSystems.dataBackup === 'rarely' ||
          itSystems.dataBackup === 'none') {
        riskFactors.push({
          riskIdCode: 'IT-02',
          title: 'Inadequate data backup enabling fraud concealment',
          category: 'IT Systems',
          impact: 4,
          likelihood: 3,
          controlStrength: 'weak_or_gaps',
        });
      }
    }

    // People & Culture Module
    if (answers['people-culture']) {
      const peopleCulture = answers['people-culture'];

      if (peopleCulture.backgroundChecks === 'none' ||
          peopleCulture.backgroundChecks === 'senior_only') {
        riskFactors.push({
          riskIdCode: 'PC-01',
          title: 'Insufficient background checks enabling fraudster hiring',
          category: 'People & Culture',
          impact: 4,
          likelihood: 3,
          controlStrength: peopleCulture.backgroundChecks === 'senior_only' ? 'reasonably_strong' : 'weak_or_gaps',
        });
      }

      if (peopleCulture.fraudAwarenessTraining === 'none' ||
          peopleCulture.fraudAwarenessTraining === 'ad_hoc') {
        riskFactors.push({
          riskIdCode: 'PC-02',
          title: 'Lack of fraud awareness training',
          category: 'People & Culture',
          impact: 3,
          likelihood: 4,
          controlStrength: 'weak_or_gaps',
        });
      }
    }

    // Controls & Technology Module
    if (answers['controls-technology']) {
      const controlsTech = answers['controls-technology'];

      if (controlsTech.auditTrail === 'partial' ||
          controlsTech.auditTrail === 'none') {
        riskFactors.push({
          riskIdCode: 'CT-01',
          title: 'Inadequate audit trail for fraud detection',
          category: 'Controls & Technology',
          impact: 4,
          likelihood: 4,
          controlStrength: controlsTech.auditTrail === 'partial' ? 'weak_or_gaps' : 'weak_or_gaps',
        });
      }

      if (controlsTech.exceptionReporting === 'manual' ||
          controlsTech.exceptionReporting === 'none') {
        riskFactors.push({
          riskIdCode: 'CT-02',
          title: 'Weak exception monitoring enabling fraud concealment',
          category: 'Controls & Technology',
          impact: 4,
          likelihood: 3,
          controlStrength: 'weak_or_gaps',
        });
      }
    }

    return riskFactors;
  }
}
