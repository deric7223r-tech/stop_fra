# Feature Development Prompt Template

Use this template when implementing new features in Stop FRA.

## Prompt Structure

```
I need to implement [FEATURE_NAME] for the Stop FRA platform.

Context:
- User Story: [USER_STORY]
- Acceptance Criteria: [CRITERIA_LIST]
- Affected Components: [BACKEND/FRONTEND/BOTH]
- Compliance Impact: [GovS-013/ECCTA/None]

Requirements:
1. [REQUIREMENT_1]
2. [REQUIREMENT_2]
3. [REQUIREMENT_3]

Technical Specifications:
- Database Changes: [YES/NO - describe if yes]
- API Endpoints: [LIST_ENDPOINTS]
- UI Components: [LIST_COMPONENTS]
- Testing Requirements: [UNIT/INTEGRATION/E2E]

Please:
1. Review existing code in [RELEVANT_FILES]
2. Implement the feature following TypeScript strict mode
3. Write comprehensive tests
4. Update API documentation
5. Ensure WCAG 2.1 AA compliance (if frontend)
6. Update CLAUDE.md if architectural changes made

Reference Documentation:
- Architecture: [LINK_TO_RELEVANT_DOCS]
- Similar Features: [LINK_TO_SIMILAR_IMPLEMENTATION]
```

## Example Usage

```
I need to implement multi-factor authentication (MFA) for the Stop FRA platform.

Context:
- User Story: As an employer, I want to enable MFA on my account to
              improve security and meet insurance requirements
- Acceptance Criteria:
  * Users can enable/disable MFA in account settings
  * Support TOTP-based authentication (Google Authenticator, Authy)
  * Backup codes provided for account recovery
  * MFA status visible in user profile
- Affected Components: BOTH (backend + frontend)
- Compliance Impact: Enhanced security for ECCTA 2023 compliance

Requirements:
1. Add MFA enrollment flow with QR code generation
2. Validate TOTP codes during login
3. Generate and store backup codes securely
4. Add MFA requirement toggle for organizations
5. Audit log all MFA-related events

Technical Specifications:
- Database Changes: YES
  * Add mfa_enabled boolean to users table
  * Add mfa_secret encrypted field to users table
  * Add backup_codes table with user_id foreign key
- API Endpoints:
  * POST /api/v1/auth/mfa/enroll - Start MFA enrollment
  * POST /api/v1/auth/mfa/verify - Verify TOTP code
  * POST /api/v1/auth/mfa/disable - Disable MFA
  * GET /api/v1/auth/mfa/backup-codes - Generate backup codes
- UI Components:
  * MFAEnrollmentScreen component
  * QRCodeDisplay component
  * BackupCodesDisplay component
  * MFAVerification component
- Testing Requirements: UNIT + INTEGRATION

Please:
1. Review existing code in backend/src/services/auth.service.ts
2. Implement the feature following TypeScript strict mode
3. Write comprehensive tests for auth flows
4. Update API documentation in backend/README.md
5. Ensure WCAG 2.1 AA compliance (QR code alt text, keyboard nav)
6. Update CLAUDE.md security section with MFA details

Reference Documentation:
- Architecture: /BACKEND_ARCHITECTURE_STRATEGY.md (Authentication section)
- Similar Features: backend/src/services/auth.service.ts (existing JWT auth)
```

## Checklist

Before submitting the prompt:
- [ ] Clear user story and acceptance criteria defined
- [ ] Technical specifications detailed
- [ ] Relevant files identified for review
- [ ] Testing requirements specified
- [ ] Compliance impact assessed
- [ ] Documentation update requirements noted
- [ ] Similar features referenced for consistency

After implementation:
- [ ] All acceptance criteria met
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed for quality
- [ ] Security implications considered
- [ ] Accessibility validated (if frontend)
- [ ] Commit message follows conventions
