import type { ErrorRequestHandler } from 'express';
import type { ApiError } from '@muvance/shared';
import { isProduction } from '@/config/env';
import { logger } from '@/lib/logger';
import { HttpError } from '@/utils/http-error';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    const body: ApiError = { error: { message: err.message, details: err.details } };
    res.status(err.status).json(body);
    return;
  }

  // Errors from Express itself, e.g. malformed JSON (400) or a body that's too large (413).
  const status = typeof err?.status === 'number' && err.status < 500 ? err.status : 500;
  if (status < 500) {
    res.status(status).json({ error: { message: err.expose ? err.message : 'Bad request' } });
    return;
  }

  logger.error(err);
  const body: ApiError = {
    error: { message: isProduction ? 'Internal server error' : String(err?.message ?? err) },
  };
  res.status(500).json(body);
};
