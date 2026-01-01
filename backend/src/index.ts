import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import assessmentRoutes from './routes/assessment.routes';
import keypassRoutes from './routes/keypass.routes';
import paymentRoutes from './routes/payment.routes';
import complianceRoutes from './routes/compliance';

// Import audit logging middleware
import { auditMiddleware } from './services/auditLogger';

// Import data retention scheduler
import { initializeRetentionScheduler } from './jobs/retentionScheduler';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use(
  '*',
  cors({
    origin: (origin) => {
      // Allow requests from these origins
      const allowedOrigins = [
        'http://localhost:19006',
        'http://localhost:8081',
        'exp://localhost:8081',
        process.env.FRONTEND_URL || '',
      ];

      // Allow Expo tunnel/direct URLs (e.g., https://gxkmpgw-anonymous-8081.exp.direct)
      const isExpoTunnel = origin && (
        origin.includes('.exp.direct') ||
        origin.includes('.exp.dev') ||
        origin.includes('localhost')
      );

      if (!origin || isExpoTunnel || allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
        return origin || '*';
      }

      return null;
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Apply audit logging middleware (logs all HTTP requests)
app.use('*', auditMiddleware());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
const api = new Hono();

// API root endpoint
api.get('/', (c) => {
  return c.json({
    name: 'Stop FRA API',
    version: '1.0.0',
    status: 'running',
    documentation: {
      swagger: '/api/v1/docs',
      postman: '/api/v1/postman',
    },
    endpoints: {
      authentication: '/api/v1/auth',
      assessments: '/api/v1/assessments',
      keypasses: '/api/v1/keypasses',
      packages: '/api/v1/packages',
      purchases: '/api/v1/purchases',
      webhooks: '/api/v1/webhooks',
      compliance: '/api/v1/compliance',
    },
    health: '/health',
  });
});

api.route('/auth', authRoutes);
api.route('/assessments', assessmentRoutes);
api.route('/keypasses', keypassRoutes);
api.route('/', paymentRoutes); // Payment routes include /packages, /purchases, /webhooks
api.route('/compliance', complianceRoutes); // ECCTA 2023 compliance reporting

app.route('/api/v1', api);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Stop FRA API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/v1',
  });
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested endpoint does not exist',
        path: c.req.path,
      },
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'An internal error occurred' : err.message,
      },
    },
    500
  );
});

// Start server
const port = parseInt(process.env.PORT || '3000');

console.log(`🚀 Stop FRA Backend API starting on port ${port}...`);
console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 API Base URL: http://localhost:${port}/api/v1`);
console.log(`❤️  Health check: http://localhost:${port}/health`);
console.log(`\n📚 Available endpoints:`);
console.log(`   - POST /api/v1/auth/signup`);
console.log(`   - POST /api/v1/auth/login`);
console.log(`   - POST /api/v1/assessments`);
console.log(`   - POST /api/v1/keypasses/allocate`);
console.log(`   - GET  /api/v1/packages`);
console.log(`   - POST /api/v1/purchases`);
console.log(`   - GET  /api/v1/compliance/report`);
console.log(`\n🔒 Audit logging enabled (all requests logged)`);
console.log(`⏰ Data retention scheduler: Daily at 2 AM\n`);

// Initialize data retention scheduler
initializeRetentionScheduler();

serve({
  fetch: app.fetch,
  port,
});
