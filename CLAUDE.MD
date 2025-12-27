# CLAUDE.MD - Stop FRA Project Documentation

## Project Overview

**Project Name:** Stop FRA (Fraud Risk Assessment Platform)
**Version:** 2.0
**Purpose:** AI-powered comprehensive fraud risk assessment platform for UK organizations compliant with GovS-013, ECCTA 2023, and failure-to-prevent fraud regulations.

**Platform Type:** Cross-platform native mobile app (iOS, Android, Web)
**Framework:** Expo Router + React Native
**Runtime:** Bun + Node.js
**AI Integration:** Claude Agent SDK for AI work team collaboration

---

## Project Context

The Stop FRA platform is designed to help UK organizations conduct comprehensive fraud risk assessments aligned with:
- **GovS-013** - UK Government Functional Standard for Counter-Fraud
- **ECCTA 2023** - Economic Crime and Corporate Transparency Act
- **Failure-to-Prevent Fraud** regulations (September 2025 deadline)

### Key Features

1. **Multi-Package System:**
   - Package 1: Basic Health Check
   - Package 2: Health Check + Awareness Training
   - Package 3: Full Dashboard + Employee Assessment

2. **Key-Pass Distribution System:**
   - Employers purchase packages and receive key-passes
   - Employees use key-passes for individual assessments
   - Dashboard analytics for employer oversight (Package 3)

3. **Comprehensive Assessment Modules:**
   - Risk Appetite
   - Fraud Triangle Analysis
   - People & Culture
   - Controls & Technology
   - Procurement, Payroll, Revenue, Cash & Banking
   - IT Systems
   - Monitoring & Evaluation
   - Fraud Response
   - Training & Awareness
   - Compliance Mapping

4. **AI-Powered Workflow:**
   - n8n workflow automation
   - Automated report generation
   - Risk scoring engine
   - Priority-based assessment routing

---

## Folder Structure

```
stop_fra/
├── CLAUDE.MD                          # This file - Project documentation
├── FRA_n8n_workflow_v2.json          # n8n automation workflow definition
│
├── fraud-risk-app-main/               # Main production app codebase
│   ├── app/                           # Expo Router screens
│   │   ├── _layout.tsx               # Root layout configuration
│   │   ├── index.tsx                 # Landing/home screen
│   │   ├── +not-found.tsx            # 404 error screen
│   │   │
│   │   ├── auth/                     # Authentication flows
│   │   │   ├── login.tsx             # Employer login
│   │   │   ├── signup.tsx            # Employer registration
│   │   │   └── keypass.tsx           # Employee key-pass login
│   │   │
│   │   ├── organisation.tsx          # Organisation profile setup
│   │   ├── packages.tsx              # Package selection screen
│   │   ├── payment.tsx               # Payment processing
│   │   ├── payments-module.tsx       # Payment integration module
│   │   │
│   │   ├── risk-appetite.tsx         # Assessment: Risk appetite
│   │   ├── fraud-triangle.tsx        # Assessment: Fraud triangle
│   │   ├── people-culture.tsx        # Assessment: People & culture
│   │   ├── controls-technology.tsx   # Assessment: Controls & tech
│   │   ├── procurement.tsx           # Assessment: Procurement
│   │   ├── payroll-hr.tsx           # Assessment: Payroll & HR
│   │   ├── revenue.tsx              # Assessment: Revenue
│   │   ├── cash-banking.tsx         # Assessment: Cash & banking
│   │   ├── it-systems.tsx           # Assessment: IT systems
│   │   ├── monitoring-evaluation.tsx # Assessment: Monitoring
│   │   ├── fraud-response.tsx       # Assessment: Fraud response
│   │   ├── training-awareness.tsx   # Assessment: Training
│   │   ├── compliance-mapping.tsx   # Assessment: Compliance
│   │   │
│   │   ├── review.tsx               # Assessment review screen
│   │   ├── priorities.tsx           # Risk priorities visualization
│   │   ├── action-plan.tsx          # Action plan generation
│   │   ├── signature.tsx            # Electronic signature
│   │   ├── confirmation.tsx         # Completion confirmation
│   │   ├── feedback.tsx             # User feedback collection
│   │   └── dashboard.tsx            # Employer dashboard (Package 3)
│   │
│   ├── contexts/                     # React Context providers
│   │   ├── AuthContext.tsx          # Authentication state management
│   │   └── AssessmentContext.tsx    # Assessment data management
│   │
│   ├── types/                        # TypeScript type definitions
│   │   └── assessment.ts            # Assessment data types
│   │
│   ├── constants/                    # App constants and configuration
│   │
│   ├── assets/                       # Static assets
│   │   └── images/                  # App icons and images
│   │
│   ├── docs/                         # Documentation
│   │   └── BACKEND-SPECIFICATION.md # Backend API & database spec
│   │
│   ├── package.json                  # Dependencies & scripts
│   ├── tsconfig.json                # TypeScript configuration
│   ├── app.json                     # Expo configuration
│   └── README.md                    # Project README
│
├── fraud-risk-app/                   # Development/testing instance
│   └── [Similar structure to fraud-risk-app-main]
│
└── Documentation PDFs/               # Reference materials
    ├── 6.7628_CO_Govt-Functional-Std_GovS013-Counter-Fraud_v4.pdf
    ├── Comprehensive Fraud Risk Assessment - Sections 9.3-14.pdf
    ├── FRAUD RIS. part 1(FRA).pdf
    ├── FRAUD RISK 1,1 (FRA).pdf
    ├── FRA_BRD_v2.pdf
    ├── FRA_GovS013_Template.pdf
    ├── FRA_Pilot_Package.docx
    ├── Failure to prevent fraud- what should you be doing before September.pdf
    └── Failure+to+Prevent+Fraud+Guidance+-+English+Language+v1.5.pdf
```

