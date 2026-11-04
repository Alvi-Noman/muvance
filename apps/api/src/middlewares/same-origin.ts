import type { RequestHandler } from 'express';
import { env } from '@/config/env';
import { HttpError } from '@/utils/http-error';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const allowedOrigins = new Set([...env.CORS_ORIGIN.split(','), new URL(env.ADMIN_URL).origin]);

/**
 * CSRF defence in depth (on top of SameSite=Strict cookies): state-changing requests that
 * carry an Origin header must come from our own site, the admin app or an allowed origin.
 */
export const sameOrigin: RequestHandler = (req, _res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  const origin = req.get('origin');
  if (!origin) return next(); // Non-browser clients (curl, server-to-server) send no Origin.

  const host = req.get('x-forwarded-host') ?? req.get('host');
  const sameHost = host && new URL(origin).host === host;
  if (sameHost || allowedOrigins.has(origin)) return next();
  next(HttpError.forbidden('Cross-site request blocked'));
};
