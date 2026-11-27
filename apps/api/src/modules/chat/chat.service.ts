import { ObjectId, type Filter } from 'mongodb';
import type { ChatMemberDto, ChatMessageDto, ChatPersonDto, ChatSpaceDto } from '@muvance/shared';
import { env } from '@/config/env';
import { collections } from '@/db/client';
import type { ChatMemberDoc, ChatMessageDoc, ChatSpaceDoc, ChatUserDoc } from '@/db/types';
import { iso } from '@/lib/object-id';
import { appsOf, isMuvanceAddress } from '@/modules/auth/account';
import { HttpError } from '@/utils/http-error';
import { hub } from './hub';

export const isTeamEmail = (email: string) =>
  email.toLowerCase().endsWith(`@${env.MAIL_DOMAIN.toLowerCase()}`);

export function avatarUrlOf(user: ChatUserDoc) {
  const at = user.kind === 'team' ? user.teamAvatarAt : user.avatar?.updatedAt;
  return at ? `/api/chat/avatars/${user._id.toHexString()}?v=${at.getTime()}` : null;
}

export function toPersonDto(user: ChatUserDoc): ChatPersonDto {
  return {
    id: user._id.toHexString(),
    kind: user.kind,
    name: user.name || user.email.split('@')[0]!,
    email: user.email,
    company: user.kind === 'guest' ? user.company : null,
    avatarUrl: avatarUrlOf(user),
    online: hub.isOnline(user._id.toHexString()),
    status: user.status,
    customStatus: activeStatus(user),
    dnd: dndOn(user),
  };
}

/** Their custom status, unless it has cleared itself. */
function activeStatus(user: ChatUserDoc) {
  const s = user.customStatus;
  if (!s || (!s.emoji && !s.text)) return null;
  if (s.clearAt && s.clearAt.getTime() <= Date.now()) return null;
  return { emoji: s.emoji, text: s.text, clearAt: iso(s.clearAt) };
}

export const dndOn = (user: Pick<ChatUserDoc, 'dndUntil'>) =>
  Boolean(user.dndUntil && user.dndUntil.getTime() > Date.now());

/** What an attachment is, in words, for previews and quotes. */
export function describeAttachment(a: { name: string; contentType: string; voice?: boolean }) {
  if (a.voice) return '🎤 Voice message';
  if (a.contentType.startsWith('image/')) return '📷 Photo';
  if (a.contentType.startsWith('video/')) return '🎬 Video';
  if (a.contentType.startsWith('audio/')) return `🎵 ${a.name}`;
  return `📎 ${a.name}`;
}

export function toMessageDto(doc: ChatMessageDoc): ChatMessageDto {
  const deleted = Boolean(doc.deletedAt);
  return {
    id: doc._id.toHexString(),
    spaceId: doc.spaceId.toHexString(),
    authorId: doc.authorId.toHexString(),
    text: deleted ? '' : doc.text,
    threadId: doc.threadId?.toHexString() ?? null,
    replyCount: doc.replyCount,
    lastReplyAt: iso(doc.lastReplyAt),
    replierIds: doc.replierIds.map((id) => id.toHexString()),
    attachments: deleted
      ? []
      : doc.attachments.map((a) => ({
          id: a.id.toHexString(),
          name: a.name,
          size: a.size,
          contentType: a.contentType,
          width: a.width,
          height: a.height,
          durationMs: a.durationMs ?? null,
          voice: a.voice ?? false,
          waveform: a.waveform ?? null,
        })),
    reactions: deleted
      ? []
      : doc.reactions.map((r) => ({
          emoji: r.emoji,
          userIds: r.userIds.map((id) => id.toHexString()),
        })),
    editedAt: iso(doc.editedAt),
    deleted,
    createdAt: doc.createdAt.toISOString(),
    quote:
      !deleted && doc.quote
        ? {
            id: doc.quote.id.toHexString(),
            authorId: doc.quote.authorId.toHexString(),
            text: doc.quote.text,
            attachment: doc.quote.attachment,
          }
        : null,
    forwarded: doc.forwarded ?? false,
    pinned:
      !deleted && doc.pinnedAt && doc.pinnedBy
        ? { byId: doc.pinnedBy.toHexString(), at: doc.pinnedAt.toISOString() }
        : null,
    linkPreview: deleted ? null : (doc.linkPreview ?? null),
  };
}

