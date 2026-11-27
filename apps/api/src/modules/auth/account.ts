import { ObjectId } from 'mongodb';
import type { AppAccess } from '@muvance/shared';
import { env } from '@/config/env';
import { collections } from '@/db/client';
import type { MailAccountDoc, UserDoc } from '@/db/types';
import { logger } from '@/lib/logger';
import { sha512Crypt, verifySha512Crypt } from '@/lib/sha512-crypt';
import { mailService } from '@/modules/mail/mail.service';

/**
 * Muvance accounts: one sign-in (a `users` document) for every app. Someone with Mail has a
 * mailbox (`mailAccountId`) whose address is their account email and whose password is always the
 * account's, so the mail server and phone mail apps accept the same password.
 */

/** The apps an account may use. Older admin accounts (before access switches) keep what they had. */
export function appsOf(user: Pick<UserDoc, 'apps' | 'mailAccountId'>): AppAccess {
  if (user.apps) return user.apps;
  const linked = Boolean(user.mailAccountId);
  return { admin: true, mail: linked, chat: linked, meet: true };
}

export const isMuvanceAddress = (email: string | null | undefined) =>
  Boolean(email?.toLowerCase().endsWith(`@${env.MAIL_DOMAIN.toLowerCase()}`));

/** Their @muvance.com address, or null for older accounts that still use an outside email. */
export const addressOf = (user: Pick<UserDoc, 'email'>) =>
  isMuvanceAddress(user.email) ? user.email : null;

export async function mailboxOf(user: Pick<UserDoc, 'mailAccountId'>) {
  if (!user.mailAccountId) return null;
  return collections
    .mailAccounts()
    .findOne({ _id: user.mailAccountId }, { projection: { 'avatar.data': 0 } });
}

/** The account's picture: their mailbox's. */
export function avatarUrlOf(
  user: Pick<UserDoc, '_id'>,
  mailbox: Pick<MailAccountDoc, 'avatar'> | null,
) {
  return mailbox?.avatar
    ? `/api/auth/avatars/${user._id.toHexString()}?v=${mailbox.avatar.updatedAt.getTime()}`
    : null;
}

export const accounts = {
  /** Gives the mailbox the account's password (after signing in, or a password change). */
  async syncMailbox(user: Pick<UserDoc, 'mailAccountId'>, password: string) {
    const mailbox = await mailboxOf(user);
    if (!mailbox) return;
    if (verifySha512Crypt(password, mailbox.passwordHash) && !mailbox.mustChangePassword) return;
    await collections.mailAccounts().updateOne(
      { _id: mailbox._id },
      {
        $set: {
          passwordHash: sha512Crypt(password),
          mustChangePassword: false,
          updatedAt: new Date(),
        },
      },
    );
    await mailService.sync();
  },

  /**
   * Brings older data together, once per mailbox: a mailbox becomes part of the admin account with
   * the same address or username (alvi@ and the admin user "alvi" are the same person), or its own
   * Muvance account. Each person's first sign-in then makes the password they used their only one.
   * Safe to run on every start.
   */
  async migrate() {
    const mailboxes = await collections
      .mailAccounts()
      .find({}, { projection: { 'avatar.data': 0 } })
      .sort({ createdAt: 1 })
      .toArray();
    let linked = 0;
    let created = 0;
    for (const mailbox of mailboxes) {
      if (
        await collections
          .users()
          .findOne({ mailAccountId: mailbox._id }, { projection: { _id: 1 } })
      ) {
        continue;
      }
      try {
        if (await this.linkMailbox(mailbox)) linked++;
        else created++;
      } catch (error) {
        logger.error(
          { err: error, mailbox: mailbox.address },
          'Could not set up a Muvance account',
        );
      }
    }
    // Write down what older admin accounts may use, so the switches show it.
    const older = await collections
      .users()
      .find({ apps: { $exists: false } })
      .toArray();
    for (const user of older) {
      await collections.users().updateOne({ _id: user._id }, { $set: { apps: appsOf(user) } });
    }
    if (linked || created || older.length) {
      logger.info({ linked, created, updated: older.length }, 'Muvance accounts brought together');
    }
  },

  /** Links a mailbox to its person's account (true), or makes it an account of its own (false). */
  async linkMailbox(
    mailbox: Pick<
      MailAccountDoc,
      '_id' | 'address' | 'localPart' | 'name' | 'mustChangePassword' | 'createdAt'
    >,
  ) {
    // Most certain first: the same address, then the address they used before, then the username.
    let match: UserDoc | null = null;
    for (const filter of [
      { email: mailbox.address },
      { contactEmail: mailbox.address },
      { usernameKey: mailbox.localPart },
    ]) {
      match = await collections.users().findOne({ ...filter, mailAccountId: null });
      if (match) break;
    }
    const now = new Date();
    if (match) {
      const moveEmail = match.email !== mailbox.address;
      await collections.users().updateOne(
        { _id: match._id },
        {
          $set: {
            mailAccountId: mailbox._id,
            apps: { ...appsOf(match), mail: true, chat: true },
            ...(moveEmail && { email: mailbox.address, contactEmail: match.email }),
            updatedAt: now,
          },
        },
      );
      return true;
    }
    const usernameTaken = await collections
      .users()
      .findOne({ usernameKey: mailbox.localPart }, { projection: { _id: 1 } });
    await collections.users().insertOne({
      _id: new ObjectId(),
      name: mailbox.name,
      email: mailbox.address,
      username: usernameTaken ? null : mailbox.localPart,
      usernameKey: usernameTaken ? null : mailbox.localPart,
      // No account password yet: the first sign-in with the mailbox password sets it.
      passwordHash: '',
      mustChangePassword: Boolean(mailbox.mustChangePassword),
      role: 'member',
      status: 'active',
      createdAt: mailbox.createdAt,
      updatedAt: now,
      lastLoginAt: null,
      mailAccountId: mailbox._id,
      apps: { admin: false, mail: true, chat: true, meet: true },
      contactEmail: null,
    });
    return false;
  },
};
