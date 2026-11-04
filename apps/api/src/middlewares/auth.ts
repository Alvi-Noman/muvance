import type { RequestHandler } from 'express';
import { can, type Permission } from '@muvance/shared';
import type { UserDoc } from '@/db/types';
import { SESSION_COOKIE, sessionsService } from '@/modules/auth/sessions.service';
import { HttpError } from '@/utils/http-error';

declare module 'express-serve-static-core' {
  interface Request {
    /** The signed-in user. Set by `requireAuth`. */
    user?: UserDoc;
  }
}

/** Rejects requests without a valid session and loads the signed-in user onto `req.user`. */
export const requireAuth: RequestHandler = async (req, res, next) => {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== 'string' || !token) return next(HttpError.unauthorized());

  const user = await sessionsService.resolve(token, res);
  if (!user) return next(HttpError.unauthorized('Your session has expired. Please sign in again.'));

  req.user = user;
  next();
};

/** Requires the signed-in user's role to include a permission. Use after `requireAuth`. */
export const requirePermission =
  (permission: Permission): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(HttpError.unauthorized());
    if (!can(req.user.role, permission)) return next(HttpError.forbidden());
    next();
  };

/** The signed-in user, for handlers mounted behind `requireAuth`. */
export function currentUser(req: Parameters<RequestHandler>[0]) {
  if (!req.user) throw HttpError.unauthorized();
  return req.user;
}
