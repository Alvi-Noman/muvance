import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import type { Request, RequestHandler, Response } from 'express';
import { ObjectId } from 'mongodb';
import { cookieSecure, env } from '@/config/env';
import { collections } from '@/db/client';
import type { WebmailSessionDoc } from '@/db/types';
import { HttpError } from '@/utils/http-error';

/**
 * Muvance Mail sign-ins. Like most webmail, the person's mail password is kept (encrypted) for the
 * session, because the mail server needs it to open their mailbox; it never reaches the browser.
 */
export const WEBMAIL_COOKIE = 'mvm_session';
const key = () => createHash('sha256').update(env.WEBMAIL_SECRET).digest();
const hash = (token: string) => createHash('sha256').update(token).digest('hex');

function encrypt(text: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString('base64url')).join('.');
}

function decrypt(value: string) {
  const [iv, tag, data] = value.split('.').map((p) => Buffer.from(p, 'base64url'));
  const decipher = createDecipheriv('aes-256-gcm', key(), iv!);
  decipher.setAuthTag(tag!);
  return Buffer.concat([decipher.update(data!), decipher.final()]).toString('utf8');
}

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

const ttlMs = () => env.WEBMAIL_SESSION_DAYS * 86_400_000;

function setCookie(res: Response, token: string, expires: Date) {
  res.cookie(WEBMAIL_COOKIE, token, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: 'strict',
    path: '/api/webmail',
    expires,
  });
}

export const webmailSessions = {
  async create(address: string, password: string, res: Response) {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + ttlMs());
    await collections.webmailSessions().insertOne({
      _id: new ObjectId(),
      tokenHash: hash(token),
      address,
      passwordEnc: encrypt(password),
      createdAt: new Date(),
      expiresAt,
    });
    setCookie(res, token, expiresAt);
  },

  async destroy(req: Request, res: Response) {
    const token: unknown = req.cookies?.[WEBMAIL_COOKIE];
    if (typeof token === 'string') {
      await collections.webmailSessions().deleteOne({ tokenHash: hash(token) });
    }
    res.clearCookie(WEBMAIL_COOKIE, { path: '/api/webmail' });
  },

  /** Signs someone out everywhere (their password was reset or their mailbox deleted). */
  async destroyAll(address: string) {
    await collections.webmailSessions().deleteMany({ address });
  },
};

/** Requires a Muvance Mail sign-in and puts it on `req.mailSession`. */
export const requireMailSession: RequestHandler = async (req, res, next) => {
  const token: unknown = req.cookies?.[WEBMAIL_COOKIE];
  if (typeof token !== 'string' || !token) return next(HttpError.unauthorized());
  const doc: WebmailSessionDoc | null = await collections
    .webmailSessions()
    .findOne({ tokenHash: hash(token) });
  if (!doc || doc.expiresAt.getTime() < Date.now()) {
    return next(HttpError.unauthorized('Please sign in again.'));
  }
  let password: string;
  try {
    password = decrypt(doc.passwordEnc);
  } catch {
    return next(HttpError.unauthorized('Please sign in again.'));
  }
  // Sliding expiry: active people stay signed in.
  if (doc.expiresAt.getTime() - Date.now() < ttlMs() - 86_400_000) {
    const expiresAt = new Date(Date.now() + ttlMs());
    await collections.webmailSessions().updateOne({ _id: doc._id }, { $set: { expiresAt } });
    setCookie(res, token, expiresAt);
  }
  req.mailSession = { id: doc._id, address: doc.address, password };
  next();
};

export function mailSession(req: Request) {
  if (!req.mailSession) throw HttpError.unauthorized();
  return req.mailSession;
}