---

## Technology Stack

### Frontend (Mobile App)
- **React Native 0.81.5** - Cross-platform mobile framework
- **React 19.1.0** - UI library
- **Expo ~54.0** - React Native framework extension
- **Expo Router ~6.0** - File-based routing with web/SSR support
- **TypeScript ~5.9** - Type-safe JavaScript
- **Lucide React Native** - Icon library
- **Victory Native** - Data visualization charts
- **Zustand** - State management
- **React Query (@tanstack/react-query)** - Server state management

### Development Tools
- **Bun** - JavaScript runtime and package manager
- **Rork** - AI-powered mobile app development platform
- **ESLint** - Code linting
- **TypeScript** - Static type checking

### Backend Architecture (Planned)
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **Stripe** - Payment processing
- **S3/Cloud Storage** - File storage for signatures
- **n8n** - Workflow automation
- **Email Service** - Notification system
- **Redis** - Session management & caching

### AI/Automation
- **Claude Agent SDK** - AI work team orchestration
- **n8n Workflow Engine** - Automated processing pipeline
- **Custom Risk Scoring Engine** - Algorithmic risk calculation

---

## Backend Data Model

### Core Entities

1. **users** - Employers, employees, and admins
2. **organisations** - Organizations purchasing assessments
3. **assessments** - Main fraud risk assessments
4. **assessment_answers** - Questionnaire responses
5. **risk_register_items** - Identified risks with scores
6. **packages** - Available FRA packages
7. **purchases** - Payment transactions
8. **keypasses** - Employee access codes
9. **employee_assessments** - Individual employee assessments
10. **signatures** - Electronic signatures for sign-off
11. **feedback** - User feedback on assessment experience

### Key Relationships

```
Organisation (1) ──── (N) User
Organisation (1) ──── (N) Assessment
Organisation (1) ──── (N) KeyPass
Assessment (1) ──── (N) RiskRegisterItem
Assessment (1) ──── (N) AssessmentAnswers
Assessment (1) ──── (1) Signature [optional]
User (1) ──── (N) EmployeeAssessment
```

See `docs/BACKEND-SPECIFICATION.md` for complete API documentation.

---

## n8n Workflow Pipeline

**File:** `FRA_n8n_workflow_v2.json`

### Workflow Nodes

1. **Webhook Intake** - Receives assessment submissions
2. **Validate & Governance Check** - Validates mandatory fields, enriches data
3. **Store Intake JSON** - Archives raw submission to S3
4. **Generate FRA Draft** - Creates HTML report
5. **Upload FRA HTML** - Stores report in S3
6. **Send Exec Email** - Notifies stakeholders
7. **Insert Dashboard Row** - Updates analytics database

