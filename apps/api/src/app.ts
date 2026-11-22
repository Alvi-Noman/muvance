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
  const json = express.json({ limit: '100kb' });
  // Sending email and saving drafts carry attachments (base64), up to about 25 MB of files.
  const bigJson = express.json({ limit: '40mb' });
  app.use((req, res, next) =>
    req.path === '/api/webmail/send' || req.path === '/api/webmail/drafts'
      ? bigJson(req, res, next)
      : json(req, res, next),
  );
  app.use(cookieParser());
  if (!isTest) app.use(pinoHttp({ logger }));
  app.use('/api', apiLimiter, sameOrigin, apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
