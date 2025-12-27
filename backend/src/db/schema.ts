import { pgTable, uuid, varchar, timestamp, text, jsonb, pgEnum, integer, boolean, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['employer', 'employee', 'admin']);
export const assessmentStatusEnum = pgEnum('assessment_status', ['draft', 'submitted', 'paid', 'signed', 'completed']);
export const keypassStatusEnum = pgEnum('keypass_status', ['unused', 'used', 'expired']);
export const organisationTypeEnum = pgEnum('organisation_type', ['charity', 'public-sector', 'private-sme', 'large-corporate']);
export const packageTypeEnum = pgEnum('package_type', ['health-check', 'with-awareness', 'with-dashboard']);
export const purchaseStatusEnum = pgEnum('purchase_status', ['pending', 'success', 'failed', 'refunded']);

// Users table
export const users = pgTable('users', {
  userId: uuid('user_id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('employer'),
  organisationId: uuid('organisation_id').references(() => organisations.organisationId, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login'),
  deletedAt: timestamp('deleted_at'),
});

// Organisations table
export const organisations = pgTable('organisations', {
  organisationId: uuid('organisation_id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: organisationTypeEnum('type'),
  employeeCount: varchar('employee_count', { length: 50 }),
  region: varchar('region', { length: 100 }),
  activities: text('activities'),
  packageType: packageTypeEnum('package_type'),
  keypassesAllocated: integer('keypasses_allocated').default(0).notNull(),
  keypassesUsed: integer('keypasses_used').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Assessments table
export const assessments = pgTable('assessments', {
  assessmentId: uuid('assessment_id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').notNull().references(() => organisations.organisationId, { onDelete: 'cascade' }),
  createdByUserId: uuid('created_by_user_id').notNull().references(() => users.userId),
  status: assessmentStatusEnum('status').notNull().default('draft'),
  overallRiskLevel: varchar('overall_risk_level', { length: 20 }),
  completionPercentage: integer('completion_percentage').default(0),
  submittedAt: timestamp('submitted_at'),
  paidAt: timestamp('paid_at'),
  signedAt: timestamp('signed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

// Assessment Answers table
export const assessmentAnswers = pgTable('assessment_answers', {
  answerId: uuid('answer_id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.assessmentId, { onDelete: 'cascade' }),
  section: varchar('section', { length: 50 }).notNull(),
  answers: jsonb('answers').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Risk Register Items table
export const riskRegisterItems = pgTable('risk_register_items', {
  riskItemId: uuid('risk_item_id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.assessmentId, { onDelete: 'cascade' }),
  riskIdCode: varchar('risk_id_code', { length: 20 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  area: varchar('area', { length: 100 }).notNull(),
  impact: integer('impact').notNull(),
  likelihood: integer('likelihood').notNull(),
  inherentScore: integer('inherent_score').notNull(),
  controlStrength: varchar('control_strength', { length: 50 }),
  residualScore: integer('residual_score').notNull(),
  priority: varchar('priority', { length: 20 }).notNull(),
  suggestedOwner: varchar('suggested_owner', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Packages table
export const packages = pgTable('packages', {
  packageId: uuid('package_id').primaryKey().defaultRandom(),
  packageType: packageTypeEnum('package_type').notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  maxKeypassesDefault: integer('max_keypasses_default').default(0),
  features: jsonb('features').notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Purchases table
export const purchases = pgTable('purchases', {
  purchaseId: uuid('purchase_id').primaryKey().defaultRandom(),
  organisationId: uuid('organisation_id').notNull().references(() => organisations.organisationId),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.assessmentId),
  packageId: uuid('package_id').notNull().references(() => packages.packageId),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('GBP').notNull(),
  status: purchaseStatusEnum('status').notNull().default('pending'),
  transactionReference: varchar('transaction_reference', { length: 255 }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Key-passes table
export const keypasses = pgTable('keypasses', {
  keypassId: uuid('keypass_id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  organisationId: uuid('organisation_id').notNull().references(() => organisations.organisationId, { onDelete: 'cascade' }),
  status: keypassStatusEnum('status').notNull().default('unused'),
  usedByUserId: uuid('used_by_user_id').references(() => users.userId),
  usedAt: timestamp('used_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Employee Assessments table
export const employeeAssessments = pgTable('employee_assessments', {
  employeeAssessmentId: uuid('employee_assessment_id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.userId),
  organisationId: uuid('organisation_id').notNull().references(() => organisations.organisationId),
  answers: jsonb('answers').notNull(),
  riskScore: integer('risk_score'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Signatures table
export const signatures = pgTable('signatures', {
  signatureId: uuid('signature_id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.assessmentId).unique(),
  signatoryName: varchar('signatory_name', { length: 255 }).notNull(),
  signatoryRole: varchar('signatory_role', { length: 255 }).notNull(),
  signatureImageUrl: text('signature_image_url').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  signedAt: timestamp('signed_at').defaultNow().notNull(),
});

// Feedback table
export const feedback = pgTable('feedback', {
  feedbackId: uuid('feedback_id').primaryKey().defaultRandom(),
  assessmentId: uuid('assessment_id').notNull().references(() => assessments.assessmentId),
  userId: uuid('user_id').notNull().references(() => users.userId),
  rating: integer('rating').notNull(),
  whatWorkedWell: text('what_worked_well'),
  improvements: text('improvements'),
  consentContact: boolean('consent_contact').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Audit Logs table
export const auditLogs = pgTable('audit_logs', {
  auditId: uuid('audit_id').primaryKey().defaultRandom(),
  tableName: varchar('table_name', { length: 50 }).notNull(),
  recordId: uuid('record_id').notNull(),
  action: varchar('action', { length: 20 }).notNull(),
  userId: uuid('user_id').references(() => users.userId),
  changedFields: jsonb('changed_fields'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  requestId: varchar('request_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [users.organisationId],
    references: [organisations.organisationId],
  }),
  assessments: many(assessments),
  employeeAssessments: many(employeeAssessments),
}));

export const organisationsRelations = relations(organisations, ({ many }) => ({
  users: many(users),
  assessments: many(assessments),
  keypasses: many(keypasses),
  purchases: many(purchases),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  organisation: one(organisations, {
    fields: [assessments.organisationId],
    references: [organisations.organisationId],
  }),
  createdBy: one(users, {
    fields: [assessments.createdByUserId],
    references: [users.userId],
  }),
  answers: many(assessmentAnswers),
  riskItems: many(riskRegisterItems),
  signature: one(signatures),
  feedback: many(feedback),
  purchases: many(purchases),
}));
