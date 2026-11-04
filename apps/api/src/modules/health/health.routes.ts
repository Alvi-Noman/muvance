import { Router } from 'express';
import type { HealthResponse } from '@muvance/shared';
import { pingDb } from '@/db/client';

export const healthRouter = Router();

/** Used by Docker/Caddy health checks: healthy only when the database answers too. */
healthRouter.get('/', async (_req, res) => {
  try {
    await pingDb();
  } catch {
    res.status(503).json({ status: 'error', message: 'Database unavailable' });
    return;
  }
  const body: HealthResponse = {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
  res.json(body);
});
