# Stop FRA Backend API

Backend API for the Stop FRA (Fraud Risk Assessment) platform, built with Hono, TypeScript, and PostgreSQL.

## Tech Stack

- **Framework**: Hono (lightweight, fast web framework)
- **Runtime**: Node.js with npm
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Stripe
- **Storage**: AWS S3 (for signatures and documents)
- **Cache**: Redis (optional)

## Prerequisites

- Node.js 18+ or Bun runtime
- PostgreSQL 14+
- Stripe account (for payments)
- AWS account (for S3 storage)
- Redis (optional, for caching)

## Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and configure:
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/stopfra_dev

# JWT Authentication
JWT_SECRET=your-secret-key-min-32-chars-please-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# n8n Webhook
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/fra-intake-v2

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=eu-west-2
S3_BUCKET=stopfra-files

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:19006
```

3. **Set up PostgreSQL database**:
```bash
# Create database
createdb stopfra_dev

# Or using psql
psql -U postgres
CREATE DATABASE stopfra_dev;
```

4. **Generate and run database migrations**:
```bash
# Generate migration files from schema
npm run db:generate

# Run migrations
npm run db:migrate

# Optional: Open Drizzle Studio to view database
npm run db:studio
```

## Database Schema

The database includes the following tables:

- `users` - User accounts (employers, employees, admins)
- `organisations` - Organizations using the platform
- `assessments` - Fraud risk assessments
- `assessment_answers` - Assessment questionnaire responses
- `risk_register_items` - Identified risks with scores
- `packages` - Available FRA packages (Basic, Training, Full)
- `purchases` - Payment transactions
- `keypasses` - Employee access codes
- `employee_assessments` - Individual employee assessments
- `signatures` - Electronic signatures
- `feedback` - User feedback
- `audit_logs` - Audit trail for compliance

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm run build
npm start
```

The API will be available at: `http://localhost:3000/api/v1`

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new employer account
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info (protected)

### Assessments
- `POST /api/v1/assessments` - Create new assessment (employers only)
- `GET /api/v1/assessments/:id` - Get assessment by ID
- `GET /api/v1/assessments/organisation/:orgId` - Get organisation assessments
- `PATCH /api/v1/assessments/:id` - Update assessment
- `POST /api/v1/assessments/:id/submit` - Submit assessment for processing
- `GET /api/v1/assessments/:id/risk-register` - Get risk register items
- `DELETE /api/v1/assessments/:id` - Delete assessment (soft delete)

### Key-Passes
- `POST /api/v1/keypasses/validate` - Validate key-pass code (public)
- `POST /api/v1/keypasses/use` - Use key-pass to start assessment (public)
- `POST /api/v1/keypasses/allocate` - Allocate key-passes (employers/admins)
- `GET /api/v1/keypasses/organisation/:orgId` - Get organisation key-passes
- `GET /api/v1/keypasses/organisation/:orgId/stats` - Get key-pass statistics
- `POST /api/v1/keypasses/revoke` - Revoke key-passes

### Packages & Payments
- `GET /api/v1/packages` - Get all available packages (public)
- `GET /api/v1/packages/recommended` - Get recommended package (public)
- `POST /api/v1/purchases` - Create new purchase (employers/admins)
- `POST /api/v1/purchases/:id/confirm` - Confirm purchase after payment
- `GET /api/v1/purchases/:id` - Get purchase by ID
- `GET /api/v1/purchases/organisation/:orgId` - Get organisation purchases
- `POST /api/v1/purchases/:id/refund` - Refund purchase (admin only)

### Webhooks
- `POST /api/v1/webhooks/stripe` - Stripe payment webhook

### Health Check
- `GET /health` - API health check

## Testing

### Run tests:
```bash
npm test
```

### Run tests with coverage:
```bash
npm run test:coverage
```

### Watch mode:
```bash
npm run test:watch
```

## Authentication Flow

1. **Employer Registration**:
   - POST `/api/v1/auth/signup` with email, password, name, organisation details
   - Returns user, organisation, and JWT tokens (access + refresh)

