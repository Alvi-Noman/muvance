import { rolePermissions, type InviteDto, type MeDto, type UserDto } from '@muvance/shared';
import type { InviteDoc, MailAccountDoc, UserDoc } from '@/db/types';
import { iso } from '@/lib/object-id';
import { addressOf, appsOf, avatarUrlOf } from '@/modules/auth/account';

export function toUserDto(
  user: UserDoc,
  mailbox: Pick<MailAccountDoc, 'avatar'> | null = null,
): UserDto {
  return {
    id: user._id.toHexString(),
    name: user.name,
    email: user.email ?? null,
    username: user.username ?? null,
    mustChangePassword: !!user.mustChangePassword,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: iso(user.lastLoginAt),
    address: addressOf(user),
    apps: appsOf(user),
    avatarUrl: avatarUrlOf(user, mailbox),
  };
}

export function toMeDto(
  user: UserDoc,
  mailbox: Pick<MailAccountDoc, 'avatar'> | null = null,
): MeDto {
  return { ...toUserDto(user, mailbox), permissions: [...rolePermissions[user.role]] };
}

export function toInviteDto(invite: InviteDoc): InviteDto {
  return {
    id: invite._id.toHexString(),
    email: invite.email,
    role: invite.role,
    type: invite.type,
    expiresAt: invite.expiresAt.toISOString(),
    createdAt: invite.createdAt.toISOString(),
    invitedBy: invite.invitedBy?.toHexString() ?? null,
  };
}
