import type { Request, RequestHandler } from 'express';
import type { ObjectId } from 'mongodb';
import { collections } from '@/db/client';
import { requireAuth } from '@/middlewares/auth';
import { appsOf } from '@/modules/auth/account';
import { HttpError } from '@/utils/http-error';

export { decrypt, encrypt } from '@/lib/secret-box';

/**
 * Muvance Mail uses the Muvance account sign-in. The mail server needs the person's password to
 * open their mailbox, so the sign-in keeps it (encrypted, never sent to the browser).
 */
export interface MailSession {
  id: ObjectId;
  address: string;
  password: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    mailSession?: MailSession;
  }
}

/** Requires a Muvance account with Mail, and puts its mailbox on `req.mailSession`. */
export const requireMailSession: RequestHandler = (req, res, next) =>
  requireAuth(req, res, (error) => {
    if (error) return next(error);
    void (async () => {
      const user = req.user!;
      if (!appsOf(user).mail || !user.mailAccountId) {
        throw HttpError.forbidden(
          "Your Muvance account doesn't have a mailbox. Ask an admin if you need one.",
        );
      }
      const mailbox = await collections
        .mailAccounts()
        .findOne({ _id: user.mailAccountId }, { projection: { address: 1 } });
      if (!mailbox) throw HttpError.forbidden("Your mailbox isn't set up yet. Ask an admin.");
      const password = req.accountSession?.password;
      // Sign-ins from before Muvance accounts don't hold the password: sign in once more.
      if (!password) throw HttpError.unauthorized('Please sign in again to open your mail.');
      req.mailSession = { id: req.accountSession!.id, address: mailbox.address, password };
    })().then(() => next(), next);
  });

export function mailSession(req: Request) {
  if (!req.mailSession) throw HttpError.unauthorized();
  return req.mailSession;
}
