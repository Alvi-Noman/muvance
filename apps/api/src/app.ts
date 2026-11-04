import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env, isTest } from '@/config/env';
import { logger } from '@/lib/logger';
import { errorHandler } from '@/middlewares/error-handler';
import { notFound } from '@/middlewares/not-found';
import { apiLimiter } from '@/middlewares/rate-limit';
import { sameOrigin } from '@/middlewares/same-origin';
import { apiRouter } from '@/routes';

export function createApp() {
  const app = express();

  // Behind Caddy: trust X-Forwarded-* so client IPs (rate limits) and HTTPS are detected.
  if (env.TRUST_PROXY) app.set('trust proxy', env.TRUST_PROXY);
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN.split(','), credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  if (!isTest) app.use(pinoHttp({ logger }));
  app.use('/api', apiLimiter, sameOrigin, apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
