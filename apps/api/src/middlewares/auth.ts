import type { RequestHandler } from 'express';
import { can, type MuvanceApp, type Permission } from '@muvance/shared';
import type { UserDoc } from '@/db/types';
import { appsOf } from '@/modules/auth/account';
import {
  SESSION_COOKIE,
  sessionsService,
  type AccountSession,
} from '@/modules/auth/sessions.service';
import { HttpError } from '@/utils/http-error';

declare module 'express-serve-static-core' {
  interface Request {
    /** The signed-in Muvance account. Set by `requireAuth`. */
    user?: UserDoc;
    /** The sign-in itself (its id, and the password Mail needs). */
    accountSession?: AccountSession;
  }
}

/** Rejects requests without a valid session and loads the signed-in user onto `req.user`. */
export const requireSession: RequestHandler = async (req, res, next) => {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== 'string' || !token) return next(HttpError.unauthorized());

  const found = await sessionsService.resolve(token, res);
  if (!found)
    return next(HttpError.unauthorized('Your session has expired. Please sign in again.'));

  req.user = found.user;
  req.accountSession = found.session;
  next();
};

/**
 * The default guard: a valid session, and not still on a starting password. Only the account's
 * own details and the change-password route use `requireSession` instead.
 */
export const requireAuth: RequestHandler = (req, res, next) =>
  requireSession(req, res, (error) => {
    if (error) return next(error);
    if (req.user?.mustChangePassword) {
      return next(HttpError.forbidden('Create your own password to continue.'));
    }
    next();
  });

const NO_ACCESS: Record<MuvanceApp, string> = {
  admin: "Your Muvance account doesn't have access to the Admin CRM. Ask an admin if you need it.",
  mail: "Your Muvance account doesn't have a mailbox. Ask an admin if you need one.",
  chat: "Your Muvance account doesn't have access to Chat. Ask an admin if you need it.",
  meet: "Your Muvance account can't host meetings. Ask an admin if you need to.",
};

/** Requires the signed-in account to have access to an app. Use after `requireAuth`. */
export const requireApp =
  (app: MuvanceApp): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) return next(HttpError.unauthorized());
    if (!appsOf(req.user)[app]) return next(HttpError.forbidden(NO_ACCESS[app]));
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

/** The current sign-in, for handlers mounted behind `requireAuth`. */
export function currentSession(req: Parameters<RequestHandler>[0]) {
  if (!req.accountSession) throw HttpError.unauthorized();
  return req.accountSession;
}
