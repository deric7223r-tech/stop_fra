# CLAUDE.md - Stop FRA AI Work Team Project Guide

## Project Overview

**Project Name:** Stop FRA - Fraud Risk Assessment Platform
**Brand:** Guarding Assessment (Marketing Agency)
**Purpose:** Comprehensive Fraud Risk Assessment Platform for UK organizations
**Target Market:** UK businesses requiring compliance with fraud prevention regulations
**Team Type:** AI Work Team for Marketing Agency Operations

---

## About Guarding Assessment Brand

**Guarding Assessment** is a marketing agency brand specializing in fraud prevention and compliance solutions for UK organizations. Our flagship product, **Stop FRA**, helps businesses navigate complex regulatory requirements through innovative technology and comprehensive risk assessment methodologies.

### Brand Mission
To empower UK organizations with cutting-edge fraud risk assessment tools that ensure compliance, protect assets, and build resilient fraud prevention frameworks.

### Brand Values
- **Compliance Excellence:** Meeting and exceeding regulatory standards
- **User-Centric Design:** Accessible, intuitive interfaces for all users
- **Data Security:** Enterprise-grade protection of sensitive information
- **Innovation:** Leveraging AI and automation for better outcomes
- **Transparency:** Clear reporting and actionable insights

---

## What Stop FRA Does

The Stop FRA platform enables UK organizations to:

1. **Conduct Comprehensive Fraud Risk Assessments**
   - 13 specialized assessment modules covering all fraud vectors
   - Structured questionnaires aligned with UK government standards
   - Employee self-assessment capabilities

2. **Comply with UK Government Functional Standard for Counter-Fraud (GovS-013)**
   - Question mapping to GovS-013 requirements
   - Compliance gap identification
   - Automated compliance reporting

3. **Meet Economic Crime and Corporate Transparency Act 2023 (ECCTA 2023) Requirements**
   - 7-section regulatory report generation
   - Audit trail logging for regulatory review
   - 6-year data retention compliance

4. **Prepare for September 2025 Failure-to-Prevent Fraud Regulations**
   - Proactive risk identification
   - Control adequacy assessment
   - Action plan generation for risk mitigation

---

## Key Workflow

### For Employers (Organizations)

1. **Purchase Assessment Package**
   - Choose from 3 package tiers (Health Check, With Awareness, With Dashboard)
   - Complete secure payment via Stripe
   - Receive key-passes for employee distribution

2. **Distribute Key-Passes**
   - Allocate unique key-pass codes to employees/assessors
   - Track key-pass usage and expiration
   - Monitor assessment completion rates

3. **Monitor Progress & Results**
   - View real-time risk scores (Package 3)
   - Access compliance reports
   - Download action plans and risk registers

### For Employees/Assessors

1. **Access Assessment**
   - Use provided key-pass code (no account required)
   - Complete 13-module fraud risk assessment
   - Provide honest, detailed responses

2. **Submit Assessment**
   - Review answers before submission
   - Provide electronic signature
   - Submit feedback on assessment experience

3. **Receive Results**
   - Automatically generated risk scores
   - Prioritized risk register
   - Compliance gap analysis

---

## Package Tiers

| Package | Features | Price | Key-Passes | Best For |
|---------|----------|-------|-----------|----------|
| **Health Check** | Basic assessment only | £500 | 100 | Small organizations, initial assessment |
| **With Awareness** | Assessment + 30-min fraud awareness training | £1,500 | 100 | Organizations needing staff education |
| **With Dashboard** | Full analytics dashboard, historical tracking, advanced reports | £3,000 | 250 | Large organizations, ongoing monitoring |

---

## Technical Architecture

### Technology Stack

#### Backend
- **Framework:** Hono 4.6 (Node.js lightweight web framework)
- **Language:** TypeScript 5.9 (strict mode)
- **Database:** PostgreSQL 14+ with Drizzle ORM
- **Authentication:** JWT with bcrypt password hashing
- **Payment:** Stripe integration
- **Storage:** AWS S3 for signatures/documents
- **Cache:** Redis (optional)
- **Logging:** Pino with audit trail

#### Frontend
- **Framework:** React Native 0.81 + Expo 54
- **Routing:** Expo Router 6.0 (file-based)
- **Language:** TypeScript 5.9
- **State Management:** Zustand, React Context, TanStack Query
- **UI Components:** Custom component library
- **Charts:** Victory Native
- **Icons:** Lucide React Native
- **Storage:** AsyncStorage (offline support)

#### Infrastructure
- **Version Control:** Git + GitHub
- **CI/CD:** GitHub Actions
- **Deployment:** Docker-ready (staging & production workflows)
- **Security:** OWASP best practices, npm audit, Snyk scanning

