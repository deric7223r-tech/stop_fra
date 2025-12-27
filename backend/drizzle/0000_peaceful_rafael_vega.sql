CREATE TYPE "public"."assessment_status" AS ENUM('draft', 'submitted', 'paid', 'signed', 'completed');--> statement-breakpoint
CREATE TYPE "public"."keypass_status" AS ENUM('unused', 'used', 'expired');--> statement-breakpoint
CREATE TYPE "public"."organisation_type" AS ENUM('charity', 'public-sector', 'private-sme', 'large-corporate');--> statement-breakpoint
CREATE TYPE "public"."package_type" AS ENUM('health-check', 'with-awareness', 'with-dashboard');--> statement-breakpoint
CREATE TYPE "public"."purchase_status" AS ENUM('pending', 'success', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('employer', 'employee', 'admin');--> statement-breakpoint
CREATE TABLE "assessment_answers" (
	"answer_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"section" varchar(50) NOT NULL,
	"answers" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"assessment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"status" "assessment_status" DEFAULT 'draft' NOT NULL,
	"overall_risk_level" varchar(20),
	"completion_percentage" integer DEFAULT 0,
	"submitted_at" timestamp,
	"paid_at" timestamp,
	"signed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"audit_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"table_name" varchar(50) NOT NULL,
	"record_id" uuid NOT NULL,
	"action" varchar(20) NOT NULL,
	"user_id" uuid,
	"changed_fields" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"request_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_assessments" (
	"employee_assessment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organisation_id" uuid NOT NULL,
	"answers" jsonb NOT NULL,
	"risk_score" integer,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"feedback_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"what_worked_well" text,
	"improvements" text,
	"consent_contact" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "keypasses" (
	"keypass_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(20) NOT NULL,
	"organisation_id" uuid NOT NULL,
	"status" "keypass_status" DEFAULT 'unused' NOT NULL,
	"used_by_user_id" uuid,
	"used_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "keypasses_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "organisations" (
	"organisation_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "organisation_type",
	"employee_count" varchar(50),
	"region" varchar(100),
	"activities" text,
	"package_type" "package_type",
	"keypasses_allocated" integer DEFAULT 0 NOT NULL,
	"keypasses_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"package_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_type" "package_type" NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"max_keypasses_default" integer DEFAULT 0,
	"features" jsonb NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "packages_package_type_unique" UNIQUE("package_type")
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"purchase_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid NOT NULL,
	"assessment_id" uuid NOT NULL,
	"package_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'GBP' NOT NULL,
	"status" "purchase_status" DEFAULT 'pending' NOT NULL,
	"transaction_reference" varchar(255),
	"payment_method" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_register_items" (
	"risk_item_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"risk_id_code" varchar(20) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"area" varchar(100) NOT NULL,
	"impact" integer NOT NULL,
	"likelihood" integer NOT NULL,
	"inherent_score" integer NOT NULL,
	"control_strength" varchar(50),
	"residual_score" integer NOT NULL,
	"priority" varchar(20) NOT NULL,
	"suggested_owner" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "signatures" (
	"signature_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"signatory_name" varchar(255) NOT NULL,
	"signatory_role" varchar(255) NOT NULL,
	"signature_image_url" text NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"signed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "signatures_assessment_id_unique" UNIQUE("assessment_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'employer' NOT NULL,
	"organisation_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_assessment_id_assessments_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("assessment_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_organisation_id_organisations_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("organisation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_created_by_user_id_users_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_assessments" ADD CONSTRAINT "employee_assessments_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_assessments" ADD CONSTRAINT "employee_assessments_organisation_id_organisations_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("organisation_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_assessment_id_assessments_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("assessment_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keypasses" ADD CONSTRAINT "keypasses_organisation_id_organisations_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("organisation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "keypasses" ADD CONSTRAINT "keypasses_used_by_user_id_users_user_id_fk" FOREIGN KEY ("used_by_user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_organisation_id_organisations_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("organisation_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_assessment_id_assessments_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("assessment_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_package_id_packages_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("package_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_register_items" ADD CONSTRAINT "risk_register_items_assessment_id_assessments_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("assessment_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_assessment_id_assessments_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("assessment_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organisation_id_organisations_organisation_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("organisation_id") ON DELETE cascade ON UPDATE no action;