### Data Flow
```
POST /fra-intake-v2 → Validate → Store JSON → Generate Report →
Upload Report → Email + Dashboard Update
```

---

## Risk Scoring Logic

### Calculation Method

1. **Impact & Likelihood**: Each risk factor scored 1-5
2. **Inherent Risk Score**: `impact × likelihood` (1-25)
3. **Control Adjustment**: Apply reduction based on control strength:
   - Very strong controls: 40% reduction
   - Reasonably strong: 20% reduction
   - Some gaps/weak: 0% reduction
4. **Residual Risk Score**: `inherent × (1 - reduction)`
5. **Priority Bands**:
   - **High**: 15-25
   - **Medium**: 8-14
   - **Low**: 1-7

---

## Development Workflow

### Local Development

```bash
# Navigate to project
cd fraud-risk-app-main

# Install dependencies
bun install

# Start development server
bun run start

# Start web preview
bun run start-web

# iOS preview
bun run start -- --ios

# Android preview
bun run start -- --android
```

### Testing on Devices

**iOS**: Download Rork app or Expo Go from App Store
**Android**: Download Expo Go from Google Play
**Web**: `bun start-web` for browser testing

---

## Deployment Strategy

### Mobile App Deployment

**iOS App Store:**
```bash
bun i -g @expo/eas-cli
eas build:configure
eas build --platform ios
eas submit --platform ios
```

**Google Play:**
```bash
eas build --platform android
eas submit --platform android
```

### Web Deployment

**Options:**
- EAS Hosting: `eas hosting:deploy`
- Vercel: Direct GitHub integration
- Netlify: Automated deployments

---

## Security & Compliance

### Authentication
- JWT tokens with appropriate expiration
- Bcrypt/Argon2 password hashing (cost factor 10+)
- Rate limiting on auth endpoints

### Authorization
- Role-based access control (employer/employee/admin)
- Organisation-scoped data access
- Package-based feature gating

### Data Privacy
- GDPR compliant data handling
- Encrypted sensitive data at rest
- Audit logging for data access
- 6-year record retention for compliance