---

## Database Schema (12 Core Tables)

1. **users** - User accounts (employers, employees, admins)
2. **organisations** - Organization/company profiles
3. **assessments** - Main assessment records
4. **assessment_answers** - Questionnaire responses (JSONB)
5. **risk_register_items** - Calculated risks with scores
6. **packages** - Pricing tiers and features
7. **purchases** - Payment transactions
8. **keypasses** - Employee access codes
9. **employee_assessments** - Individual employee assessments
10. **signatures** - Electronic signature records
11. **feedback** - User ratings and comments
12. **audit_logs** - Compliance audit trail

---

## API Architecture

**Base URL:** `/api/v1/`

### Key Endpoints

#### Authentication (`/auth`)
- `POST /signup` - Register employer
- `POST /login` - User login
- `POST /refresh` - Refresh JWT token
- `GET /me` - Current user info

#### Assessments (`/assessments`)
- `POST /` - Create new assessment
- `GET /:id` - Retrieve assessment
- `PATCH /:id` - Update assessment
- `POST /:id/submit` - Submit completed assessment
- `GET /:id/risk-register` - Get risk register

#### Key-Passes (`/keypasses`)
- `POST /validate` - Validate key-pass code
- `POST /use` - Use key-pass to start assessment
- `POST /allocate` - Allocate key-pass to organization
- `GET /organisation/:orgId` - List organization key-passes

#### Packages (`/packages`)
- `GET /` - List all packages
- `GET /recommended` - Get recommended package

#### Purchases (`/purchases`)
- `POST /` - Create purchase
- `POST /:id/confirm` - Confirm payment
- `GET /organisation/:orgId` - Organization purchase history

#### Compliance (`/compliance`)
- `GET /report` - Generate ECCTA 2023 compliance report

---

## Assessment Modules (13 Total)

1. **Organisation Details** - Company profile, size, industry
2. **Risk Appetite** - Organizational risk tolerance
3. **Fraud Triangle** - Motivation, opportunity, rationalization
4. **Procurement** - Vendor management fraud risks
5. **Cash & Banking** - Financial transaction security
6. **Payroll & HR** - Employee data and compensation fraud
7. **Revenue** - Sales and customer-related fraud
8. **IT Systems** - Technology and cyber fraud risks
9. **People & Culture** - Organizational culture assessment
10. **Controls & Technology** - Control environment evaluation
11. **Training & Awareness** - Fraud awareness programs
12. **Monitoring & Evaluation** - Detection and response capabilities
13. **Compliance Mapping** - GovS-013 & ECCTA alignment

---

## Risk Scoring Algorithm

### Inherent Risk Calculation
```
Inherent Risk Score = Impact (1-5) × Likelihood (1-5)
Result: 1-25 scale
```

### Control Effectiveness Adjustment
- **Very Strong Controls:** 40% reduction
- **Reasonably Strong Controls:** 20% reduction
- **Weak/No Controls:** 0% reduction

### Residual Risk Calculation
```
Residual Risk Score = Inherent Score × (1 - Control Reduction %)
```

### Priority Bands
- **High Priority:** 15-25 (immediate action required)
- **Medium Priority:** 8-14 (monitor and plan)
- **Low Priority:** 1-7 (routine monitoring)

### Overall Risk Level
Aggregated calculation across all identified risk factors with weighted scoring based on section importance.

---

## Regulatory Compliance

### GovS-013 (UK Government Functional Standard for Counter-Fraud)
- Assessment questions mapped to GovS-013 requirements
- Compliance gap reporting
- Action plan generation for standard adherence

### ECCTA 2023 (Economic Crime and Corporate Transparency Act)
- 7-section compliance report:
  1. Executive Summary
  2. Fraud Risk Identification
  3. Control Environment Assessment
  4. Risk Mitigation Strategies
  5. Training & Awareness Programs
  6. Monitoring & Detection Mechanisms
  7. Regulatory Compliance Status
- Automated report generation via `/api/v1/compliance/report`

### Failure-to-Prevent Fraud (September 2025)
- Proactive risk assessment framework
- Evidence-based control documentation
- Regular review and update mechanisms

### Data Retention
- **Compliance Period:** 6 years (regulatory requirement)
- **Soft Deletes:** Records marked as deleted but retained
- **Automated Cleanup:** Scheduled jobs for compliant data purging

---

## Project Structure

