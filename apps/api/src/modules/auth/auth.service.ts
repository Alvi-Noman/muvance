import type { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import type {
  AcceptInviteInput,
  ChangePasswordInput,
  InviteInfoDto,
  LoginInput,
  UpdateProfileInput,
} from '@muvance/shared';
import { usernameKey } from '@muvance/shared';
import { env } from '@/config/env';
import { collections, isDuplicateKeyError } from '@/db/client';
import type { UserDoc } from '@/db/types';
import { DUMMY_PASSWORD_HASH, hashPassword, hashToken, verifyPassword } from '@/lib/security';
import { verifySha512Crypt } from '@/lib/sha512-crypt';
import { HttpError } from '@/utils/http-error';
import { accounts, mailboxOf } from './account';
import { sessionsService, type AccountSession } from './sessions.service';

const INVALID_LOGIN = 'Wrong username, email or password.';

async function findValidInvite(token: string) {
  const invite = await collections.invites().findOne({ tokenHash: hashToken(token) });
  if (!invite || invite.expiresAt.getTime() <= Date.now()) {
    throw HttpError.badRequest('This link is invalid or has expired. Ask an admin for a new one.');
  }
  return invite;
}

/**
 * Who's signing in: "alvi", "alvi@muvance.com", or (for older accounts) the email they used before.
 * Emails always contain "@" and usernames never do.
 */
async function findAccount(identifier: string) {
  if (identifier.includes('@')) {
    return collections
      .users()
      .findOne({ $or: [{ email: identifier }, { contactEmail: identifier }] });
  }
  return (
    (await collections.users().findOne({ usernameKey: identifier })) ??
    (await collections.users().findOne({ email: `${identifier}@${env.MAIL_DOMAIN}` }))
  );
}

export const authService = {
  async login(input: LoginInput, req: Request, res: Response) {
    const user = await findAccount(input.identifier);
    // Always run bcrypt, even for unknown accounts, so response times don't reveal them.
    const hash = user?.passwordHash || DUMMY_PASSWORD_HASH;
    let ok = (await verifyPassword(input.password, hash)) && Boolean(user?.passwordHash);
    let mustChange = Boolean(user?.mustChangePassword);

    // Before Muvance accounts, the mailbox had its own password: it still works the first time,
    // and becomes the account's password.
    if (user && !ok) {
      const mailbox = await mailboxOf(user);
      if (mailbox && verifySha512Crypt(input.password, mailbox.passwordHash)) {
        ok = true;
        mustChange = mustChange || Boolean(mailbox.mustChangePassword);
        await collections.users().updateOne(
          { _id: user._id },
          {
            $set: {
              passwordHash: await hashPassword(input.password),
              mustChangePassword: mustChange,
              updatedAt: new Date(),
            },
          },
        );
      }
    }
    if (!user || !ok) throw HttpError.unauthorized(INVALID_LOGIN);
    if (user.status !== 'active') {
      throw HttpError.forbidden('Your account has been disabled. Contact an admin.');
    }

    // The mailbox always has the account's password.
    await accounts.syncMailbox(user, input.password);
    const now = new Date();
    await collections.users().updateOne({ _id: user._id }, { $set: { lastLoginAt: now } });
    await sessionsService.create(user, req, res, input.password);
    return { ...user, mustChangePassword: mustChange, lastLoginAt: now };
  },

  async getInviteInfo(token: string): Promise<InviteInfoDto> {
    const invite = await findValidInvite(token);
    return { email: invite.email, type: invite.type };
  },

  /** Completes an invite (creates the account) or a password link, then signs the user in. */
  async acceptInvite(input: AcceptInviteInput, req: Request, res: Response) {
    const invite = await findValidInvite(input.token);
    const passwordHash = await hashPassword(input.password);
    const now = new Date();
    let user: UserDoc | null;

    if (invite.type === 'reset') {
      user = await collections
        .users()
        .findOneAndUpdate(
          { _id: invite.userId ?? new ObjectId(), status: 'active' },
          { $set: { passwordHash, mustChangePassword: false, updatedAt: now, lastLoginAt: now } },
          { returnDocument: 'after' },
        );
      if (!user) throw HttpError.badRequest('This account is no longer active.');
      await sessionsService.destroyAllForUser(user._id);
    } else {
      if (!input.name) throw HttpError.badRequest('Enter your name');
      user = {
        _id: new ObjectId(),
        name: input.name,
        email: invite.email,
        username: null,
        usernameKey: null,
        passwordHash,
        role: invite.role,
        status: 'active',
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        mailAccountId: null,
        apps: { admin: true, mail: false, chat: false, meet: true },
        contactEmail: null,
      };
      try {
        await collections.users().insertOne(user);
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          throw HttpError.conflict('An account with this email already exists. Please sign in.');
        }
        throw error;
      }
    }

    // Links are single-use.
    await collections.invites().deleteOne({ _id: invite._id });
    await accounts.syncMailbox(user, input.password);
    await sessionsService.create(user, req, res, input.password);
    return user;
  },

  async changePassword(
    user: UserDoc,
    input: ChangePasswordInput,
    session: AccountSession,
    currentToken?: string,
  ) {
    if (!user.passwordHash || !(await verifyPassword(input.currentPassword, user.passwordHash))) {
      throw HttpError.badRequest('Your current password is incorrect');
    }
    if (input.newPassword === input.currentPassword) {
      throw HttpError.badRequest('Choose a password different from your current one.');
    }
    const passwordHash = await hashPassword(input.newPassword);
    await collections
      .users()
      .updateOne(
        { _id: user._id },
        { $set: { passwordHash, mustChangePassword: false, updatedAt: new Date() } },
      );
    await accounts.syncMailbox(user, input.newPassword);
    // Sign out other devices, keep this one (which now holds the new password).
    await sessionsService.destroyAllForUser(user._id, currentToken);
    await sessionsService.setPassword(session.id, input.newPassword);
  },

  async updateProfile(user: UserDoc, input: UpdateProfileInput) {
    const set: Partial<UserDoc> = { name: input.name, updatedAt: new Date() };
    if (input.username !== undefined) {
      // A Muvance address's username is the address itself: it can't change.
      if (user.mailAccountId && input.username?.toLowerCase() !== user.usernameKey) {
        throw HttpError.badRequest('Your username is your Muvance address, so it stays the same.');
      }
      if (!input.username && !user.email) {
        throw HttpError.badRequest('You need a username to sign in, since there is no email.');
      }
      set.username = input.username;
      set.usernameKey = input.username ? usernameKey(input.username) : null;
    }
    try {
      const updated = await collections
        .users()
        .findOneAndUpdate({ _id: user._id }, { $set: set }, { returnDocument: 'after' });
      if (!updated) throw HttpError.notFound('User not found');
      if (user.mailAccountId) {
        await collections
          .mailAccounts()
          .updateOne(
            { _id: user.mailAccountId },
            { $set: { name: input.name, updatedAt: new Date() } },
          );
      }
      return updated;
    } catch (error) {
      if (isDuplicateKeyError(error)) throw HttpError.conflict('That username is taken.');
      throw error;
    }
  },
};
