import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { cookieSecure, env } from '@/config/env';
import { collections } from '@/db/client';
import type { SessionDoc, UserDoc } from '@/db/types';
import { decrypt, encrypt } from '@/lib/secret-box';
import { hashToken, randomToken } from '@/lib/security';

/**
 * Muvance account sign-ins. One cookie for every app: in production it's set for the whole domain
 * (COOKIE_DOMAIN), so signing in on admin., mail., chat., meet. or accounts. signs you in on all.
 */
export const SESSION_COOKIE = 'muvance_account';
/** The admin's cookie before Muvance accounts; cleared when seen. */
const OLD_COOKIE = 'muv_session';
const DAY = 24 * 60 * 60_000;
const ttlMs = () => env.SESSION_TTL_DAYS * DAY;

const cookieOptions = () => ({
  httpOnly: true, // Not readable from JavaScript, so XSS can't steal it.
  secure: cookieSecure,
  // Only sent from our own sites (all of *.muvance.com count as one site).
  sameSite: 'strict' as const,
  path: '/',
  ...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }),
});

function setCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), expires: expiresAt });
}

export interface AccountSession {
  id: ObjectId;
  /** The account password, for Mail and Chat's email; null for sessions that don't have it. */
  password: string | null;
}

function passwordOf(session: SessionDoc) {
  if (!session.passwordEnc) return null;
  try {
    return decrypt(session.passwordEnc);
  } catch {
    return null;
  }
}

export const sessionsService = {
  /** Starts a session for `user` and sets the cookie. */
  async create(user: UserDoc, req: Request, res: Response, password: string | null = null) {
    const token = randomToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs());
    await collections.sessions().insertOne({
      _id: new ObjectId(),
      tokenHash: hashToken(token),
      userId: user._id,
      createdAt: now,
      expiresAt,
      userAgent: (req.get('user-agent') ?? '').slice(0, 300),
      ip: req.ip ?? '',
      passwordEnc: password ? encrypt(password) : null,
    });
    setCookie(res, token, expiresAt);
    if (req.cookies?.[OLD_COOKIE]) res.clearCookie(OLD_COOKIE, { path: '/api' });
  },

  /**
   * Returns the active user for a session token, or null. Sessions slide: once more than
   * a day has passed, the expiry is pushed out again (so active users stay signed in).
   */
  async resolve(
    token: string,
    res: Response,
  ): Promise<{ user: UserDoc; session: AccountSession } | null> {
    const session = await collections.sessions().findOne({ tokenHash: hashToken(token) });
    if (!session || session.expiresAt.getTime() <= Date.now()) return null;

    const user = await collections.users().findOne({ _id: session.userId });
    if (!user || user.status !== 'active') {
      await collections.sessions().deleteOne({ _id: session._id });
      return null;
    }

    const renewAt = session.expiresAt.getTime() - ttlMs() + DAY;
    if (Date.now() > renewAt) {
      const expiresAt = new Date(Date.now() + ttlMs());
      await collections.sessions().updateOne({ _id: session._id }, { $set: { expiresAt } });
      setCookie(res, token, expiresAt);
    }
    return { user, session: { id: session._id, password: passwordOf(session) } };
  },

  /** Keeps a session's stored password current after the person changes it. */
  async setPassword(sessionId: ObjectId, password: string) {
    await collections
      .sessions()
      .updateOne({ _id: sessionId }, { $set: { passwordEnc: encrypt(password) } });
  },

  async destroy(token: string | undefined, res: Response) {
    if (token) await collections.sessions().deleteOne({ tokenHash: hashToken(token) });
    res.clearCookie(SESSION_COOKIE, cookieOptions());
  },

  /** Signs a user out everywhere (e.g. when disabled or their password changes). */
  async destroyAllForUser(userId: ObjectId, exceptToken?: string) {
    await collections.sessions().deleteMany({
      userId,
      ...(exceptToken && { tokenHash: { $ne: hashToken(exceptToken) } }),
    });
  },
};
