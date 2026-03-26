import { Hono } from 'hono';
import { corsMiddleware } from './middleware/cors.js';
import { rateLimitMiddleware } from './middleware/rate-limit.js';
import { requireApiKey } from './middleware/auth.js';
import { healthRoutes } from './routes/health.js';
import { didRoutes } from './routes/did.js';
import { verifyRoutes } from './routes/verify.js';
import { identityCardRoutes } from './routes/identity-card.js';
import { searchRoutes } from './routes/search.js';
import { reputationRoutes } from './routes/reputation.js';
import { vcRoutes } from './routes/vc.js';
import { badgeRoutes } from './routes/badge.js';

export function createApp() {
  const app = new Hono();

  // Middleware
  app.use('*', corsMiddleware);
  app.use('/api/*', rateLimitMiddleware);

  // Auth middleware for POST routes only
  app.use('/api/*', async (c, next) => {
    if (c.req.method === 'POST') {
      return requireApiKey()(c, next);
    }
    await next();
  });

  // Routes
  const api = new Hono();
  api.route('/', healthRoutes);
  api.route('/', didRoutes);
  api.route('/', verifyRoutes);
  api.route('/', identityCardRoutes);
  api.route('/', searchRoutes);
  api.route('/', reputationRoutes);
  api.route('/', vcRoutes);
  api.route('/', badgeRoutes);

  app.route('/api', api);

  // Root
  app.get('/', (c) => {
    return c.json({
      name: 'EtereCitizen API',
      version: '0.1.0',
      docs: '/api/health',
    });
  });

  return app;
}
