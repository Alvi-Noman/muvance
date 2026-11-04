import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { cookieSecure, env } from '@/config/env';
import { collections } from '@/db/client';
import type { UserDoc } from '@/db/types';
import { hashToken, randomToken } from '@/lib/security';

export const SESSION_COOKIE = 'muv_session';
const DAY = 24 * 60 * 60_000;
const ttlMs = () => env.SESSION_TTL_DAYS * DAY;

function setCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true, // Not readable from JavaScript, so XSS can't steal it.
    secure: cookieSecure,
    sameSite: 'strict', // Never sent on cross-site requests (CSRF protection).
    path: '/api',
    expires: expiresAt,
  });
}

export const sessionsService = {
  /** Starts a session for `user` and sets the cookie. */
  async create(user: UserDoc, req: Request, res: Response) {
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
    });
    setCookie(res, token, expiresAt);
  },

  /**
   * Returns the active user for a session token, or null. Sessions slide: once more than
   * a day has passed, the expiry is pushed out again (so active users stay signed in).
   */
  async resolve(token: string, res: Response): Promise<UserDoc | null> {
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
    return user;
  },

  async destroy(token: string | undefined, res: Response) {
    if (token) await collections.sessions().deleteOne({ tokenHash: hashToken(token) });
    res.clearCookie(SESSION_COOKIE, { path: '/api' });
  },

  /** Signs a user out everywhere (e.g. when disabled or their password changes). */
  async destroyAllForUser(userId: ObjectId, exceptToken?: string) {
    await collections.sessions().deleteMany({
      userId,
      ...(exceptToken && { tokenHash: { $ne: hashToken(exceptToken) } }),
    });
  },
};
