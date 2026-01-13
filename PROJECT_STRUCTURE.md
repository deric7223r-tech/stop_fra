# Stop FRA - Complete Project Structure

This document provides a comprehensive view of the Stop FRA project organization.

## Root Directory Structure

```
stop_fra/
├── .github/                          # GitHub configuration
│   └── workflows/                    # CI/CD pipelines
│       ├── backend-ci.yml            # Backend testing & build
│       ├── frontend-ci.yml           # Frontend testing & build
│       ├── deploy-staging.yml        # Staging deployment
│       ├── deploy-production.yml     # Production deployment
│       └── security-monitoring.yml   # Security scanning
│
├── __tests__/                        # Root-level tests
│   ├── integration/                  # Integration test suites
│   └── unit/                         # Unit test suites
│
├── ai-team/                          # AI Work Team Collaboration
│   ├── prompts/                      # AI prompt templates
│   │   ├── README.md                 # Prompt usage guide
│   │   ├── feature-development.md   # Feature implementation template
│   │   ├── bug-fix.md               # Bug fixing template
│   │   ├── refactoring.md           # Refactoring template
│   │   ├── api-endpoint.md          # API endpoint template
│   │   ├── unit-test.md             # Unit testing template
│   │   ├── integration-test.md      # Integration testing template
│   │   └── api-docs.md              # API documentation template
│   │
│   ├── workflows/                    # AI-assisted workflows
│   │   ├── README.md                 # Workflow usage guide
│   │   ├── feature-implementation.md # Complete feature workflow
│   │   ├── bug-fix-workflow.md      # Bug fixing procedure
│   │   ├── code-review.md           # Code review checklist
│   │   ├── testing-workflow.md      # Testing procedures
│   │   ├── deployment-workflow.md   # Deployment process
│   │   └── rollback-procedure.md    # Rollback steps
│   │
│   ├── knowledge-base/               # AI context documents
│   │   ├── README.md                 # Knowledge base overview
│   │   ├── backend-patterns.md      # Backend patterns
│   │   ├── frontend-patterns.md     # Frontend patterns
│   │   ├── database-design.md       # Database principles
│   │   ├── api-design.md            # API design guidelines
│   │   ├── govs-013-requirements.md # GovS-013 compliance
│   │   ├── eccta-2023-requirements.md # ECCTA compliance
│   │   ├── security-best-practices.md # Security patterns
│   │   ├── fraud-risk-assessment.md # Domain knowledge
│   │   └── coding-standards.md      # Code style guide
│   │
│   └── README.md                     # AI team overview
│
├── backend/                          # Node.js + Hono REST API
│   ├── src/
│   │   ├── controllers/              # HTTP request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── assessment.controller.ts
│   │   │   ├── keypass.controller.ts
│   │   │   ├── package.controller.ts
│   │   │   └── purchase.controller.ts
│   │   │
│   │   ├── services/                 # Business logic layer
│   │   │   ├── auth.service.ts       # Authentication
│   │   │   ├── assessment.service.ts # Assessment CRUD
│   │   │   ├── risk-scoring.service.ts # Risk calculation
│   │   │   ├── keypass.service.ts    # Key-pass management
│   │   │   ├── payment.service.ts    # Stripe integration
│   │   │   ├── auditLogger.ts        # Audit trail
│   │   │   ├── dataRetention.ts      # 6-year retention
│   │   │   └── complianceReporting.ts # ECCTA reports
│   │   │
│   │   ├── routes/                   # API route definitions
│   │   │   ├── auth.routes.ts
│   │   │   ├── assessment.routes.ts
│   │   │   ├── keypass.routes.ts
│   │   │   ├── package.routes.ts
│   │   │   └── purchase.routes.ts
│   │   │
│   │   ├── db/                       # Database layer
│   │   │   ├── schema.ts             # Drizzle ORM schema (12 tables)
│   │   │   ├── connection.ts         # DB connection pool
│   │   │   ├── migrate.ts            # Migration runner
│   │   │   └── seed.ts               # Test data seeder
│   │   │
│   │   ├── middleware/               # Express-like middleware
│   │   │   ├── auth.middleware.ts    # JWT verification
│   │   │   ├── cors.middleware.ts    # CORS configuration
│   │   │   ├── logger.middleware.ts  # Request logging
│   │   │   └── errorHandler.ts       # Global error handling
│   │   │
│   │   ├── jobs/                     # Background jobs
│   │   │   └── dataRetentionScheduler.ts
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   └── passwordValidation.ts
│   │   │
│   │   └── index.ts                  # Server entry point
│   │
│   ├── drizzle/                      # Database migrations
│   │   └── [migration-files].sql
│   │
│   ├── test/                         # Backend test suites
│   │   ├── unit/
│   │   └── integration/
│   │
│   ├── package.json                  # Backend dependencies
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── .env.example                  # Environment variable template
│   ├── README.md                     # Backend documentation
│   ├── COMPLIANCE_IMPLEMENTATION_SUMMARY.md
│   ├── SECURITY_AUDIT_CHECKLIST.md
│   └── INTEGRATION_GUIDE.md
│
├── fraud-risk-app-main/              # React Native + Expo Frontend
│   ├── app/                          # Expo Router screens (32 screens)
│   │   ├── _layout.tsx               # Root layout with providers
│   │   ├── index.tsx                 # Home screen
│   │   │
│   │   ├── auth/                     # Authentication screens
│   │   │   ├── login.tsx
│   │   │   ├── signup.tsx
│   │   │   └── keypass.tsx
│   │   │
│   │   ├── organisation.tsx          # Organisation details
│   │   ├── risk-appetite.tsx         # Risk appetite assessment
│   │   ├── fraud-triangle.tsx        # Fraud triangle analysis
│   │   ├── procurement.tsx           # Procurement fraud risks
│   │   ├── cash-banking.tsx          # Cash & banking risks
│   │   ├── payroll-hr.tsx            # Payroll & HR risks
│   │   ├── revenue.tsx               # Revenue fraud risks
│   │   ├── it-systems.tsx            # IT system risks
│   │   ├── people-culture.tsx        # People & culture assessment
│   │   ├── controls-technology.tsx   # Controls evaluation
│   │   ├── training-awareness.tsx    # Training assessment
│   │   ├── monitoring-evaluation.tsx # Monitoring capabilities
│   │   ├── compliance-mapping.tsx    # Compliance mapping
│   │   │
│   │   ├── priority-review.tsx       # Priority risk review
│   │   ├── answer-review.tsx         # Answer review
│   │   ├── packages.tsx              # Package selection
│   │   ├── payment.tsx               # Payment processing
│   │   ├── confirmation.tsx          # Payment confirmation
│   │   ├── signature.tsx             # Electronic signature
│   │   ├── dashboard.tsx             # Analytics dashboard
│   │   └── feedback.tsx              # User feedback
│   │
│   ├── components/                   # Reusable components
│   │   └── ui/                       # UI component library
│   │       ├── AssessmentScreen.tsx  # Assessment wrapper
│   │       ├── Button.tsx            # Custom button
│   │       ├── RadioOption.tsx       # Radio button
│   │       ├── QuestionGroup.tsx     # Question group
│   │       ├── TextArea.tsx          # Text input
│   │       ├── SyncStatus.tsx        # Offline sync indicator
│   │       └── README.md             # Component docs
│   │
│   ├── contexts/                     # React Context state
│   │   ├── AuthContext.tsx           # Auth state management
│   │   └── AssessmentContext.tsx     # Assessment state
│   │
│   ├── services/                     # API & business services
│   │   ├── api.service.ts            # HTTP client
│   │   └── auth.service.ts           # Authentication logic
│   │
│   ├── types/                        # TypeScript definitions
│   │   └── index.ts                  # Type exports
│   │
│   ├── constants/                    # App configuration
│   │   ├── colors.ts                 # UK Gov Design colors
│   │   └── api.ts                    # API configuration
│   │
│   ├── utils/                        # Utility functions
│   ├── assets/                       # Static assets
│   │
│   ├── package.json                  # Frontend dependencies
│   ├── tsconfig.json                 # TypeScript config
│   ├── app.json                      # Expo configuration
│   ├── README.md                     # Frontend documentation
│   └── TESTING_GUIDE.md              # Testing approach
│
├── brand/                            # Guarding Assessment Brand
│   ├── marketing/                    # Marketing materials
│   │   ├── product-descriptions/     # Product documentation
│   │   ├── case-studies/             # Customer success stories
│   │   ├── email-campaigns/          # Email templates
│   │   ├── social-media/             # Social media content
│   │   ├── sales-collateral/         # Sales materials
│   │   ├── blog-content/             # Blog articles
│   │   ├── presentations/            # Presentation decks
│   │   └── README.md                 # Marketing guide
│   │
│   ├── assets/                       # Brand visual assets
│   │   ├── logos/                    # Logo files (SVG, PNG)
│   │   ├── colors/                   # Color palette
│   │   ├── typography/               # Font specimens
│   │   ├── icons/                    # Icon library
│   │   ├── photography/              # Photo library
│   │   ├── illustrations/            # Illustration library
│   │   ├── ui-mockups/               # Design mockups
│   │   ├── templates/                # Design templates
│   │   └── README.md                 # Asset library guide
│   │
│   ├── guidelines/                   # Brand guidelines
│   │   ├── brand-identity.md         # Visual identity
│   │   ├── tone-of-voice.md          # Writing guidelines
│   │   ├── design-system.md          # UI/UX design system
│   │   ├── social-media-guidelines.md # Social media standards
│   │   ├── email-guidelines.md       # Email standards
│   │   ├── presentation-guidelines.md # Presentation standards
│   │   ├── content-style-guide.md    # Content standards
│   │   ├── accessibility-guidelines.md # Accessibility standards
│   │   └── README.md                 # Guidelines overview
│   │
│   └── README.md                     # Brand overview
│
├── docs/                             # Project documentation
│   ├── QUICK_START.md                # Getting started guide
│   ├── TECHNICAL_REPORT.md           # Architecture & status
│   ├── BACKEND_ARCHITECTURE_STRATEGY.md
│   ├── FRONTEND_ARCHITECTURE_STRATEGY.md
│   ├── TESTING_ARCHITECTURE_STRATEGY.md
│   └── [Various status reports]
│
├── CLAUDE.md                         # AI agent project guide
├── PROJECT_STRUCTURE.md              # This file
├── README.md                         # Main project README
├── .gitignore                        # Git ignore rules
└── package.json                      # Root package.json

```