2. **Employer Login**:
   - POST `/api/v1/auth/login` with email and password
   - Returns user, organisation, and JWT tokens

3. **Employee Access** (via key-pass):
   - POST `/api/v1/keypasses/use` with key-pass code and employee details
   - Returns employee assessment ID
   - No user account required - assessment is anonymous but linked to organisation

4. **Protected Endpoints**:
   - Include `Authorization: Bearer <access_token>` header
   - If token expires (24h), use refresh token to get new access token

## Risk Scoring Algorithm

The system calculates risk scores based on assessment answers:

1. **Inherent Risk Score**: `Impact (1-5) × Likelihood (1-5)` = 1-25
2. **Control Adjustment**:
   - Very strong controls: 40% reduction
   - Reasonably strong controls: 20% reduction
   - Weak/gaps: 0% reduction
3. **Residual Risk Score**: `Inherent Score × (1 - Control Reduction)`
4. **Priority Bands**:
   - High: 15-25
   - Medium: 8-14
   - Low: 1-7

## Stripe Integration

### Setup:
1. Get API keys from Stripe Dashboard
2. Configure webhook endpoint: `/api/v1/webhooks/stripe`
3. Add webhook secret to `.env`

### Supported Events:
- `payment_intent.succeeded` - Auto-confirms purchase and allocates key-passes
- `payment_intent.payment_failed` - Marks purchase as failed

### Testing Payments:
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Password Hashing**: Uses bcrypt with cost factor 12
3. **JWT Secrets**: Use strong, random secrets (32+ characters)
4. **CORS**: Configure allowed origins in production
5. **Rate Limiting**: Implement rate limiting for auth endpoints (TODO)
6. **Input Validation**: All inputs validated with Zod schemas
7. **SQL Injection**: Protected by Drizzle ORM parameterized queries

## Deployment

### PostgreSQL Setup:
```bash
# Production database should have:
# - SSL enabled
# - Connection pooling (PgBouncer recommended)
# - Regular backups
# - Read replicas for scaling
```

### Environment Variables:
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:password@prod-db.com:5432/stopfra
JWT_SECRET=<strong-random-secret>
STRIPE_SECRET_KEY=sk_live_...
AWS_REGION=eu-west-2
```

### Build and Deploy:
```bash
npm run build
npm start
```

### Health Checks:
Monitor `/health` endpoint for service health

### Logging:
- Uses Pino logger for structured logging
- All errors logged to console
- Consider integrating Sentry for error tracking

## Troubleshooting

### Database Connection Issues:
```bash
# Test connection
psql $DATABASE_URL

# Check migrations
npm run db:studio
```

### Authentication Errors:
- Verify JWT_SECRET is set
- Check token expiration times
- Ensure Authorization header format: `Bearer <token>`

### Stripe Webhook Failures:
- Verify webhook secret in Stripe Dashboard
- Check webhook endpoint is publicly accessible
- Review Stripe Dashboard logs

## Project Structure

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── assessment.controller.ts
│   │   ├── keypass.controller.ts
│   │   └── payment.controller.ts
│   ├── services/          # Business logic
│   │   ├── auth.service.ts
│   │   ├── assessment.service.ts
│   │   ├── risk-scoring.service.ts
│   │   ├── keypass.service.ts
│   │   └── payment.service.ts
│   ├── middleware/        # Middleware functions
│   │   └── auth.middleware.ts
│   ├── routes/            # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── assessment.routes.ts
│   │   ├── keypass.routes.ts
│   │   └── payment.routes.ts
│   ├── db/                # Database
│   │   ├── schema.ts      # Drizzle schema
│   │   ├── index.ts       # DB connection
│   │   └── migrate.ts     # Migration runner
│   └── index.ts           # App entry point
├── drizzle/               # Generated migration files
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Contributing

1. Create a feature branch from `develop`
2. Implement changes with tests
3. Run linting: `npm run lint`
4. Submit pull request

## Support

For issues or questions:
- Check the [main project documentation](../CLAUDE.MD)
- Review the [backend specification](../fraud-risk-app-main/docs/BACKEND-SPECIFICATION.md)
- Contact the development team

## License

[TBD]
