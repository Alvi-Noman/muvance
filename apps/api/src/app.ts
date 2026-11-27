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
  // Profile pictures arrive as small images (resized in the browser), under 1 MB.
  const pictureJson = express.json({ limit: '1mb' });
  app.use((req, res, next) => {
    // Chat file uploads are the raw file (read by their own route).
    if (/^\/api\/chat\/spaces\/[^/]+\/files$/.test(req.path)) return next();
    if (req.path === '/api/webmail/send' || req.path === '/api/webmail/drafts') {
      return bigJson(req, res, next);
    }
    if (
      req.path === '/api/webmail/avatar' ||
      /^\/api\/mail-accounts\/[^/]+\/avatar$/.test(req.path)
    ) {
      return pictureJson(req, res, next);
    }
    return json(req, res, next);
  });
  app.use(cookieParser());
  if (!isTest) app.use(pinoHttp({ logger }));
  // Chat has its own, roomier limit (a whole office may share one address).
  const limiter: express.RequestHandler = (req, res, next) =>
    req.path.startsWith('/chat/') ? next() : apiLimiter(req, res, next);
  app.use('/api', limiter, sameOrigin, apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
