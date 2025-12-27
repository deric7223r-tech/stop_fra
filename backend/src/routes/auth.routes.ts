import { Hono } from 'hono';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const auth = new Hono();

// Public routes
auth.post('/signup', (c) => authController.signup(c));
auth.post('/login', (c) => authController.login(c));
auth.post('/refresh', (c) => authController.refresh(c));

// Protected routes
auth.get('/me', authMiddleware, (c) => authController.me(c));

export default auth;
