import { Hono } from 'hono';
import { authController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { rateLimit } from '../middleware/rateLimit.middleware.js';

const auth = new Hono();

// Public routes
auth.post('/signup', rateLimit({ windowMs: 60_000, max: 3, keyPrefix: 'auth:signup' }), (c) => authController.signup(c));
auth.post('/login', rateLimit({ windowMs: 60_000, max: 5, keyPrefix: 'auth:login' }), (c) => authController.login(c));
auth.post('/refresh', rateLimit({ windowMs: 60_000, max: 10, keyPrefix: 'auth:refresh' }), (c) => authController.refresh(c));

// Protected routes
auth.get('/me', authMiddleware, (c) => authController.me(c));

export default auth;
