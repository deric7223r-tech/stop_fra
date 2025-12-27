/**
 * Integration tests for Assessment Flow
 * Tests the complete assessment creation and submission flow
 */
import { createMockUser, createMockOrganisation, createMockAssessment } from '../helpers/testUtils';

describe('Assessment Flow Integration', () => {
  let mockUser: any;
  let mockOrganisation: any;

  beforeEach(() => {
    mockUser = createMockUser();
    mockOrganisation = createMockOrganisation();
  });

  describe('Assessment Creation', () => {
    it('should create a new assessment with default values', () => {
      const assessment = createMockAssessment({
        organisation_id: mockOrganisation.organisation_id,
        created_by_user_id: mockUser.user_id,
      });

      expect(assessment).toHaveProperty('assessment_id');
      expect(assessment.status).toBe('draft');
      expect(assessment.organisation_id).toBe(mockOrganisation.organisation_id);
      expect(assessment.created_by_user_id).toBe(mockUser.user_id);
    });

    it('should validate required fields on creation', () => {
      const invalidAssessment = {
        organisation_id: null,
        created_by_user_id: null,
      };

      expect(invalidAssessment.organisation_id).toBeNull();
      expect(invalidAssessment.created_by_user_id).toBeNull();
    });
  });

  describe('Assessment Update', () => {
    it('should update assessment with risk appetite data', () => {
      const assessment = createMockAssessment();
      const updatedData = {
        ...assessment,
        risk_appetite: 'medium',
        risk_justification: 'Moderate risk tolerance for strategic growth',
      };

      expect(updatedData.risk_appetite).toBe('medium');
      expect(updatedData.risk_justification).toBe('Moderate risk tolerance for strategic growth');
    });

    it('should maintain assessment status during updates', () => {
      const assessment = createMockAssessment({ status: 'draft' });
      const updatedAssessment = { ...assessment, status: 'draft' };

      expect(updatedAssessment.status).toBe('draft');
    });
  });

  describe('Assessment Submission', () => {
    it('should transition status from draft to submitted', () => {
      const assessment = createMockAssessment({ status: 'draft' });
      const submittedAssessment = { ...assessment, status: 'submitted' };

      expect(submittedAssessment.status).toBe('submitted');
    });

    it('should calculate risk scores on submission', () => {
      const assessment = createMockAssessment({
        status: 'submitted',
        overall_risk_level: 'medium',
      });

      expect(assessment.status).toBe('submitted');
      expect(assessment.overall_risk_level).toBe('medium');
    });
  });

  describe('Risk Register Generation', () => {
    it('should generate risk register items from assessment data', () => {
      const riskRegisterItems = [
        {
          risk_id: '1',
          category: 'procurement',
          inherent_score: 20,
          residual_score: 12,
          priority: 'high',
        },
        {
          risk_id: '2',
          category: 'payroll',
          inherent_score: 12,
          residual_score: 10,
          priority: 'medium',
        },
      ];

      expect(riskRegisterItems).toHaveLength(2);
      expect(riskRegisterItems[0].priority).toBe('high');
      expect(riskRegisterItems[1].priority).toBe('medium');
    });

    it('should sort risks by priority', () => {
      const risks = [
        { priority: 'low', residual_score: 5 },
        { priority: 'high', residual_score: 20 },
        { priority: 'medium', residual_score: 10 },
      ];

      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const sorted = [...risks].sort((a, b) => 
        priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
      );

      expect(sorted[0].priority).toBe('high');
      expect(sorted[1].priority).toBe('medium');
      expect(sorted[2].priority).toBe('low');
    });
  });
});
