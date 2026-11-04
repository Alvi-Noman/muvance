import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { HttpError } from '@/utils/http-error';

/** Validates and replaces `req.body` with the parsed result of `schema`. */
export const validateBody =
  (schema: ZodType): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(HttpError.badRequest('Validation failed', result.error.issues));
    }
    req.body = result.data;
    next();
  };

/**
 * Validates the query string. Express 5's `req.query` is read-only, so the parsed
 * result is stored on `res.locals.query`.
 */
export const validateQuery =
  (schema: ZodType): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(HttpError.badRequest('Invalid query', result.error.issues));
    }
    res.locals.query = result.data;
    next();
  };
