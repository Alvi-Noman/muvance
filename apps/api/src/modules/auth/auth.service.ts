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
import { collections, isDuplicateKeyError } from '@/db/client';
import type { UserDoc } from '@/db/types';
import { DUMMY_PASSWORD_HASH, hashPassword, hashToken, verifyPassword } from '@/lib/security';
import { HttpError } from '@/utils/http-error';
import { sessionsService } from './sessions.service';

const INVALID_LOGIN = 'Incorrect email, username or password';

async function findValidInvite(token: string) {
  const invite = await collections.invites().findOne({ tokenHash: hashToken(token) });
  if (!invite || invite.expiresAt.getTime() <= Date.now()) {
    throw HttpError.badRequest('This link is invalid or has expired. Ask an admin for a new one.');
  }
  return invite;
}

export const authService = {
  async login(input: LoginInput, req: Request, res: Response) {
    // Emails always contain "@" and usernames never do, so the identifier is unambiguous.
    const user = await collections
      .users()
      .findOne(
        input.identifier.includes('@')
          ? { email: input.identifier }
          : { usernameKey: input.identifier },
      );
    // Always run bcrypt, even for unknown accounts, so response times don't reveal them.
    const ok = await verifyPassword(input.password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
    if (!user || !ok) throw HttpError.unauthorized(INVALID_LOGIN);
    if (user.status !== 'active') {
      throw HttpError.forbidden('Your account has been disabled. Contact an admin.');
    }

    const now = new Date();
    await collections.users().updateOne({ _id: user._id }, { $set: { lastLoginAt: now } });
    await sessionsService.create(user, req, res);
    return { ...user, lastLoginAt: now };
  },

  async getInviteInfo(token: string): Promise<InviteInfoDto> {
    const invite = await findValidInvite(token);
    return { email: invite.email, type: invite.type };
  },

  /** Completes an invite (creates the account) or a password reset, then signs the user in. */
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
          { $set: { passwordHash, updatedAt: now, lastLoginAt: now } },
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
    await sessionsService.create(user, req, res);
    return user;
  },

  async changePassword(user: UserDoc, input: ChangePasswordInput, currentToken?: string) {
    if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
      throw HttpError.badRequest('Your current password is incorrect');
    }
    const passwordHash = await hashPassword(input.newPassword);
    await collections
      .users()
      .updateOne({ _id: user._id }, { $set: { passwordHash, updatedAt: new Date() } });
    // Sign out other devices, keep this one.
    await sessionsService.destroyAllForUser(user._id, currentToken);
  },

  async updateProfile(user: UserDoc, input: UpdateProfileInput) {
    const set: Partial<UserDoc> = { name: input.name, updatedAt: new Date() };
    if (input.username !== undefined) {
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
      return updated;
    } catch (error) {
      if (isDuplicateKeyError(error)) throw HttpError.conflict('That username is taken.');
      throw error;
    }
  },
};
