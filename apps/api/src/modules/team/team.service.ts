import { randomBytes } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { mailLocalPartSchema, usernameKey } from '@muvance/shared';
import type {
  AppAccess,
  CreateUserInput,
  CreateUserResultDto,
  InviteLinkDto,
  InviteUserInput,
  Role,
  TeamDto,
  UpdateUserInput,
} from '@muvance/shared';
import { env } from '@/config/env';
import { collections, isDuplicateKeyError } from '@/db/client';
import type { MailAccountDoc, UserDoc } from '@/db/types';
import { toObjectId } from '@/lib/object-id';
import { decrypt } from '@/lib/secret-box';
import { hashPassword, hashToken, randomToken } from '@/lib/security';
import { accounts, addressOf, appsOf } from '@/modules/auth/account';
import { sessionsService } from '@/modules/auth/sessions.service';
import { mailService } from '@/modules/mail/mail.service';
import { HttpError } from '@/utils/http-error';
import { toInviteDto, toUserDto } from './team.mappers';

const DAY = 24 * 60 * 60_000;
const INVITE_TTL = 7 * DAY;
const RESET_TTL = DAY;
/** A new person's "choose your password" link lasts a week, like an invite. */
const SETUP_TTL = 7 * DAY;

/** Owners manage everyone; admins manage members and viewers only. */
function canManageRole(actor: UserDoc, role: Role) {
  if (actor.role === 'owner') return true;
  return actor.role === 'admin' && (role === 'member' || role === 'viewer');
}

/** The username becomes an address, so it must also be a valid (and not reserved) mailbox name. */
function checkAddressName(key: string) {
  const check = mailLocalPartSchema.safeParse(key);
  if (!check.success) throw HttpError.badRequest(check.error.issues[0]!.message);
}

function linkFor(token: string) {
  const url = new URL('/set-password', env.ACCOUNTS_URL);
  url.searchParams.set('token', token);
  return url.toString();
}

async function createLink(
  type: 'invite' | 'reset',
  email: string,
  role: Role,
  actor: UserDoc,
  userId: ObjectId | null,
  ttl = type === 'invite' ? INVITE_TTL : RESET_TTL,
): Promise<InviteLinkDto> {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + ttl);
  // One live link per person and type: a new link replaces the old one.
  await collections.invites().deleteMany(type === 'reset' ? { userId, type } : { email, type });
  await collections.invites().insertOne({
    _id: new ObjectId(),
    tokenHash: hashToken(token),
    type,
    email,
    role,
    userId,
    invitedBy: actor._id,
    createdAt: new Date(),
    expiresAt,
  });
  const url =
    type === 'invite'
      ? new URL(`/accept-invite?token=${encodeURIComponent(token)}`, env.ADMIN_URL).toString()
      : linkFor(token);
  return { url, expiresAt: expiresAt.toISOString() };
}

/** The password someone signed in with lately, if a session has it (so a new mailbox gets it). */
async function recentPassword(userId: ObjectId) {
  const session = await collections
    .sessions()
    .findOne(
      { userId, passwordEnc: { $type: 'string' }, expiresAt: { $gt: new Date() } },
      { sort: { createdAt: -1 } },
    );
  try {
    return session?.passwordEnc ? decrypt(session.passwordEnc) : null;
  } catch {
    return null;
  }
}

async function mailboxesFor(users: UserDoc[]) {
  const ids = users.flatMap((u) => (u.mailAccountId ? [u.mailAccountId] : []));
  const mailboxes = await collections
    .mailAccounts()
    .find({ _id: { $in: ids } }, { projection: { 'avatar.updatedAt': 1 } })
    .toArray();
  return (user: UserDoc) =>
    (user.mailAccountId && mailboxes.find((m) => m._id.equals(user.mailAccountId!))) || null;
}

async function getUser(id: string) {
  const user = await collections.users().findOne({ _id: toObjectId(id, 'Person') });
  if (!user) throw HttpError.notFound('Person not found');
  return user;
}

