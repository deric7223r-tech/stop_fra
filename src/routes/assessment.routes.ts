import { Hono } from 'hono';
import { AssessmentController } from '../controllers/assessment.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const assessmentRoutes = new Hono();
const assessmentController = new AssessmentController();

// All routes require authentication
assessmentRoutes.use('*', authMiddleware);

// Create new assessment (employers only)
assessmentRoutes.post(
  '/',
  requireRole('employer', 'admin'),
  assessmentController.createAssessment
);

// Get assessment by ID
assessmentRoutes.get('/:id', assessmentController.getAssessment);

// Get assessments by organisation
assessmentRoutes.get(
  '/organisation/:orgId',
  assessmentController.getOrganisationAssessments
);

// Update assessment
assessmentRoutes.patch('/:id', assessmentController.updateAssessment);

// Submit assessment for processing
assessmentRoutes.post('/:id/submit', assessmentController.submitAssessment);

// Get risk register for assessment
assessmentRoutes.get('/:id/risk-register', assessmentController.getRiskRegister);

// Delete assessment (soft delete)
assessmentRoutes.delete(
  '/:id',
  requireRole('employer', 'admin'),
  assessmentController.deleteAssessment
);

export default assessmentRoutes;
