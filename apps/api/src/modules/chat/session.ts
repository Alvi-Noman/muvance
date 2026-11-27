import type { Request, RequestHandler, Response } from 'express';
import { ObjectId } from 'mongodb';
import { cookieSecure, env } from '@/config/env';
import { collections } from '@/db/client';
import type { ChatUserDoc } from '@/db/types';
import { decrypt } from '@/lib/secret-box';
import { hashToken, randomToken } from '@/lib/security';
import { addressOf, appsOf } from '@/modules/auth/account';
import { chatService } from './chat.service';
import { SESSION_COOKIE, sessionsService } from '@/modules/auth/sessions.service';
import { HttpError } from '@/utils/http-error';

/**
 * Who's using Muvance Chat: teammates through their Muvance account (the sign-in every app shares),
 * and clients (guests) through their own chat sign-in.
 */
export const CHAT_COOKIE = 'mvc_session';
const COOKIE_PATH = '/api/chat';

export interface ChatSession {
  /** The sign-in's id (the account sign-in for teammates). */
  id: ObjectId;
  user: ChatUserDoc;
  /** Teammates' account password (to send invites and alerts from their address). */
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

export const chatSessions = {
  /** A client's (guest's) sign-in. Teammates use their Muvance account instead. */
  async create(userId: ObjectId, _unused: null, res: Response) {
    const token = randomToken();
    const expiresAt = new Date(Date.now() + ttlMs());
    await collections.chatSessions().insertOne({
      _id: new ObjectId(),
      tokenHash: hashToken(token),
      userId,
      passwordEnc: null,
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

  /** A teammate's password from one of their account sign-ins, to send mail as them. */
  async mailPasswordOf(chatUserId: ObjectId) {
    const chatUser = await collections
      .chatUsers()
      .findOne({ _id: chatUserId, kind: 'team' }, { projection: { email: 1 } });
    if (!chatUser) return null;
    const account = await collections
      .users()
      .findOne({ email: chatUser.email }, { projection: { _id: 1 } });
    if (!account) return null;
    const sessions = await collections
      .sessions()
      .find({
        userId: account._id,
        passwordEnc: { $type: 'string' },
        expiresAt: { $gt: new Date() },
      })
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

/** A guest's chat sign-in, if the request has a valid one. */
async function guestSession(req: Request, res: Response): Promise<ChatSession | null> {
  const token: unknown = req.cookies?.[CHAT_COOKIE];
  if (typeof token !== 'string' || !token) return null;
  const doc = await collections.chatSessions().findOne({ tokenHash: hashToken(token) });
  if (!doc || doc.expiresAt.getTime() < Date.now()) return null;
  const user = await collections.chatUsers().findOne({ _id: doc.userId });
  // Teammates' old chat sign-ins ended with Muvance accounts.
  if (!user || user.status === 'removed' || user.kind !== 'guest') {
    await collections.chatSessions().deleteOne({ _id: doc._id });
    res.clearCookie(CHAT_COOKIE, { path: COOKIE_PATH });
    return null;
  }
  // Sliding expiry: people who use it stay signed in.
  if (doc.expiresAt.getTime() - Date.now() < ttlMs() - 86_400_000) {
    const expiresAt = new Date(Date.now() + ttlMs());
    await collections.chatSessions().updateOne({ _id: doc._id }, { $set: { expiresAt } });
    setCookie(res, token, expiresAt);
  }
  return { id: doc._id, user, mailPassword: null };
}

/** A teammate signed in with their Muvance account (with Chat), as their chat person. */
async function teamSession(req: Request, res: Response): Promise<ChatSession | 'no-access' | null> {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== 'string' || !token) return null;
  const found = await sessionsService.resolve(token, res);
  if (!found || found.user.mustChangePassword) return null;
  const address = addressOf(found.user);
  if (!appsOf(found.user).chat || !address) return 'no-access';
  let user = await collections.chatUsers().findOne({ email: address, kind: 'team' });
  if (!user || user.status !== 'active') {
    await chatService.syncTeam();
    user = await collections.chatUsers().findOne({ email: address, kind: 'team' });
  }
  if (!user || user.status !== 'active') return 'no-access';
  return { id: found.session.id, user, mailPassword: found.session.password };
}

/** Requires a Muvance Chat sign-in (a teammate's account, or a guest's) on `req.chatSession`. */
export const requireChatSession: RequestHandler = async (req, res, next) => {
  try {
    const guest = await guestSession(req, res);
    if (guest) {
      req.chatSession = guest;
      return next();
    }
    const team = await teamSession(req, res);
    if (team === 'no-access') {
      return next(
        HttpError.forbidden(
          "Your Muvance account doesn't have access to Chat. Ask an admin if you need it.",
        ),
      );
    }
    if (!team) return next(HttpError.unauthorized());
    req.chatSession = team;
    next();
  } catch (error) {
    next(error);
  }
};

export function chatSession(req: Request) {
  if (!req.chatSession) throw HttpError.unauthorized();
  return req.chatSession;
}