### Compliance Requirements
- GovS-013 fraud prevention standard
- ECCTA 2023 economic crime provisions
- Failure-to-prevent fraud regulations
- Automated regulatory reporting

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/signup` - Employer registration
- `POST /api/auth/login` - Standard login
- `POST /api/auth/keypass-login` - Employee key-pass login
- `POST /api/auth/logout` - Session termination

### Assessments
- `POST /api/assessments` - Create new assessment
- `GET /api/assessments/:id` - Retrieve assessment
- `PATCH /api/assessments/:id` - Update assessment
- `POST /api/assessments/:id/submit` - Submit for processing

### Packages & Payments
- `GET /api/packages` - List available packages
- `GET /api/packages/recommended` - Get recommended package
- `POST /api/purchases` - Initiate purchase
- `POST /api/purchases/:id/confirm` - Confirm payment

### Key-Passes
- `POST /api/keypasses/allocate` - Generate key-passes
- `GET /api/keypasses/organisation/:orgId` - List organisation key-passes
- `POST /api/keypasses/validate` - Validate key-pass code
- `PATCH /api/keypasses/:code/use` - Mark key-pass as used

### Dashboard (Package 3)
- `GET /api/dashboard/organisation/:orgId` - Dashboard metrics
- `GET /api/dashboard/organisation/:orgId/export` - Export CSV

See `docs/BACKEND-SPECIFICATION.md` for complete API specification.

---

## Implementation Checklist

### Backend Infrastructure
- [ ] Set up PostgreSQL database with schema
- [ ] Implement JWT authentication system
- [ ] Create RESTful API endpoints
- [ ] Implement key-pass generation algorithm
- [ ] Build risk scoring engine
- [ ] Integrate Stripe payment gateway
- [ ] Implement S3 file storage for signatures
- [ ] Set up email notification service
- [ ] Deploy n8n workflow automation
- [ ] Create admin panel for feedback review
- [ ] Implement audit logging system
- [ ] Set up monitoring and alerting

### Frontend Development
- [x] Expo Router file-based navigation
- [x] Authentication flows (login/signup/keypass)
- [x] Organisation profile management
- [x] Package selection & payment
- [x] 13 assessment module screens
- [x] Risk register visualization
- [x] Action plan generation
- [x] Electronic signature capture
- [x] Employer dashboard (Package 3)
- [ ] Employee dashboard (Package 2/3)
- [ ] Offline data persistence
- [ ] Push notification integration

### Testing & Quality
- [ ] Unit tests for risk scoring logic
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical user flows
- [ ] Security penetration testing
- [ ] Performance testing & optimization
- [ ] Accessibility compliance (WCAG 2.1)
- [ ] Cross-browser/device testing

### Documentation
- [x] Backend specification document
- [x] Project structure documentation
- [x] n8n workflow definition
- [ ] API documentation (OpenAPI/Swagger)
- [ ] User guide documentation
- [ ] Admin guide documentation
- [ ] Developer onboarding guide

### DevOps
- [ ] CI/CD pipeline setup
- [ ] Database migration scripts
- [ ] Automated backup & recovery
- [ ] Environment configuration management
- [ ] Production monitoring dashboards
- [ ] Error tracking & logging (Sentry/similar)

---

## AI Work Team Integration

### Claude Agent SDK Usage

This project leverages Claude agents for:

1. **Code Generation** - Automated component scaffolding
2. **Risk Analysis** - Intelligent risk scoring recommendations
3. **Report Generation** - Automated FRA report compilation
4. **Data Validation** - Input validation and sanitization
5. **Testing Automation** - Test case generation
6. **Documentation** - Auto-generated API docs

### Agent Roles

- **Architect Agent** - System design and planning
- **Backend Agent** - API and database development
- **Frontend Agent** - UI/UX implementation
- **Testing Agent** - Quality assurance
- **DevOps Agent** - Infrastructure and deployment
- **Documentation Agent** - Technical writing

---

## Contributing Guidelines

### Branch Strategy
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature development
- `bugfix/*` - Bug fixes
- `hotfix/*` - Production hotfixes

### Code Standards
- TypeScript strict mode enabled
- ESLint configuration enforced
- Prettier for code formatting
- Conventional Commits specification
- Comprehensive code comments
- JSDoc documentation for public APIs

### Review Process
1. Create feature branch from `develop`
2. Implement changes with tests
3. Run linting and type checks
4. Submit pull request with description
5. Minimum 1 reviewer approval required
6. Automated CI checks must pass
7. Merge to `develop` (squash commits)

---

## Support & Resources

### Documentation Links
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Rork Platform](https://rork.com)
- [GovS-013 Standard](https://www.gov.uk/government/publications/government-functional-standard-govs-013-counter-fraud)
- [ECCTA 2023 Guidance](https://www.gov.uk/government/collections/economic-crime-and-corporate-transparency-act)

### Contact Information
- **Development Team:** FRA Development Team
- **Project Repository:** [TBD]
- **Issue Tracker:** [TBD]
- **Documentation Site:** [TBD]

---

## Troubleshooting

### Common Issues

**App not loading on device:**
- Ensure device and computer on same WiFi
- Try tunnel mode: `bun start -- --tunnel`
- Check firewall settings

**Build failing:**
- Clear cache: `bunx expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && bun install`
- Check Expo troubleshooting guide

**Database connection issues:**
- Verify PostgreSQL service running
- Check connection string environment variables
- Ensure database migrations applied

**n8n workflow not triggering:**
- Verify webhook URL configuration
- Check S3 bucket permissions
- Review workflow node connections

---

## Version History

**v2.0 (Current)**
- Complete mobile app implementation
- Multi-package system with key-passes
- Employer dashboard (Package 3)
- n8n workflow automation
- Backend specification complete

**v1.0 (Pilot)**
- Basic assessment flow
- Manual report generation
- Single-package model

---

## License

[TBD - Specify license type]

---

## Acknowledgments

This project implements guidance from:
- UK Government Functional Standard GovS-013
- Economic Crime and Corporate Transparency Act 2023
- Failure to Prevent Fraud guidance (v1.5)

Built with Rork AI mobile development platform and Claude Agent SDK.

---

**Last Updated:** December 20, 2025
**Maintained By:** AI Work Team
**Document Version:** 1.0
