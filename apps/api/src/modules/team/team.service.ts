import { ObjectId } from 'mongodb';
import type {
  InviteLinkDto,
  InviteUserInput,
  Role,
  TeamDto,
  UpdateUserInput,
} from '@muvance/shared';
import { env } from '@/config/env';
import { collections } from '@/db/client';
import type { UserDoc } from '@/db/types';
import { toObjectId } from '@/lib/object-id';
import { hashToken, randomToken } from '@/lib/security';
import { sessionsService } from '@/modules/auth/sessions.service';
import { HttpError } from '@/utils/http-error';
import { toInviteDto, toUserDto } from './team.mappers';

const DAY = 24 * 60 * 60_000;
const INVITE_TTL = 7 * DAY;
const RESET_TTL = DAY;

/** Owners manage everyone; admins manage members and viewers only. */
function canManageRole(actor: UserDoc, role: Role) {
  if (actor.role === 'owner') return true;
  return actor.role === 'admin' && (role === 'member' || role === 'viewer');
}

function linkFor(token: string) {
  const url = new URL('/accept-invite', env.ADMIN_URL);
  url.searchParams.set('token', token);
  return url.toString();
}

async function createLink(
  type: 'invite' | 'reset',
  email: string,
  role: Role,
  actor: UserDoc,
  userId: ObjectId | null,
): Promise<InviteLinkDto> {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + (type === 'invite' ? INVITE_TTL : RESET_TTL));
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
  return { url: linkFor(token), expiresAt: expiresAt.toISOString() };
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
    return { users: users.map(toUserDto), invites: invites.map(toInviteDto) };
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
    const target = await collections.users().findOne({ _id: toObjectId(userId, 'User') });
    if (!target) throw HttpError.notFound('User not found');
    if (target._id.equals(actor._id)) {
      throw HttpError.badRequest("You can't change your own role or access.");
    }
    if (!canManageRole(actor, target.role) || (input.role && !canManageRole(actor, input.role))) {
      throw HttpError.forbidden();
    }

    const updated = await collections
      .users()
      .findOneAndUpdate(
        { _id: target._id },
        { $set: { ...input, updatedAt: new Date() } },
        { returnDocument: 'after' },
      );
    if (!updated) throw HttpError.notFound('User not found');
    // Disabling someone signs them out immediately.
    if (input.status === 'disabled') await sessionsService.destroyAllForUser(target._id);
    return toUserDto(updated);
  },

  /** A one-time link that lets a teammate set a new password (shared by the admin). */
  async resetLink(actor: UserDoc, userId: string) {
    const target = await collections.users().findOne({ _id: toObjectId(userId, 'User') });
    if (!target) throw HttpError.notFound('User not found');
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
    return users.map((u) => ({ id: u._id.toHexString(), name: u.name }));
  },
};