```
stop_fra/
├── backend/                          # Node.js + Hono REST API
│   ├── src/
│   │   ├── controllers/              # HTTP request handlers
│   │   ├── services/                 # Business logic (8 core services)
│   │   ├── routes/                   # API route definitions
│   │   ├── db/                       # Database layer (schema, migrations, seed)
│   │   ├── middleware/               # Auth, CORS, logging
│   │   ├── jobs/                     # Background jobs
│   │   └── utils/                    # Utilities
│   ├── drizzle/                      # Migration files
│   └── test/                         # Backend tests
│
├── fraud-risk-app-main/              # React Native + Expo frontend
│   ├── app/                          # Expo Router screens (32 screens)
│   │   ├── auth/                     # Login, signup, key-pass
│   │   └── [13 assessment modules]   # Assessment questionnaires
│   ├── components/ui/                # Reusable UI components
│   ├── contexts/                     # State management (Auth, Assessment)
│   ├── services/                     # API & auth services
│   ├── types/                        # TypeScript definitions
│   └── constants/                    # App configuration
│
├── .github/workflows/                # CI/CD pipelines
│
├── ai-team/                          # AI work team collaboration (NEW)
│   ├── prompts/                      # AI prompt templates
│   ├── workflows/                    # AI-assisted workflows
│   └── knowledge-base/               # AI context documents
│
├── brand/                            # Guarding Assessment brand (NEW)
│   ├── marketing/                    # Marketing materials
│   ├── assets/                       # Brand assets
│   └── guidelines/                   # Brand guidelines
│
└── docs/                             # Comprehensive documentation
```

---

## AI Work Team Guidelines

### Purpose
This AI work team collaborates on the Stop FRA platform development, focusing on:
- Feature development and enhancement
- Code quality and testing
- Documentation maintenance
- Compliance updates
- Marketing material generation

### AI Agent Roles

#### 1. Backend Architect Agent
- API endpoint design
- Database schema optimization
- Security implementation
- Performance tuning

#### 2. Frontend Engineer Agent
- UI/UX component development
- Mobile app optimization
- Accessibility compliance
- User experience enhancement

#### 3. QA Testing Agent
- Test case generation
- Integration testing
- Security testing
- Performance testing

#### 4. Documentation Agent
- Technical documentation
- User guides
- API documentation
- Compliance reports

#### 5. Marketing Content Agent
- Brand messaging
- Product descriptions
- Case studies
- Educational content

### Collaboration Workflow

1. **Task Planning**
   - Use TodoWrite tool for task tracking
   - Break down complex tasks into steps
   - Assign tasks to appropriate specialized agents

2. **Code Development**
   - Always read existing code before modifying
   - Follow TypeScript strict mode
   - Maintain type safety
   - Write tests for new features

3. **Quality Assurance**
   - Run tests before committing
   - Check linting and formatting
   - Verify accessibility compliance
   - Conduct security reviews

4. **Documentation**
   - Update relevant docs with changes
   - Maintain API documentation
   - Keep CLAUDE.md current
   - Document architectural decisions

5. **Deployment**
   - Follow git workflow (feature branches)
   - Create descriptive commit messages
   - Push to designated branches
   - Create pull requests with summaries

---

## Development Workflow

### Git Branch Strategy
- **Main Branch:** `main` (production-ready code)
- **Feature Branches:** `claude/[feature-name]-[session-id]`
- **Naming Convention:** Must start with `claude/` and end with session ID

### Commit Guidelines
- Use conventional commit format
- Focus on "why" rather than "what"
- Reference relevant issues/tasks
- Keep commits atomic and focused

### Testing Requirements
- Write unit tests for business logic
- Create integration tests for API endpoints
- Ensure tests pass before committing
- Maintain >80% code coverage goal