## Key Directory Purposes

### AI Work Team (`/ai-team`)
**Purpose:** Collaboration workspace for AI agents
**Contents:**
- Prompt templates for common tasks
- Standard workflows and procedures
- Knowledge base for context and best practices
- Guidelines for AI agent collaboration

**Usage:** AI agents reference these materials when working on tasks to ensure consistency, quality, and adherence to project standards.

### Brand Materials (`/brand`)
**Purpose:** Marketing and brand asset management
**Contents:**
- Marketing collateral and campaigns
- Visual assets (logos, colors, icons, photos)
- Brand guidelines and standards
- Content templates and examples

**Usage:** Marketing team and content creators use these resources to maintain brand consistency across all channels.

### Backend (`/backend`)
**Purpose:** RESTful API server
**Technology:** Node.js, Hono, PostgreSQL, Drizzle ORM
**Key Features:**
- 30+ API endpoints
- JWT authentication
- 12-table database schema
- Stripe payment integration
- Audit logging and compliance reporting

### Frontend (`/fraud-risk-app-main`)
**Purpose:** Mobile and web application
**Technology:** React Native, Expo, TypeScript
**Key Features:**
- 32 screens including 13 assessment modules
- Offline-first architecture
- UK Government Design System styling
- Package 3 analytics dashboard
- Electronic signature capture

