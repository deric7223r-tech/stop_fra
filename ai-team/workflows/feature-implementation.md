# Feature Implementation Workflow

This workflow guides AI agents through the complete process of implementing a new feature in Stop FRA.

## Workflow Overview

1. Planning & Analysis
2. Code Review & Understanding
3. Implementation
4. Testing
5. Documentation
6. Code Review
7. Deployment

---

## Phase 1: Planning & Analysis

### 1.1 Understand Requirements
- [ ] Read user story and acceptance criteria
- [ ] Identify affected components (backend/frontend/both)
- [ ] Assess compliance impact (GovS-013, ECCTA, data retention)
- [ ] List technical dependencies
- [ ] Estimate complexity (simple/moderate/complex)

### 1.2 Create Task List
- [ ] Use TodoWrite tool to create implementation task list
- [ ] Break down feature into discrete, testable units
- [ ] Identify validation checkpoints
- [ ] Set priority for tasks

### 1.3 Review Architecture
- [ ] Review CLAUDE.md for project context
- [ ] Check relevant architecture documentation
- [ ] Identify design patterns to follow
- [ ] Review similar existing features for consistency

**Checkpoint:** Can you clearly explain the feature, its requirements, and implementation approach?

---

## Phase 2: Code Review & Understanding

### 2.1 Locate Relevant Code
- [ ] Use Glob tool to find related files
- [ ] Use Grep tool to search for similar functionality
- [ ] Identify files that need modification
- [ ] Identify files that need creation

### 2.2 Read Existing Code
- [ ] Read all files that will be modified
- [ ] Understand current patterns and conventions
- [ ] Identify potential conflicts or breaking changes
- [ ] Note any technical debt to address

### 2.3 Database Impact Analysis
- [ ] Check if schema changes needed
- [ ] Review existing migrations
- [ ] Plan new migrations if required
- [ ] Consider data migration for existing records

**Checkpoint:** Do you understand the existing codebase well enough to make changes confidently?

---

## Phase 3: Implementation

### 3.1 Backend Implementation (if applicable)

#### Database Changes
- [ ] Update schema.ts with new tables/columns
- [ ] Generate migration: `npm run db:generate`
- [ ] Review generated migration file
- [ ] Test migration: `npm run db:migrate`

#### Service Layer
- [ ] Create/update service in `/backend/src/services/`
- [ ] Implement business logic with proper error handling
- [ ] Use Zod schemas for validation
- [ ] Add appropriate logging with Pino

#### API Layer
- [ ] Create/update controller in `/backend/src/controllers/`
- [ ] Add routes in `/backend/src/routes/`
- [ ] Implement authentication/authorization checks
- [ ] Add input validation with Zod

#### Middleware (if needed)
- [ ] Create middleware in `/backend/src/middleware/`
- [ ] Register middleware in appropriate routes
- [ ] Test middleware isolation

### 3.2 Frontend Implementation (if applicable)

#### UI Components
- [ ] Create components in `/fraud-risk-app-main/components/`
- [ ] Follow UK Government Design System patterns
- [ ] Ensure responsive design (mobile-first)
- [ ] Add proper TypeScript types

#### Screens/Pages
- [ ] Create screen in `/fraud-risk-app-main/app/`
- [ ] Implement navigation using Expo Router
- [ ] Add proper layout and styling
- [ ] Handle loading and error states

#### State Management
- [ ] Add to relevant context (AuthContext/AssessmentContext)
- [ ] Or create new Zustand store if needed
- [ ] Implement optimistic updates where appropriate
- [ ] Handle offline scenarios with AsyncStorage

#### API Integration
- [ ] Add API calls to `/fraud-risk-app-main/services/api.service.ts`
- [ ] Use TanStack Query for caching
- [ ] Handle authentication token refresh
- [ ] Implement error handling

### 3.3 Security Considerations
- [ ] Input validation (Zod schemas)
- [ ] SQL injection prevention (use Drizzle ORM parameterized queries)
- [ ] XSS prevention (proper output encoding)
- [ ] Authentication checks (JWT validation)
- [ ] Authorization checks (role-based access)
- [ ] Audit logging (record in audit_logs table)

**Checkpoint:** Does the implementation meet all acceptance criteria?

---

## Phase 4: Testing

### 4.1 Write Unit Tests
- [ ] Create test file in appropriate `/test` directory
- [ ] Test all public functions/methods
- [ ] Test edge cases and error conditions
- [ ] Test validation logic
- [ ] Aim for >80% code coverage

### 4.2 Write Integration Tests
- [ ] Test API endpoints end-to-end
- [ ] Test database operations
- [ ] Test authentication/authorization
- [ ] Test error responses

### 4.3 Run Tests
- [ ] Run unit tests: `npm test`
- [ ] Run integration tests: `npm run test:integration`
- [ ] Verify all tests pass
- [ ] Check code coverage report

### 4.4 Manual Testing
- [ ] Test happy path flows
- [ ] Test error scenarios
- [ ] Test edge cases
- [ ] Test on different devices/browsers (if frontend)
- [ ] Test accessibility with keyboard navigation
- [ ] Test with screen reader (if frontend)

