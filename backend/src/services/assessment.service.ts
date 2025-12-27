import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import {
  assessments,
  assessmentAnswers,
  riskRegisterItems,
  organisations,
  type Assessment,
  type AssessmentAnswer,
  type RiskRegisterItem,
} from '../db/schema';
import { RiskScoringService } from './risk-scoring.service';

export interface CreateAssessmentInput {
  organisationId: string;
  assessedBy: string;
}

export interface UpdateAssessmentInput {
  answers?: Record<string, any>;
  status?: 'draft' | 'in_progress' | 'submitted' | 'completed' | 'archived';
}

export interface SubmitAssessmentInput {
  answers: Record<string, any>;
}

export class AssessmentService {
  private riskScoringService: RiskScoringService;

  constructor() {
    this.riskScoringService = new RiskScoringService();
  }

  /**
   * Create a new assessment for an organisation
   */
  async createAssessment(input: CreateAssessmentInput): Promise<Assessment> {
    const [assessment] = await db
      .insert(assessments)
      .values({
        organisationId: input.organisationId,
        assessedBy: input.assessedBy,
        status: 'draft',
      })
      .returning();

    return assessment;
  }

  /**
   * Get assessment by ID with organisation details
   */
  async getAssessmentById(
    assessmentId: string,
    userId: string,
    userRole: string,
    userOrgId?: string
  ): Promise<Assessment | null> {
    const [assessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.assessmentId, assessmentId))
      .limit(1);

    if (!assessment) {
      return null;
    }

    // Check access permissions
    if (userRole !== 'admin' && assessment.organisationId !== userOrgId) {
      throw new Error('ORGANISATION_ACCESS_DENIED');
    }

    return assessment;
  }

  /**
   * Get all assessments for an organisation
   */
  async getAssessmentsByOrganisation(
    organisationId: string,
    userId: string,
    userRole: string,
    userOrgId?: string
  ): Promise<Assessment[]> {
    // Check access permissions
    if (userRole !== 'admin' && organisationId !== userOrgId) {
      throw new Error('ORGANISATION_ACCESS_DENIED');
    }

    const results = await db
      .select()
      .from(assessments)
      .where(eq(assessments.organisationId, organisationId))
      .orderBy(desc(assessments.createdAt));

    return results;
  }

  /**
   * Update assessment answers and status
   */
  async updateAssessment(
    assessmentId: string,
    input: UpdateAssessmentInput,
    userId: string,
    userRole: string,
    userOrgId?: string
  ): Promise<Assessment> {
    // Get existing assessment
    const assessment = await this.getAssessmentById(assessmentId, userId, userRole, userOrgId);

    if (!assessment) {
      throw new Error('ASSESSMENT_NOT_FOUND');
    }

    // Don't allow updates to completed or archived assessments
    if (['completed', 'archived'].includes(assessment.status)) {
      throw new Error('ASSESSMENT_LOCKED');
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (input.status) {
      updateData.status = input.status;
    }

    // Update assessment answers if provided
    if (input.answers) {
      // Store or update answers
      await this.saveAssessmentAnswers(assessmentId, input.answers);

      // If status is moving to in_progress, update it
      if (assessment.status === 'draft') {
        updateData.status = 'in_progress';
      }
    }

    const [updatedAssessment] = await db
      .update(assessments)
      .set(updateData)
      .where(eq(assessments.assessmentId, assessmentId))
      .returning();

    return updatedAssessment;
  }

  /**
   * Save assessment answers
   */
  async saveAssessmentAnswers(
    assessmentId: string,
    answers: Record<string, any>
  ): Promise<void> {
    // Store each module's answers separately
    for (const [module, moduleAnswers] of Object.entries(answers)) {
      // Check if answer already exists
      const [existing] = await db
        .select()
        .from(assessmentAnswers)
        .where(
          and(
            eq(assessmentAnswers.assessmentId, assessmentId),
            eq(assessmentAnswers.moduleKey, module)
          )
        )
        .limit(1);

      if (existing) {
        // Update existing answer
        await db
          .update(assessmentAnswers)
          .set({
            answers: moduleAnswers,
            updatedAt: new Date(),
          })
          .where(eq(assessmentAnswers.answerGroupId, existing.answerGroupId));
      } else {
        // Insert new answer
        await db.insert(assessmentAnswers).values({
          assessmentId,
          moduleKey: module,
          answers: moduleAnswers,
        });
      }
    }
  }

  /**
   * Get assessment answers
   */
  async getAssessmentAnswers(assessmentId: string): Promise<Record<string, any>> {
    const answers = await db
      .select()
      .from(assessmentAnswers)
      .where(eq(assessmentAnswers.assessmentId, assessmentId));

    // Convert to object format
    const result: Record<string, any> = {};
    for (const answer of answers) {
      result[answer.moduleKey] = answer.answers;
    }

    return result;
  }

  /**
   * Submit assessment for processing
   */
  async submitAssessment(
    assessmentId: string,
    input: SubmitAssessmentInput,
    userId: string,
    userRole: string,
    userOrgId?: string
  ): Promise<Assessment> {
    // Get existing assessment
    const assessment = await this.getAssessmentById(assessmentId, userId, userRole, userOrgId);

    if (!assessment) {
      throw new Error('ASSESSMENT_NOT_FOUND');
    }

    if (assessment.status === 'completed') {
      throw new Error('ASSESSMENT_ALREADY_SUBMITTED');
    }

    // Save final answers
    await this.saveAssessmentAnswers(assessmentId, input.answers);

    // Calculate risk scores
    const riskItems = await this.riskScoringService.calculateRiskScores(
      assessmentId,
      input.answers
    );

    // Save risk register items
    if (riskItems.length > 0) {
      await db.insert(riskRegisterItems).values(riskItems);
    }

    // Calculate overall risk level
    const overallRiskLevel = this.riskScoringService.calculateOverallRiskLevel(riskItems);

    // Update assessment status
    const [updatedAssessment] = await db
      .update(assessments)
      .set({
        status: 'submitted',
        submittedAt: new Date(),
        overallRiskLevel,
        updatedAt: new Date(),
      })
      .where(eq(assessments.assessmentId, assessmentId))
      .returning();

    return updatedAssessment;
  }

  /**
   * Get risk register items for an assessment
   */
  async getRiskRegisterItems(
    assessmentId: string,
    userId: string,
    userRole: string,
    userOrgId?: string
  ): Promise<RiskRegisterItem[]> {
    // Verify access to assessment
    await this.getAssessmentById(assessmentId, userId, userRole, userOrgId);

    const items = await db
      .select()
      .from(riskRegisterItems)
      .where(eq(riskRegisterItems.assessmentId, assessmentId))
      .orderBy(desc(riskRegisterItems.residualScore));

    return items;
  }

  /**
   * Delete assessment (soft delete)
   */
  async deleteAssessment(
    assessmentId: string,
    userId: string,
    userRole: string,
    userOrgId?: string
  ): Promise<void> {
    // Get existing assessment
    const assessment = await this.getAssessmentById(assessmentId, userId, userRole, userOrgId);

    if (!assessment) {
      throw new Error('ASSESSMENT_NOT_FOUND');
    }

    // Soft delete by updating status
    await db
      .update(assessments)
      .set({
        status: 'archived',
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(assessments.assessmentId, assessmentId));
  }
}