### Documentation (`/docs`)
**Purpose:** Comprehensive project documentation
**Contents:**
- Architecture strategies
- Quick start guides
- Technical reports
- Testing strategies
- Implementation summaries

## File Naming Conventions

### Code Files
- **Components:** PascalCase (e.g., `AssessmentScreen.tsx`)
- **Services:** camelCase with .service suffix (e.g., `auth.service.ts`)
- **Controllers:** camelCase with .controller suffix (e.g., `auth.controller.ts`)
- **Routes:** camelCase with .routes suffix (e.g., `auth.routes.ts`)
- **Types:** camelCase with .types suffix (e.g., `assessment.types.ts`)

### Documentation Files
- **Main docs:** SCREAMING_SNAKE_CASE.md (e.g., `QUICK_START.md`)
- **Subdirectory docs:** kebab-case.md (e.g., `feature-implementation.md`)
- **README files:** Always `README.md` (uppercase)

### Asset Files
- **Images:** `[category]-[description]-[variant].[ext]`
  - Example: `logo-primary-color.svg`
- **Documents:** `[type]-[topic]-[date]-[version].[ext]`
  - Example: `case-study-financial-2026-01-v1.pdf`

## Technology Stack Summary

### Backend Stack
- **Runtime:** Node.js 20+
- **Framework:** Hono 4.6
- **Language:** TypeScript 5.9 (strict mode)
- **Database:** PostgreSQL 14+ with Drizzle ORM 0.45
- **Authentication:** JWT with bcrypt
- **Payment:** Stripe
- **Storage:** AWS S3
- **Cache:** Redis (optional)
- **Logging:** Pino