**Checkpoint:** Do all tests pass? Is coverage adequate?

---

## Phase 5: Documentation

### 5.1 Code Documentation
- [ ] Add JSDoc comments to public functions
- [ ] Document complex algorithms
- [ ] Add inline comments for non-obvious logic
- [ ] Update TypeScript type definitions

### 5.2 API Documentation
- [ ] Update backend/README.md with new endpoints
- [ ] Document request/response schemas
- [ ] Add example requests and responses
- [ ] Document error codes

### 5.3 Project Documentation
- [ ] Update CLAUDE.md if architectural changes made
- [ ] Update QUICK_START.md if setup changes required
- [ ] Add to TECHNICAL_REPORT.md if significant feature
- [ ] Update relevant architecture strategy docs

### 5.4 User Documentation (if needed)
- [ ] Create user guide for new feature
- [ ] Add screenshots/videos if helpful
- [ ] Document any configuration required
- [ ] Update FAQ if needed

**Checkpoint:** Is all documentation clear and complete?

---

## Phase 6: Code Quality Review

### 6.1 Self Review
- [ ] Review all changed files
- [ ] Check for code duplication
- [ ] Verify TypeScript strict mode compliance
- [ ] Check for proper error handling
- [ ] Verify no console.log statements left
- [ ] Check for security vulnerabilities

### 6.2 Linting & Formatting
- [ ] Run ESLint: `npm run lint`
- [ ] Fix any linting errors
- [ ] Ensure consistent formatting
- [ ] Check for unused imports

### 6.3 Security Check
- [ ] Run `npm audit`
- [ ] Review OWASP Top 10 compliance
- [ ] Check for exposed secrets
- [ ] Verify input validation
- [ ] Check authentication/authorization

### 6.4 Accessibility Check (Frontend)
- [ ] Verify WCAG 2.1 Level AA compliance
- [ ] Check color contrast ratios
- [ ] Verify keyboard navigation
- [ ] Test with screen reader
- [ ] Check alt text on images
- [ ] Verify form labels

**Checkpoint:** Does code meet all quality standards?

---

## Phase 7: Deployment

### 7.1 Prepare for Commit
- [ ] Stage changed files
- [ ] Review git diff
- [ ] Ensure no unintended changes included
- [ ] Check branch name follows convention

### 7.2 Commit Changes
- [ ] Write clear commit message
- [ ] Follow conventional commit format
- [ ] Reference issue/task number
- [ ] Focus on "why" not just "what"

### 7.3 Push to Remote
- [ ] Push to feature branch: `git push -u origin claude/[feature-name]-[session-id]`
- [ ] Verify push successful
- [ ] Check CI/CD pipeline status
- [ ] Address any CI failures

### 7.4 Create Pull Request (if ready for review)
- [ ] Create PR with descriptive title
- [ ] Add comprehensive description
- [ ] Include test plan
- [ ] Add screenshots/videos if UI changes
- [ ] Link related issues
- [ ] Request reviews from appropriate team members

**Checkpoint:** Is the feature ready for production deployment?

---

## Rollback Procedure

If issues are discovered after deployment:

1. **Immediate Actions**
   - [ ] Assess severity and impact
   - [ ] Document the issue
   - [ ] Notify stakeholders

2. **Rollback Steps**
   - [ ] Revert commit if safe: `git revert [commit-hash]`
   - [ ] Or rollback database migration if needed
   - [ ] Deploy previous stable version
   - [ ] Verify rollback successful

3. **Post-Rollback**
   - [ ] Investigate root cause
   - [ ] Create fix in separate branch
   - [ ] Re-test thoroughly
   - [ ] Re-deploy when stable

---

## Common Pitfalls to Avoid

1. **Not reading existing code** - Always review before modifying
2. **Skipping tests** - Tests catch bugs before production
3. **Inadequate error handling** - Always handle edge cases
4. **Breaking existing functionality** - Run full test suite
5. **Poor commit messages** - Be descriptive and clear
6. **Ignoring security** - Always validate inputs
7. **Forgetting documentation** - Document as you go
8. **Not considering accessibility** - Test with assistive tech
9. **Hardcoding values** - Use environment variables
10. **Not logging audit events** - Compliance requires audit trails

---

## Workflow Templates

### Simple Feature (1-2 files, no DB changes)
1. Read existing code
2. Implement changes
3. Write tests
4. Update docs
5. Commit and push

### Moderate Feature (Multiple files, possible DB changes)
1. Plan and create task list
2. Review architecture
3. Implement backend + frontend
4. Write comprehensive tests
5. Update all documentation
6. Code review
7. Commit and push

### Complex Feature (New system, DB changes, multiple components)
1. Detailed planning and analysis
2. Architecture review and approval
3. Phased implementation (backend → frontend → integration)
4. Extensive testing (unit + integration + E2E)
5. Comprehensive documentation
6. Security review
7. Performance testing
8. Staged deployment (staging → production)

---

**Workflow Version:** 1.0
**Last Updated:** January 2026
**Maintained By:** AI Work Team - Guarding Assessment