### Code Quality Standards
- TypeScript strict mode (no implicit any)
- ESLint compliance
- Proper error handling
- Meaningful variable names
- DRY principle (Don't Repeat Yourself)

---

## Environment Setup

### Prerequisites
- Node.js 20.0.0+
- PostgreSQL 14+
- Bun or npm package manager
- Git
- Expo CLI (for mobile development)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure .env file
npm run db:migrate
npm run db:seed
npm run dev
```

### Frontend Setup
```bash
cd fraud-risk-app-main
bun install
bun start
```

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd fraud-risk-app-main
bun test
```

---

## Security Considerations

### Authentication & Authorization
- JWT with secure random secrets
- Bcrypt password hashing (12 rounds)
- Token expiration (24h access, 7d refresh)
- Role-based access control

### Data Protection
- HTTPS/TLS for all communications
- Encrypted database connections
- Secure environment variable management
- Input validation with Zod schemas

### OWASP Top 10 Mitigation
- SQL Injection: Parameterized queries via Drizzle ORM
- XSS: Input sanitization and output encoding
- CSRF: Token-based protection
- Authentication: Secure JWT implementation
- Sensitive Data: Encryption at rest and in transit

### Audit & Compliance
- Complete audit trail logging
- IP address and user agent tracking
- 6-year data retention
- Regular security scanning (Snyk, npm audit)

---

## Performance Optimization

### Backend
- Database query optimization
- Redis caching for frequent reads
- Connection pooling
- API response pagination
- Efficient JSONB queries

### Frontend
- Code splitting
- Lazy loading components
- Image optimization
- Offline-first architecture
- AsyncStorage caching

---

## Monitoring & Logging

### Backend Logging
- Pino structured logging
- Log levels: debug, info, warn, error
- Request/response logging
- Error stack traces
- Audit trail logging

### Audit Trail
All critical actions logged:
- User authentication events
- Assessment submissions
- Payment transactions
- Key-pass usage
- Data modifications

---

## External Integrations

### Stripe Payment Processing
- Test mode and live mode support
- Webhook handling for payment confirmations
- Secure API key management
- Payment status tracking

### AWS S3 Storage
- Signature image storage
- Document upload capability
- Secure presigned URLs
- EU region (eu-west-2) for GDPR

### n8n Workflow Automation (Planned)
- Assessment notification workflows
- Report generation automation
- Email notifications
- Webhook integrations

---

## Deployment Strategy

### Staging Environment
- Automatic deployment from feature branches
- Integration test execution
- Smoke test validation
- Client preview access

### Production Environment
- Manual approval required
- Database migration execution
- Health check validation
- Rollback capability
- Zero-downtime deployment

---

## Key Metrics & KPIs

### Technical Metrics
- API response time: <200ms (p95)
- Database query time: <50ms (p95)
- Test coverage: >80%
- TypeScript type coverage: 100%
- Zero critical security vulnerabilities

### Business Metrics
- Assessment completion rate
- Key-pass utilization rate
- Package conversion rate
- User satisfaction score (feedback)
- Compliance report generation time

---

## Documentation Resources

### Primary Documentation
- **QUICK_START.md** - Setup and running guide
- **TECHNICAL_REPORT.md** - Architecture and status
- **BACKEND_ARCHITECTURE_STRATEGY.md** - Backend design
- **FRONTEND_ARCHITECTURE_STRATEGY.md** - Frontend design
- **TESTING_ARCHITECTURE_STRATEGY.md** - Testing approach

### API Documentation
- **backend/README.md** - API endpoints and usage
- **backend/INTEGRATION_GUIDE.md** - Frontend-backend integration

### Compliance Documentation
- **backend/COMPLIANCE_IMPLEMENTATION_SUMMARY.md** - ECCTA compliance
- **backend/SECURITY_AUDIT_CHECKLIST.md** - Security checklist

---

## Roadmap & Future Enhancements

### Planned Features
- Multi-language support (Welsh, Scottish Gaelic)
- Advanced analytics dashboard enhancements
- Mobile app native features (biometric auth)
- AI-powered risk prediction
- Automated fraud awareness training modules
- Integration with accounting software (Xero, QuickBooks)
- Enhanced reporting (PowerBI, Tableau exports)

### Technical Improvements
- GraphQL API alternative
- Real-time WebSocket updates
- Advanced caching strategies
- Kubernetes deployment
- APM monitoring (Datadog, New Relic)
- E2E test automation

---

## Support & Resources

### Getting Help
- GitHub Issues: Report bugs and feature requests
- Documentation: Comprehensive guides in `/docs`
- Code Comments: Inline documentation in codebase

### Contact
- **Brand:** Guarding Assessment
- **Product:** Stop FRA
- **Repository:** github.com/[organization]/stop_fra

---

## License & Compliance

### Software License
Proprietary - All rights reserved by Guarding Assessment

### Data Protection
- GDPR compliant
- UK data residency
- Privacy by design
- Data subject rights supported

### Regulatory Alignment
- GovS-013 compliant
- ECCTA 2023 compliant
- Failure-to-prevent fraud regulations ready

---

## Glossary

- **GovS-013:** UK Government Functional Standard for Counter-Fraud
- **ECCTA 2023:** Economic Crime and Corporate Transparency Act 2023
- **Key-Pass:** Unique access code for employee assessment
- **Inherent Risk:** Risk level before controls applied
- **Residual Risk:** Risk level after controls applied
- **Risk Register:** Prioritized list of identified risks
- **Fraud Triangle:** Framework analyzing fraud motivation, opportunity, rationalization

---

## Version History

- **v1.0** - Initial platform launch
- **Current:** Production-ready with all core features
- **Next:** Enhanced analytics and AI integration

---

**Last Updated:** January 2026
**Maintained By:** AI Work Team - Guarding Assessment
**Document Purpose:** Central reference for AI agents working on Stop FRA platform