### Frontend Stack
- **Framework:** React Native 0.81 + Expo 54
- **Routing:** Expo Router 6.0
- **Language:** TypeScript 5.9
- **State:** Zustand 5.0, React Context, TanStack Query 5.83
- **UI:** Custom components + UK Gov Design System
- **Charts:** Victory Native 41.20
- **Icons:** Lucide React Native
- **Storage:** AsyncStorage

### DevOps Stack
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Testing:** Jest
- **Linting:** ESLint
- **Security:** npm audit, Snyk, OWASP scanning
- **Containerization:** Docker (ready)

## Quick Navigation

### For Developers
- **Getting Started:** `/docs/QUICK_START.md`
- **Backend API:** `/backend/README.md`
- **Frontend Guide:** `/fraud-risk-app-main/README.md`
- **Testing:** `/TESTING_ARCHITECTURE_STRATEGY.md`

### For AI Agents
- **Project Overview:** `/CLAUDE.md`
- **Workflows:** `/ai-team/workflows/`
- **Prompts:** `/ai-team/prompts/`
- **Knowledge Base:** `/ai-team/knowledge-base/`

### For Marketing Team
- **Brand Overview:** `/brand/README.md`
- **Brand Guidelines:** `/brand/guidelines/`
- **Marketing Materials:** `/brand/marketing/`
- **Asset Library:** `/brand/assets/`

### For Compliance/Legal
- **ECCTA Compliance:** `/backend/COMPLIANCE_IMPLEMENTATION_SUMMARY.md`
- **Security Checklist:** `/backend/SECURITY_AUDIT_CHECKLIST.md`
- **Data Retention:** Review `/backend/src/jobs/dataRetentionScheduler.ts`
- **Audit Logging:** Review `/backend/src/services/auditLogger.ts`

## Project Statistics

- **Total Code Files:** 100+
- **Lines of Code:** ~6,000+
- **Database Tables:** 12
- **API Endpoints:** 30+
- **UI Screens:** 32
- **Test Files:** 4+
- **Documentation Files:** 50+
- **Supported Platforms:** iOS, Android, Web

---

**Last Updated:** January 2026
**Maintained By:** AI Work Team - Guarding Assessment
**Version:** 1.0