export const teamService = {
  async list(): Promise<TeamDto> {
    const [users, invites] = await Promise.all([
      collections.users().find().sort({ createdAt: 1 }).toArray(),
      collections
        .invites()
        .find({ type: 'invite', expiresAt: { $gt: new Date() } })
        .sort({ createdAt: -1 })
        .toArray(),
    ]);
    const mailboxOf = await mailboxesFor(users);
    return {
      users: users.map((u) => toUserDto(u, mailboxOf(u))),
      invites: invites.map(toInviteDto),
    };
  },

  /**
   * Adds someone to Muvance: their account (alvi@muvance.com) and, with Mail, their mailbox. With a
   * starting password they must replace it; without one, they get a link to choose their own.
   */
  async create(actor: UserDoc, input: CreateUserInput): Promise<CreateUserResultDto> {
    if (!canManageRole(actor, input.role)) {
      throw HttpError.forbidden(`You can't add someone as ${input.role}.`);
    }
    const key = usernameKey(input.username);
    checkAddressName(key);
    const address = `${key}@${env.MAIL_DOMAIN}`;
    const clash = await collections.users().findOne({
      $or: [{ usernameKey: key }, { email: address }, { contactEmail: address }],
    });
    if (clash) throw HttpError.conflict(`${address} is already someone's Muvance account.`);
    await mailService.assertFree(key);

    const password = input.password ?? randomBytes(24).toString('base64url');
    const now = new Date();
    const user: UserDoc = {
      _id: new ObjectId(),
      name: input.name,
      email: address,
      username: input.username,
      usernameKey: key,
      passwordHash: await hashPassword(password),
      mustChangePassword: Boolean(input.password),
      role: input.role,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
      mailAccountId: null,
      apps: input.apps,
      contactEmail: null,
    };
    try {
      await collections.users().insertOne(user);
    } catch (error) {
      if (isDuplicateKeyError(error)) throw HttpError.conflict('That username is taken.');
      throw error;
    }
    let mailbox: MailAccountDoc | null = null;
    if (input.apps.mail) {
      mailbox = await mailService.createForAccount(user, password, actor);
      user.mailAccountId = mailbox._id;
    }
    const link = input.password
      ? null
      : await createLink('reset', address, input.role, actor, user._id, SETUP_TTL);
    return { user: toUserDto(user, mailbox), link };
  },

  async invite(actor: UserDoc, input: InviteUserInput) {
    if (!canManageRole(actor, input.role)) {
      throw HttpError.forbidden(`You can't invite someone as ${input.role}.`);
    }
    if (await collections.users().findOne({ email: input.email })) {
      throw HttpError.conflict('Someone with this email is already on the team.');
    }
    return createLink('invite', input.email, input.role, actor, null);
  },

  async revokeInvite(actor: UserDoc, inviteId: string) {
    const invite = await collections.invites().findOne({ _id: toObjectId(inviteId, 'Invite') });
    if (!invite) throw HttpError.notFound('Invite not found');
    if (!canManageRole(actor, invite.role)) throw HttpError.forbidden();
    await collections.invites().deleteOne({ _id: invite._id });
  },

  async update(actor: UserDoc, userId: string, input: UpdateUserInput) {
    const target = await getUser(userId);
    const self = target._id.equals(actor._id);
    if (self && (input.role || input.status || input.apps)) {
      throw HttpError.badRequest("You can't change your own role or access.");
    }
    if (!self && !canManageRole(actor, target.role)) throw HttpError.forbidden();
    if (input.role && !canManageRole(actor, input.role)) throw HttpError.forbidden();

    const set: Partial<UserDoc> = { updatedAt: new Date() };
    if (input.name) set.name = input.name;
    if (input.role) set.role = input.role;
    if (input.status) set.status = input.status;
    if (input.apps) {
      set.apps = input.apps;
      await this.applyMail(actor, target, input.apps);
      const after = await collections.users().findOne({ _id: target._id });
      set.mailAccountId = after?.mailAccountId ?? null;
    }
    const updated = await collections
      .users()
      .findOneAndUpdate({ _id: target._id }, { $set: set }, { returnDocument: 'after' });
    if (!updated) throw HttpError.notFound('Person not found');
    if (input.name && updated.mailAccountId) {
      await collections
        .mailAccounts()
        .updateOne(
          { _id: updated.mailAccountId },
          { $set: { name: input.name, updatedAt: new Date() } },
        );
    }
    // Disabling someone signs them out of every app, mail included.
    if (input.status === 'disabled') await sessionsService.destroyAllForUser(target._id);
    if (input.status) await mailService.sync();
    return toUserDto(
      updated,
      updated.mailAccountId ? await mailService.get(updated.mailAccountId) : null,
    );
  },

  /** Mail switched on makes their mailbox; switched off removes it (the stored mail stays). */
  async applyMail(actor: UserDoc, target: UserDoc, apps: AppAccess) {
    const had = appsOf(target).mail && Boolean(target.mailAccountId);
    if (apps.mail && !target.mailAccountId) {
      if (!addressOf(target)) {
        throw HttpError.badRequest('Give them a Muvance address first, then switch on Mail.');
      }
      const password = (await recentPassword(target._id)) ?? randomBytes(24).toString('base64url');
      await mailService.createForAccount(target, password, actor);
    } else if (!apps.mail && had && target.mailAccountId) {
      await mailService.remove(target.mailAccountId);
      await collections.users().updateOne({ _id: target._id }, { $set: { mailAccountId: null } });
    }
  },

  /**
   * Gives an older account (signed in with an outside email) its Muvance address. If that mailbox
   * already exists as an account of its own, the two become one.
   */
  async setAddress(actor: UserDoc, userId: string, username: string) {
    const target = await getUser(userId);
    if (!target._id.equals(actor._id) && !canManageRole(actor, target.role)) {
      throw HttpError.forbidden();
    }
    if (addressOf(target)) throw HttpError.badRequest(`They already have ${target.email}.`);
    const key = usernameKey(username);
    checkAddressName(key);
    const address = `${key}@${env.MAIL_DOMAIN}`;
    const mailbox = await collections.mailAccounts().findOne({ localPart: key });
    const other = mailbox
      ? await collections.users().findOne({ mailAccountId: mailbox._id })
      : await collections.users().findOne({ $or: [{ usernameKey: key }, { email: address }] });
    if (other && !other._id.equals(target._id)) {
      if (!mailbox) throw HttpError.conflict(`${address} is already someone's Muvance account.`);
      if (!canManageRole(actor, other.role)) throw HttpError.forbidden();
      // The same person: one account from now on.
      await sessionsService.destroyAllForUser(other._id);
      await collections.users().deleteOne({ _id: other._id });
    }
    if (!mailbox) await mailService.assertFree(key);
    const apps = appsOf(target);
    const otherApps = other ? appsOf(other) : null;
    const merged: AppAccess = {
      admin: apps.admin || Boolean(otherApps?.admin),
      mail: Boolean(mailbox) || apps.mail,
      chat: apps.chat || Boolean(otherApps?.chat) || Boolean(mailbox),
      meet: apps.meet || Boolean(otherApps?.meet),
    };
    await collections.users().updateOne(
      { _id: target._id },
      {
        $set: {
          email: address,
          contactEmail: target.email,
          username: username,
          usernameKey: key,
          mailAccountId: mailbox?._id ?? null,
          apps: merged,
          updatedAt: new Date(),
        },
      },
    );
    const updated = (await collections.users().findOne({ _id: target._id }))!;
    if (merged.mail && !mailbox)
      await this.applyMail(actor, { ...updated, mailAccountId: null }, merged);
    else if (mailbox) {
      // The mailbox takes the account's password at their next sign-in (or now, if they're in).
      const password = await recentPassword(target._id);
      if (password) await accounts.syncMailbox(updated, password);
    }
    const final = (await collections.users().findOne({ _id: target._id }))!;
    return toUserDto(
      final,
      final.mailAccountId ? await mailService.get(final.mailAccountId) : null,
    );
  },

  /** A one-time link that lets a teammate set a new password (shared by the admin). */
  async resetLink(actor: UserDoc, userId: string) {
    const target = await getUser(userId);
    if (!target._id.equals(actor._id) && !canManageRole(actor, target.role)) {
      throw HttpError.forbidden();
    }
    if (target.status !== 'active') throw HttpError.badRequest('Re-enable this account first.');
    return createLink(
      'reset',
      target.email ?? target.username ?? target.name,
      target.role,
      actor,
      target._id,
    );
  },

  /** Teammates who can be assigned leads. */
  async assignable() {
    const users = await collections
      .users()
      .find({ status: 'active', role: { $ne: 'viewer' } })
      .sort({ name: 1 })
      .toArray();
    return users
      .filter((u) => appsOf(u).admin)
      .map((u) => ({ id: u._id.toHexString(), name: u.name }));
  },
};
