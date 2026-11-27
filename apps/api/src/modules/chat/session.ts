import type { Request, RequestHandler, Response } from 'express';
import { ObjectId } from 'mongodb';
import { cookieSecure, env } from '@/config/env';
import { collections } from '@/db/client';
import type { ChatUserDoc } from '@/db/types';
import { hashToken, randomToken } from '@/lib/security';
import { decrypt, encrypt } from '@/modules/webmail/session';
import { HttpError } from '@/utils/http-error';

/** Muvance Chat sign-ins (chat.muvance.com), separate from the admin's and the webmail's. */
export const CHAT_COOKIE = 'mvc_session';
const COOKIE_PATH = '/api/chat';

export interface ChatSession {
  id: ObjectId;
  user: ChatUserDoc;
  /** Teammates' mailbox password (to send invites and alerts from their address). */
  mailPassword: string | null;
}

declare module 'express-serve-static-core' {
  interface Request {
    chatSession?: ChatSession;
  }
}

const ttlMs = () => env.CHAT_SESSION_DAYS * 86_400_000;

function setCookie(res: Response, token: string, expires: Date) {
  res.cookie(CHAT_COOKIE, token, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: 'lax',
    path: COOKIE_PATH,
    expires,
  });
}

// Teammates whose mailbox was deleted lose access; checked at most once a minute per person.
const mailboxChecked = new Map<string, number>();
async function mailboxStillExists(email: string) {
  const at = mailboxChecked.get(email);
  if (at && Date.now() - at < 60_000) return true;
  const exists = Boolean(
    await collections.mailAccounts().findOne({ address: email }, { projection: { _id: 1 } }),
  );
  if (exists) mailboxChecked.set(email, Date.now());
  return exists;
}

export const chatSessions = {
  async create(userId: ObjectId, mailPassword: string | null, res: Response) {
    const token = randomToken();
    const expiresAt = new Date(Date.now() + ttlMs());
    await collections.chatSessions().insertOne({
      _id: new ObjectId(),
      tokenHash: hashToken(token),
      userId,
      passwordEnc: mailPassword ? encrypt(mailPassword) : null,
      createdAt: new Date(),
      expiresAt,
    });
    setCookie(res, token, expiresAt);
  },

  async destroy(req: Request, res: Response) {
    const token: unknown = req.cookies?.[CHAT_COOKIE];
    if (typeof token === 'string') {
      await collections.chatSessions().deleteOne({ tokenHash: hashToken(token) });
    }
    res.clearCookie(CHAT_COOKIE, { path: COOKIE_PATH });
  },

  async destroyAll(userId: ObjectId) {
    await collections.chatSessions().deleteMany({ userId });
  },

  /** A teammate's mailbox password from any of their sign-ins, to send mail as them. */
  async mailPasswordOf(userId: ObjectId) {
    const sessions = await collections
      .chatSessions()
      .find({ userId, passwordEnc: { $type: 'string' }, expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();
    for (const s of sessions) {
      try {
        return decrypt(s.passwordEnc!);
      } catch {
        // WEBMAIL_SECRET changed; try the next.
      }
    }
    return null;
  },
};

/** Requires a Muvance Chat sign-in and puts it on `req.chatSession`. */
export const requireChatSession: RequestHandler = async (req, res, next) => {
  const token: unknown = req.cookies?.[CHAT_COOKIE];
  if (typeof token !== 'string' || !token) return next(HttpError.unauthorized());
  const doc = await collections.chatSessions().findOne({ tokenHash: hashToken(token) });
  if (!doc || doc.expiresAt.getTime() < Date.now()) {
    return next(HttpError.unauthorized('Please sign in again.'));
  }
  const user = await collections.chatUsers().findOne({ _id: doc.userId });
  if (!user || user.status === 'removed') {
    await collections.chatSessions().deleteOne({ _id: doc._id });
    return next(HttpError.unauthorized('Your access to Muvance Chat has ended.'));
  }
  if (user.kind === 'team' && !(await mailboxStillExists(user.email))) {
    await collections.chatSessions().deleteMany({ userId: user._id });
    return next(HttpError.unauthorized('Your access to Muvance Chat has ended.'));
  }
  let mailPassword: string | null = null;
  if (doc.passwordEnc) {
    try {
      mailPassword = decrypt(doc.passwordEnc);
    } catch {
      mailPassword = null;
    }
  }
  // Sliding expiry: people who use it stay signed in.
  if (doc.expiresAt.getTime() - Date.now() < ttlMs() - 86_400_000) {
    const expiresAt = new Date(Date.now() + ttlMs());
    await collections.chatSessions().updateOne({ _id: doc._id }, { $set: { expiresAt } });
    setCookie(res, token, expiresAt);
  }
  req.chatSession = { id: doc._id, user, mailPassword };
  next();
};

export function chatSession(req: Request) {
  if (!req.chatSession) throw HttpError.unauthorized();
  return req.chatSession;
}