/** Mentions in a message: <@id> for people in the space, <@all> for everyone. */
export function mentionsIn(text: string, memberIds: Set<string>) {
  const found = new Set<string>();
  for (const [, id] of text.matchAll(/<@([a-f\d]{24}|all)>/g)) {
    if (id === 'all' || memberIds.has(id!)) found.add(id!);
  }
  return [...found];
}

/** Message text for previews and emails: mentions become @Name. */
export function plainText(text: string, names: Map<string, string>) {
  return (
    text
      .replace(/<@all>/g, '@all')
      .replace(/<@([a-f\d]{24})>/g, (_m, id: string) => `@${names.get(id) ?? 'someone'}`)
      .replace(/```/g, '')
      // *bold*, _italic_, ~strike~ and `code` read as plain words.
      .replace(/(^|[\s(])([*_~`])(\S(?:[^\n]*?\S)?)\2(?=$|[\s.,!?:;)])/g, '$1$3')
      .trim()
  );
}

export const chatService = {
  /**
   * Keeps teammates in step with Muvance accounts: every account with Chat can use it (so people
   * can be added to spaces before they first sign in), and losing Chat (or the account) ends it.
   */
  async syncTeam() {
    const [users, team] = await Promise.all([
      collections
        .users()
        .find(
          { status: 'active' },
          { projection: { email: 1, name: 1, apps: 1, mailAccountId: 1 } },
        )
        .toArray(),
      collections.chatUsers().find({ kind: 'team' }).toArray(),
    ]);
    const withChat = users.filter((u) => appsOf(u).chat && isMuvanceAddress(u.email));
    const mailboxes = await collections
      .mailAccounts()
      .find(
        { _id: { $in: withChat.flatMap((u) => (u.mailAccountId ? [u.mailAccountId] : [])) } },
        { projection: { 'avatar.updatedAt': 1 } },
      )
      .toArray();
    const accounts = withChat.map((u) => ({
      address: u.email!.toLowerCase(),
      name: u.name,
      avatar:
        mailboxes.find((m) => u.mailAccountId && m._id.equals(u.mailAccountId))?.avatar ?? null,
    }));
    const byEmail = new Map(team.map((u) => [u.email, u]));
    const now = new Date();
    for (const a of accounts) {
      const existing = byEmail.get(a.address);
      const avatarAt = a.avatar?.updatedAt ?? null;
      const name = a.name || a.address.split('@')[0]!;
      if (!existing) {
        await collections.chatUsers().updateOne(
          { email: a.address },
          {
            $setOnInsert: {
              _id: new ObjectId(),
              kind: 'team',
              email: a.address,
              company: null,
              passwordHash: null,
              invitedBy: null,
              createdAt: now,
              lastSeenAt: null,
              emailNotifiedAt: null,
            },
            $set: { name, teamAvatarAt: avatarAt, status: 'active', updatedAt: now },
          },
          { upsert: true },
        );
      } else if (
        existing.name !== name ||
        existing.status !== 'active' ||
        (existing.teamAvatarAt?.getTime() ?? null) !== (avatarAt?.getTime() ?? null)
      ) {
        await collections
          .chatUsers()
          .updateOne(
            { _id: existing._id },
            { $set: { name, teamAvatarAt: avatarAt, status: 'active', updatedAt: now } },
          );
      }
    }
    const live = new Set(accounts.map((a) => a.address));
    const gone = team.filter((u) => !live.has(u.email) && u.status !== 'removed');
    if (gone.length) {
      await collections
        .chatUsers()
        .updateMany(
          { _id: { $in: gone.map((u) => u._id) } },
          { $set: { status: 'removed', updatedAt: now } },
        );
      await collections.chatSessions().deleteMany({ userId: { $in: gone.map((u) => u._id) } });
    }
  },

  async user(id: ObjectId) {
    const user = await collections.chatUsers().findOne({ _id: id });
    if (!user) throw HttpError.notFound('Person not found');
    return user;
  },

  /** Your membership of a space, or 404 (spaces you're not in don't exist, as far as you know). */
  async requireMember(spaceId: string, userId: ObjectId) {
    if (!ObjectId.isValid(spaceId)) throw HttpError.notFound('Conversation not found');
    const _id = new ObjectId(spaceId);
    const [space, member] = await Promise.all([
      collections.chatSpaces().findOne({ _id }),
      collections.chatMembers().findOne({ spaceId: _id, userId }),
    ]);
    if (!space || !member) throw HttpError.notFound('Conversation not found');
    return { space, member };
  },

  async memberIds(spaceId: ObjectId) {
    const members = await collections
      .chatMembers()
      .find({ spaceId }, { projection: { userId: 1 } })
      .toArray();
    return members.map((m) => m.userId.toHexString());
  },

  /** People who share a space with this person, plus (for the team) every teammate. */
  async relatedIds(user: ChatUserDoc) {
    const mine = await collections
      .chatMembers()
      .find({ userId: user._id }, { projection: { spaceId: 1 } })
      .toArray();
    const others = await collections
      .chatMembers()
      .find({ spaceId: { $in: mine.map((m) => m.spaceId) } }, { projection: { userId: 1 } })
      .toArray();
    const ids = new Set(others.map((m) => m.userId.toHexString()));
    if (user.kind === 'team') {
      const team = await collections
        .chatUsers()
        .find({ kind: 'team' }, { projection: { _id: 1 } })
        .toArray();
      for (const t of team) ids.add(t._id.toHexString());
    }
    ids.delete(user._id.toHexString());
    return [...ids];
  },

  /** Who this person can see: teammates see everyone; guests see the team and their spaces. */
  async visiblePeople(user: ChatUserDoc) {
    if (user.kind === 'team') {
      return collections
        .chatUsers()
        .find({}, { projection: { avatar: 0 } })
        .toArray();
    }
    const related = await this.relatedIds(user);
    return collections
      .chatUsers()
      .find(
        {
          $or: [
            { kind: 'team' },
            { _id: { $in: [user._id, ...related.map((id) => new ObjectId(id))] } },
          ],
        },
        { projection: { avatar: 0 } },
      )
      .toArray();
  },

  /** Whether `user` may start a direct message with `other`. */
  async canMessage(user: ChatUserDoc, other: ChatUserDoc) {
    if (other.status === 'removed' || other._id.equals(user._id)) return false;
    if (user.kind === 'team') return true;
    const related = await this.relatedIds(user);
    return related.includes(other._id.toHexString());
  },

  async spaceDto(space: ChatSpaceDoc, me: ObjectId): Promise<ChatSpaceDto> {
    const members = await collections.chatMembers().find({ spaceId: space._id }).toArray();
    const mine = members.find((m) => m.userId.equals(me));
    return this.toSpaceDto(space, members, mine ?? null, me);
  },

  async toSpaceDto(
    space: ChatSpaceDoc,
    members: ChatMemberDoc[],
    mine: ChatMemberDoc | null,
    me: ObjectId,
  ): Promise<ChatSpaceDto> {
    const since = mine?.lastReadAt ?? mine?.joinedAt ?? new Date(0);
    const unreadFilter: Filter<ChatMessageDoc> = {
      spaceId: space._id,
      authorId: { $ne: me },
      deletedAt: null,
      createdAt: { $gt: since },
    };
    const [unread, mention, last] = await Promise.all([
      collections.chatMessages().countDocuments(unreadFilter, { limit: 100 }),
      collections
        .chatMessages()
        .findOne(
          { ...unreadFilter, mentions: { $in: [me.toHexString(), 'all'] } },
          { projection: { _id: 1 } },
        ),
      collections
        .chatMessages()
        .findOne(
          { spaceId: space._id, deletedAt: null },
          { sort: { createdAt: -1 }, projection: { authorId: 1, text: 1, attachments: 1 } },
        ),
    ]);
    return {
      id: space._id.toHexString(),
      kind: space.kind,
      name: space.name,
      description: space.description,
      discoverable: space.discoverable,
      members: members.map((m): ChatMemberDto => ({
        userId: m.userId.toHexString(),
        role: m.role,
        lastReadAt: iso(m.lastReadAt),
      })),
      unread,
      mentioned: Boolean(mention),
      muted: mine?.muted ?? false,
      lastMessageAt: iso(space.lastMessageAt),
      lastMessage: last
        ? {
            authorId: last.authorId.toHexString(),
            text:
              last.text.slice(0, 200) ||
              (last.attachments.length
                ? `${describeAttachment(last.attachments[0]!)}${last.attachments.length > 1 ? ` +${last.attachments.length - 1}` : ''}`
                : ''),
          }
        : null,
      createdAt: space.createdAt.toISOString(),
    };
  },

  async spacesFor(me: ObjectId) {
    const mine = await collections.chatMembers().find({ userId: me }).toArray();
    const spaceIds = mine.map((m) => m.spaceId);
    const [spaces, members] = await Promise.all([
      collections
        .chatSpaces()
        .find({ _id: { $in: spaceIds } })
        .toArray(),
      collections
        .chatMembers()
        .find({ spaceId: { $in: spaceIds } })
        .toArray(),
    ]);
    const bySpace = new Map<string, ChatMemberDoc[]>();
    for (const m of members) {
      const key = m.spaceId.toHexString();
      bySpace.set(key, [...(bySpace.get(key) ?? []), m]);
    }
    const dtos = await Promise.all(
      spaces.map((s) => {
        const list = bySpace.get(s._id.toHexString()) ?? [];
        return this.toSpaceDto(s, list, list.find((m) => m.userId.equals(me)) ?? null, me);
      }),
    );
    return dtos.sort((a, b) =>
      (b.lastMessageAt ?? b.createdAt).localeCompare(a.lastMessageAt ?? a.createdAt),
    );
  },

  /** Tells everyone in these spaces (or these people) to refresh their list of conversations. */
  async announceSpaces(userIds: Iterable<string>) {
    hub.send(userIds, { type: 'spaces' });
  },

  async addMembers(space: ChatSpaceDoc, userIds: ObjectId[], role: 'manager' | 'member') {
    const users = await collections
      .chatUsers()
      .find({ _id: { $in: userIds }, status: { $ne: 'removed' } })
      .toArray();
    const now = new Date();
    for (const u of users) {
      await collections.chatMembers().updateOne(
        { spaceId: space._id, userId: u._id },
        {
          $setOnInsert: {
            _id: new ObjectId(),
            spaceId: space._id,
            userId: u._id,
            // Guests are never managers.
            role: u.kind === 'guest' ? 'member' : role,
            lastReadAt: null,
            muted: false,
            joinedAt: now,
          },
        },
        { upsert: true },
      );
    }
    return users;
  },

  /** Deletes a space and everything in it. */
  async deleteSpace(spaceId: ObjectId) {
    const files = await collections
      .chatFiles()
      .find({ spaceId }, { projection: { _id: 1 } })
      .toArray();
    await Promise.all([
      collections.chatMessages().deleteMany({ spaceId }),
      collections.chatSaved().deleteMany({ spaceId }),
      collections.chatMembers().deleteMany({ spaceId }),
      collections.chatSpaces().deleteOne({ _id: spaceId }),
      collections.chatFiles().deleteMany({ spaceId }),
    ]);
    return files.map((f) => f._id);
  },
};
