import { Context } from 'hono';
import { z } from 'zod';
import { AssessmentService } from '../services/assessment.service.js';

const createAssessmentSchema = z.object({
  organisationId: z.string().uuid(),
});

const updateAssessmentSchema = z.object({
  answers: z.record(z.any()).optional(),
  status: z.enum(['draft', 'submitted', 'paid', 'signed', 'completed']).optional(),
});

const submitAssessmentSchema = z.object({
  answers: z.record(z.any()),
});

export class AssessmentController {
  private assessmentService: AssessmentService;

  constructor() {
    this.assessmentService = new AssessmentService();
  }

  /**
   * POST /api/v1/assessments
   * Create a new assessment
   */
  createAssessment = async (c: Context) => {
    try {
      const user = c.get('user');
      const body = await c.req.json();

      // Validate input
      const validated = createAssessmentSchema.parse(body);

      // Verify user has access to organisation
      if (user.role !== 'admin' && user.organisationId !== validated.organisationId) {
        return c.json(
          {
            success: false,
            error: {
              code: 'ORGANISATION_ACCESS_DENIED',
              message: 'You do not have access to this organisation',
            },
          },
          403
        );
      }

      const assessment = await this.assessmentService.createAssessment({
        organisationId: validated.organisationId,
        createdByUserId: user.userId,
      });

      return c.json(
        {
          success: true,
          data: { assessment },
        },
        201
      );
    } catch (error: any) {
      console.error('Create assessment error:', error);

      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: error.errors,
            },
          },
          400
        );
      }

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to create assessment',
          },
        },
        500
      );
    }
  };

  /**
   * GET /api/v1/assessments/:id
   * Get assessment by ID
   */
  getAssessment = async (c: Context) => {
    try {
      const user = c.get('user');
      const assessmentId = c.req.param('id');

      const assessment = await this.assessmentService.getAssessmentById(
        assessmentId,
        user.userId,
        user.role,
        user.organisationId ?? undefined
      );

      if (!assessment) {
        return c.json(
          {
            success: false,
            error: {
              code: 'ASSESSMENT_NOT_FOUND',
              message: 'Assessment not found',
            },
          },
          404
        );
      }

      // Get answers
      const answers = await this.assessmentService.getAssessmentAnswers(assessmentId);

      return c.json({
        success: true,
        data: {
          assessment,
          answers,
        },
      });
    } catch (error: any) {
      console.error('Get assessment error:', error);

      if (error.message === 'ORGANISATION_ACCESS_DENIED') {
        return c.json(
          {
            success: false,
            error: {
              code: 'ORGANISATION_ACCESS_DENIED',
              message: 'You do not have access to this assessment',
            },
          },
          403
        );
      }

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to retrieve assessment',
          },
        },
        500
      );
    }
  };

  /**
   * GET /api/v1/assessments/organisation/:orgId
   * Get all assessments for an organisation
   */
  getOrganisationAssessments = async (c: Context) => {
    try {
      const user = c.get('user');
      const orgId = c.req.param('orgId');

      const assessments = await this.assessmentService.getAssessmentsByOrganisation(
        orgId,
        user.userId,
        user.role,
        user.organisationId ?? undefined
      );

      return c.json({
        success: true,
        data: { assessments },
      });
    } catch (error: any) {
      console.error('Get organisation assessments error:', error);

      if (error.message === 'ORGANISATION_ACCESS_DENIED') {
        return c.json(
          {
            success: false,
            error: {
              code: 'ORGANISATION_ACCESS_DENIED',
              message: 'You do not have access to this organisation',
            },
          },
          403
        );
      }

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to retrieve assessments',
          },
        },
        500
      );
    }
  };

  /**
   * PATCH /api/v1/assessments/:id
   * Update assessment
   */
  updateAssessment = async (c: Context) => {
    try {
      const user = c.get('user');
      const assessmentId = c.req.param('id');
      const body = await c.req.json();

      // Validate input
      const validated = updateAssessmentSchema.parse(body);

      const assessment = await this.assessmentService.updateAssessment(
        assessmentId,
        validated,
        user.userId,
        user.role,
        user.organisationId ?? undefined
      );

      return c.json({
        success: true,
        data: { assessment },
      });
    } catch (error: any) {
      console.error('Update assessment error:', error);

      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: error.errors,
            },
          },
          400
        );
      }

      if (error.message === 'ASSESSMENT_NOT_FOUND') {
        return c.json(
          {
            success: false,
            error: {
              code: 'ASSESSMENT_NOT_FOUND',
              message: 'Assessment not found',
            },
          },
          404
        );
      }

      if (error.message === 'ASSESSMENT_LOCKED') {
        return c.json(
          {
            success: false,
            error: {
              code: 'ASSESSMENT_LOCKED',
              message: 'Cannot update completed or archived assessment',
            },
          },
          400
        );
      }

      if (error.message === 'ORGANISATION_ACCESS_DENIED') {
        return c.json(
          {
            success: false,
            error: {
              code: 'ORGANISATION_ACCESS_DENIED',
              message: 'You do not have access to this assessment',
            },
          },
          403
        );
      }

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update assessment',
          },
        },
        500
      );
    }
  };

  /**
   * POST /api/v1/assessments/:id/submit
   * Submit assessment for processing
   */
  submitAssessment = async (c: Context) => {
    try {
      const user = c.get('user');
      const assessmentId = c.req.param('id');
      const body = await c.req.json();

      // Validate input
      const validated = submitAssessmentSchema.parse(body);

      const assessment = await this.assessmentService.submitAssessment(
        assessmentId,
        validated,
        user.userId,
        user.role,
        user.organisationId ?? undefined
      );

      return c.json({
        success: true,
        data: { assessment },
        message: 'Assessment submitted successfully',
      });
    } catch (error: any) {
      console.error('Submit assessment error:', error);

      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input data',
              details: error.errors,
            },
          },
          400
        );
      }

      if (error.message === 'ASSESSMENT_NOT_FOUND') {
        return c.json(
          {
            success: false,
            error: {
              code: 'ASSESSMENT_NOT_FOUND',
              message: 'Assessment not found',
            },
          },
          404
        );
      }

      if (error.message === 'ASSESSMENT_ALREADY_SUBMITTED') {
        return c.json(
          {
            success: false,
            error: {
              code: 'ASSESSMENT_ALREADY_SUBMITTED',
              message: 'Assessment has already been submitted',
            },
          },
          400
        );
      }

      if (error.message === 'ORGANISATION_ACCESS_DENIED') {
        return c.json(
          {
            success: false,
            error: {
              code: 'ORGANISATION_ACCESS_DENIED',
              message: 'You do not have access to this assessment',
            },
          },
          403
        );
      }

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to submit assessment',
          },
        },
        500
      );
    }
  };

  /**
   * GET /api/v1/assessments/:id/risk-register
   * Get risk register items for assessment
   */
  getRiskRegister = async (c: Context) => {
    try {
      const user = c.get('user');
      const assessmentId = c.req.param('id');

      const riskItems = await this.assessmentService.getRiskRegisterItems(
        assessmentId,
        user.userId,
        user.role,
        user.organisationId ?? undefined
      );

      return c.json({
        success: true,
        data: { riskItems },
      });
    } catch (error: any) {
      console.error('Get risk register error:', error);

      if (error.message === 'ASSESSMENT_NOT_FOUND') {
        return c.json(
          {
            success: false,
            error: {
              code: 'ASSESSMENT_NOT_FOUND',
              message: 'Assessment not found',
            },
          },
          404
        );
      }

      if (error.message === 'ORGANISATION_ACCESS_DENIED') {
        return c.json(
          {
            success: false,
            error: {
              code: 'ORGANISATION_ACCESS_DENIED',
              message: 'You do not have access to this assessment',
            },
          },
          403
        );
      }

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to retrieve risk register',
          },
        },
        500
      );
    }
  };

  /**
   * DELETE /api/v1/assessments/:id
   * Delete assessment (soft delete)
   */
  deleteAssessment = async (c: Context) => {
    try {
      const user = c.get('user');
      const assessmentId = c.req.param('id');

      await this.assessmentService.deleteAssessment(
        assessmentId,
        user.userId,
        user.role,
        user.organisationId ?? undefined
      );

      return c.json({
        success: true,
        message: 'Assessment deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete assessment error:', error);

      if (error.message === 'ASSESSMENT_NOT_FOUND') {
        return c.json(
          {
            success: false,
            error: {
              code: 'ASSESSMENT_NOT_FOUND',
              message: 'Assessment not found',
            },
          },
          404
        );
      }

      if (error.message === 'ORGANISATION_ACCESS_DENIED') {
        return c.json(
          {
            success: false,
            error: {
              code: 'ORGANISATION_ACCESS_DENIED',
              message: 'You do not have access to this assessment',
            },
          },
          403
        );
      }

      return c.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to delete assessment',
          },
        },
        500
      );
    }
  };
}
