import express, { Router, type Request } from 'express';
import { rateLimit } from 'express-rate-limit';
import { ObjectId } from 'mongodb';
import {
  CHAT_FILE_MAX_BYTES,
  chatAcceptInviteSchema,
  chatAddMembersSchema,
  chatChangePasswordSchema,
  chatCreateSpaceSchema,
  chatEditSchema,
  chatInviteGuestSchema,
  chatLoginSchema,
  chatMemberRoleSchema,
  chatMuteSchema,
  chatProfileSchema,
  chatReactSchema,
  chatSendSchema,
  chatStartDmSchema,
  chatTypingSchema,
  chatUpdateSpaceSchema,
  mailAvatarSchema,
  type ChatBootstrapDto,
  type ChatBrowseSpaceDto,
  type ChatGuestDto,
  type ChatInviteInfoDto,
  type ChatInviteResultDto,
  type ChatMeDto,
  type ChatMessageDto,
  type ChatMessagePage,
  type ChatThreadDto,
} from '@muvance/shared';
import { env, isTest } from '@/config/env';
import { collections, isDuplicateKeyError } from '@/db/client';
import type { ChatMessageDoc, ChatSpaceDoc, ChatUserDoc } from '@/db/types';
import { logger } from '@/lib/logger';
import { iso, toObjectId } from '@/lib/object-id';
import {
  DUMMY_PASSWORD_HASH,
  hashPassword,
  hashToken,
  randomToken,
  verifyPassword,
} from '@/lib/security';
import { verifySha512Crypt } from '@/lib/sha512-crypt';
import { loginLimiter } from '@/middlewares/rate-limit';
import { validateBody } from '@/middlewares/validate';
import { decodeAvatar, mailService } from '@/modules/mail/mail.service';
import { sendAvatar } from '@/modules/mail/send-avatar';
import { HttpError } from '@/utils/http-error';
import { chatService, isTeamEmail, mentionsIn, toMessageDto, toPersonDto } from './chat.service';
import { chatFiles, INLINE_TYPES } from './files';
import { hub } from './hub';
import { chatEmail, chatMailer } from './mailer';
import { chatSession, chatSessions, requireChatSession } from './session';

/** Muvance Chat (chat.muvance.com): team and client conversations. */
export const chatRouter = Router();

// The whole team may share one office connection, so chat has a roomier limit than the API's.
chatRouter.use(
  rateLimit({
    windowMs: 60_000,
    limit: 1200,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: { message: 'Too many requests. Please wait a moment.' } },
    skip: () => isTest,
  }),
);

const INVITE_DAYS = 14;
const PAGE_SIZE = 50;

const me = (req: Request) => chatSession(req).user;
const meId = (req: Request) => me(req)._id;

function requireTeam(req: Request) {
  if (me(req).kind !== 'team') throw HttpError.forbidden('Only the Muvance team can do that.');
}

function meDto(user: ChatUserDoc): ChatMeDto {
  return { ...toPersonDto(user), canManage: user.kind === 'team' };
}

async function announcePerson(user: ChatUserDoc) {
  hub.send(await chatService.relatedIds(user), { type: 'person', person: toPersonDto(user) });
}

/** A fresh one-time link for a guest to choose their password. */
async function newInvite(guest: ChatUserDoc, by: ObjectId, spaceId: ObjectId | null) {
  const token = randomToken();
  await collections.chatInvites().insertOne({
    _id: new ObjectId(),
    tokenHash: hashToken(token),
    userId: guest._id,
    invitedBy: by,
    spaceId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + INVITE_DAYS * 86_400_000),
  });
  return `${env.CHAT_URL}/join/${token}`;
}

/** Emails a guest from the teammate's own address; false when it couldn't be sent. */
async function emailGuest(
  req: Request,
  guest: ChatUserDoc,
  content: { subject: string; heading: string; lines: string[]; button: string; url: string },
) {
  const session = chatSession(req);
  if (!session.mailPassword) return false;
  try {
    await chatMailer.send(
      { email: session.user.email, password: session.mailPassword },
      { to: guest.email, subject: content.subject, ...chatEmail(content) },
    );
    return true;
  } catch (error) {
    logger.warn({ err: error, to: guest.email }, 'Could not send a chat email');
    return false;
  }
}

async function findMessage(id: string, userId: ObjectId) {
  const message = await collections.chatMessages().findOne({ _id: toObjectId(id, 'Message') });
  if (!message) throw HttpError.notFound('Message not found');
  const access = await chatService.requireMember(message.spaceId.toHexString(), userId);
  return { message, ...access };
}

async function broadcastMessage(message: ChatMessageDoc) {
  hub.send(await chatService.memberIds(message.spaceId), {
    type: 'message',
    message: toMessageDto(message),
  });
}

// --- Signing in --------------------------------------------------------------------------

chatRouter.post('/login', loginLimiter, validateBody(chatLoginSchema), async (req, res) => {
  let { email } = req.body as { email: string };
  const { password } = req.body as { password: string };
  if (!email.includes('@')) email = `${email}@${env.MAIL_DOMAIN}`;

  if (isTeamEmail(email)) {
    const account = await collections.mailAccounts().findOne({ address: email });
    if (!account || !verifySha512Crypt(password, account.passwordHash)) {
      throw HttpError.unauthorized('Wrong email or password.');
    }
    if (account.mustChangePassword) {
      throw HttpError.forbidden(
        `Choose your own password in Muvance Mail first (mail.${env.MAIL_DOMAIN}), then sign in here with it.`,
      );
    }
    await chatService.syncTeam();
    const user = await collections.chatUsers().findOne({ email });
    if (!user) throw HttpError.unauthorized('Wrong email or password.');
    await chatSessions.create(user._id, password, res);
    res.json(meDto(user));
    return;
  }

  const user = await collections.chatUsers().findOne({ email, kind: 'guest' });
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
  if (!user || !user.passwordHash || !ok) throw HttpError.unauthorized('Wrong email or password.');
  if (user.status === 'removed') {
    throw HttpError.forbidden('Your access to Muvance Chat has ended.');
  }
  await chatSessions.create(user._id, null, res);
  res.json(meDto(user));
});

chatRouter.post('/logout', async (req, res) => {
  await chatSessions.destroy(req, res);
  res.status(204).end();
});

async function inviteFor(token: string) {
  const invite = await collections.chatInvites().findOne({ tokenHash: hashToken(token) });
  if (!invite || invite.expiresAt.getTime() < Date.now()) {
    throw HttpError.notFound(
      'This invite link has expired or was already used. Ask the person who invited you for a new one.',
    );
  }
  const user = await collections.chatUsers().findOne({ _id: invite.userId });
  if (!user || user.status === 'removed')
    throw HttpError.notFound('This invite is no longer valid.');
  return { invite, user };
}

chatRouter.get('/invites/:token', async (req, res) => {
  const { invite, user } = await inviteFor(String(req.params.token));
  const [by, space] = await Promise.all([
    collections.chatUsers().findOne({ _id: invite.invitedBy }),
    invite.spaceId ? collections.chatSpaces().findOne({ _id: invite.spaceId }) : null,
  ]);
  const info: ChatInviteInfoDto = {
    email: user.email,
    name: user.name,
    invitedBy: by?.name ?? 'Muvance',
    spaceName: space?.name ?? null,
    existing: Boolean(user.passwordHash),
  };
  res.json(info);
});

chatRouter.post(
  '/invites/:token/accept',
  loginLimiter,
  validateBody(chatAcceptInviteSchema),
  async (req, res) => {
    const { user } = await inviteFor(String(req.params.token));
    const { name, password } = req.body as { name: string; password: string };
    const updated = await collections.chatUsers().findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          name,
          passwordHash: await hashPassword(password),
          status: 'active',
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' },
    );
    // The link is used up, and a new password signs out anywhere else.
    await collections.chatInvites().deleteMany({ userId: user._id });
    await chatSessions.destroyAll(user._id);
    await chatSessions.create(user._id, null, res);
    await announcePerson(updated!);
    res.json(meDto(updated!));
  },
);

// Everything below needs a sign-in.
chatRouter.use(requireChatSession);

// --- You -----------------------------------------------------------------------------------

chatRouter.get('/me', (req, res) => {
  res.json(meDto(me(req)));
});

chatRouter.get('/bootstrap', async (req, res) => {
  const user = me(req);
  if (user.kind === 'team') await chatService.syncTeam();
  const [spaces, people] = await Promise.all([
    chatService.spacesFor(user._id),
    chatService.visiblePeople(user),
  ]);
  const body: ChatBootstrapDto = {
    me: meDto(user),
    spaces,
    people: people.map(toPersonDto),
  };
  res.json(body);
});

chatRouter.put('/me', validateBody(chatProfileSchema), async (req, res) => {
  const user = me(req);
  const { name, company } = req.body as { name?: string; company?: string };
  // Teammates' names come from their mailbox (set in the admin).
  const set =
    user.kind === 'guest'
      ? {
          ...(name !== undefined && { name }),
          ...(company !== undefined && { company: company || null }),
        }
      : {};
  const updated = await collections
    .chatUsers()
    .findOneAndUpdate(
      { _id: user._id },
      { $set: { ...set, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
  await announcePerson(updated!);
  res.json(meDto(updated!));
});

chatRouter.put('/me/password', validateBody(chatChangePasswordSchema), async (req, res) => {
  const user = me(req);
  if (user.kind === 'team') {
    throw HttpError.badRequest(
      `Your password is your email password. Change it in Muvance Mail (mail.${env.MAIL_DOMAIN}).`,
    );
  }
  const { current, next } = req.body as { current: string; next: string };
  if (!user.passwordHash || !(await verifyPassword(current, user.passwordHash))) {
    throw HttpError.forbidden('Your current password is wrong.');
  }
  await collections
    .chatUsers()
    .updateOne(
      { _id: user._id },
      { $set: { passwordHash: await hashPassword(next), updatedAt: new Date() } },
    );
  // Sign out everywhere else.
  await collections
    .chatSessions()
    .deleteMany({ userId: user._id, _id: { $ne: chatSession(req).id } });
  res.status(204).end();
});

async function setAvatar(req: Request, image: string | null) {
  const user = me(req);
  if (user.kind === 'team') {
    // The same picture as their email.
    await mailService.setAvatar({ address: user.email }, image);
    await collections
      .chatUsers()
      .updateOne(
        { _id: user._id },
        { $set: { teamAvatarAt: image ? new Date() : null, updatedAt: new Date() } },
      );
  } else {
    await collections
      .chatUsers()
      .updateOne(
        { _id: user._id },
        { $set: { avatar: image ? decodeAvatar(image) : null, updatedAt: new Date() } },
      );
  }
  const updated = await chatService.user(user._id);
  await announcePerson(updated);
  return meDto(updated);
}

chatRouter.put('/me/avatar', validateBody(mailAvatarSchema), async (req, res) => {
  res.json(await setAvatar(req, req.body.image as string));
});

chatRouter.delete('/me/avatar', async (req, res) => {
  res.json(await setAvatar(req, null));
});

chatRouter.get('/avatars/:id', async (req, res) => {
  const user = await collections
    .chatUsers()
    .findOne({ _id: toObjectId(String(req.params.id), 'Person') });
  if (!user) throw HttpError.notFound('No picture');
  if (user.kind === 'team') {
    sendAvatar(res, await mailService.avatar({ address: user.email }));
  } else {
    if (!user.avatar) throw HttpError.notFound('No picture');
    sendAvatar(res, user.avatar);
  }
});

// --- Live updates --------------------------------------------------------------------------

chatRouter.get('/events', async (req, res) => {
  const user = me(req);
  const id = user._id.toHexString();
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write('retry: 3000\n\n');
  const seen = () =>
    collections.chatUsers().updateOne({ _id: user._id }, { $set: { lastSeenAt: new Date() } });
  if (hub.add(id, res)) {
    await seen();
    hub.send(await chatService.relatedIds(user), { type: 'presence', userId: id, online: true });
  }
  req.on('close', () => {
    if (hub.remove(id, res)) {
      void (async () => {
        await seen();
        hub.send(await chatService.relatedIds(user), {
          type: 'presence',
          userId: id,
          online: false,
        });
      })().catch(() => {});
    }
  });
});

// --- People --------------------------------------------------------------------------------

chatRouter.get('/people', async (req, res) => {
  const user = me(req);
  if (user.kind === 'team') await chatService.syncTeam();
  const people = await chatService.visiblePeople(user);
  res.json(people.filter((p) => p.status !== 'removed').map(toPersonDto));
});

// --- Conversations -------------------------------------------------------------------------

chatRouter.post('/spaces', validateBody(chatCreateSpaceSchema), async (req, res) => {
  requireTeam(req);
  const input = req.body as {
    name: string;
    description: string;
    discoverable: boolean;
    memberIds: string[];
  };
  const now = new Date();
  const space: ChatSpaceDoc = {
    _id: new ObjectId(),
    kind: 'space',
    name: input.name,
    description: input.description,
    discoverable: input.discoverable,
    dmKey: null,
    createdBy: meId(req),
    createdAt: now,
    updatedAt: now,
    lastMessageAt: null,
  };
  await collections.chatSpaces().insertOne(space);
  await chatService.addMembers(space, [meId(req)], 'manager');
  await chatService.addMembers(
    space,
    input.memberIds.map((id) => new ObjectId(id)).filter((id) => !id.equals(meId(req))),
    'member',
  );
  await chatService.announceSpaces(await chatService.memberIds(space._id));
  res.status(201).json(await chatService.spaceDto(space, meId(req)));
});

chatRouter.post('/dms', validateBody(chatStartDmSchema), async (req, res) => {
  const user = me(req);
  const other = await collections.chatUsers().findOne({ _id: new ObjectId(req.body.userId) });
  if (!other || !(await chatService.canMessage(user, other))) {
    throw HttpError.forbidden("You can't message this person.");
  }
  const dmKey = [user._id.toHexString(), other._id.toHexString()].sort().join(':');
  let space = await collections.chatSpaces().findOne({ dmKey });
  if (!space) {
    const now = new Date();
    space = {
      _id: new ObjectId(),
      kind: 'dm',
      name: '',
      description: '',
      discoverable: false,
      dmKey,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: null,
    };
    try {
      await collections.chatSpaces().insertOne(space);
      await chatService.addMembers(space, [user._id, other._id], 'member');
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
      space = (await collections.chatSpaces().findOne({ dmKey }))!;
    }
  }
  // Someone removed from every shared space can still be in an old DM; make sure both are in it.
  await chatService.addMembers(space, [user._id, other._id], 'member');
  hub.send([user._id.toHexString()], { type: 'spaces' });
  res.json(await chatService.spaceDto(space, user._id));
});

chatRouter.get('/spaces/browse', async (req, res) => {
  requireTeam(req);
  const mine = await collections
    .chatMembers()
    .find({ userId: meId(req) }, { projection: { spaceId: 1 } })
    .toArray();
  const spaces = await collections
    .chatSpaces()
    .find({ kind: 'space', discoverable: true, _id: { $nin: mine.map((m) => m.spaceId) } })
    .sort({ name: 1 })
    .limit(200)
    .toArray();
  const counts = await collections
    .chatMembers()
    .aggregate<{ _id: ObjectId; n: number }>([
      { $match: { spaceId: { $in: spaces.map((s) => s._id) } } },
      { $group: { _id: '$spaceId', n: { $sum: 1 } } },
    ])
    .toArray();
  const countOf = new Map(counts.map((c) => [c._id.toHexString(), c.n]));
  const body: ChatBrowseSpaceDto[] = spaces.map((s) => ({
    id: s._id.toHexString(),
    name: s.name,
    description: s.description,
    memberCount: countOf.get(s._id.toHexString()) ?? 0,
  }));
  res.json(body);
});

chatRouter.post('/spaces/:id/join', async (req, res) => {
  requireTeam(req);
  const space = await collections.chatSpaces().findOne({
    _id: toObjectId(String(req.params.id), 'Space'),
    kind: 'space',
    discoverable: true,
  });
  if (!space) throw HttpError.notFound('Space not found');
  await chatService.addMembers(space, [meId(req)], 'member');
  await chatService.announceSpaces(await chatService.memberIds(space._id));
  res.json(await chatService.spaceDto(space, meId(req)));
});

function requireManager(req: Request, member: { role: string }, space: ChatSpaceDoc) {
  if (space.kind !== 'space') throw HttpError.badRequest("Direct messages can't be changed.");
  if (me(req).kind !== 'team' || member.role !== 'manager') {
    throw HttpError.forbidden('Only space managers can do that.');
  }
}

chatRouter.patch('/spaces/:id', validateBody(chatUpdateSpaceSchema), async (req, res) => {
  const { space, member } = await chatService.requireMember(String(req.params.id), meId(req));
  requireManager(req, member, space);
  const updated = await collections
    .chatSpaces()
    .findOneAndUpdate(
      { _id: space._id },
      { $set: { ...req.body, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
  await chatService.announceSpaces(await chatService.memberIds(space._id));
  res.json(await chatService.spaceDto(updated!, meId(req)));
});

chatRouter.delete('/spaces/:id', async (req, res) => {
  const { space, member } = await chatService.requireMember(String(req.params.id), meId(req));
  requireManager(req, member, space);
  const members = await chatService.memberIds(space._id);
  await chatFiles.remove(await chatService.deleteSpace(space._id));
  hub.send(members, { type: 'space-removed', spaceId: space._id.toHexString() });
  res.status(204).end();
});

/** Removes someone from a space; the last manager leaving hands over to a teammate. */
async function removeMember(space: ChatSpaceDoc, userId: ObjectId) {
  const before = await chatService.memberIds(space._id);
  await collections.chatMembers().deleteOne({ spaceId: space._id, userId });
  const left = await collections
    .chatMembers()
    .find({ spaceId: space._id })
    .sort({ joinedAt: 1 })
    .toArray();
  if (!left.length) {
    await chatFiles.remove(await chatService.deleteSpace(space._id));
  } else if (!left.some((m) => m.role === 'manager')) {
    const team = await collections
      .chatUsers()
      .find({ _id: { $in: left.map((m) => m.userId) }, kind: 'team' })
      .toArray();
    const next = left.find((m) => team.some((t) => t._id.equals(m.userId)));
    if (next) {
      await collections.chatMembers().updateOne({ _id: next._id }, { $set: { role: 'manager' } });
    }
  }
  hub.send([userId.toHexString()], { type: 'space-removed', spaceId: space._id.toHexString() });
  await chatService.announceSpaces(before.filter((id) => id !== userId.toHexString()));
}

chatRouter.post('/spaces/:id/leave', async (req, res) => {
  const { space } = await chatService.requireMember(String(req.params.id), meId(req));
  if (space.kind !== 'space') throw HttpError.badRequest("You can't leave a direct message.");
  await removeMember(space, meId(req));
  res.status(204).end();
});

chatRouter.post('/spaces/:id/members', validateBody(chatAddMembersSchema), async (req, res) => {
  requireTeam(req);
  const { space } = await chatService.requireMember(String(req.params.id), meId(req));
  if (space.kind !== 'space')
    throw HttpError.badRequest("You can't add people to a direct message.");
  await chatService.addMembers(
    space,
    (req.body.userIds as string[]).map((id) => new ObjectId(id)),
    'member',
  );
  await chatService.announceSpaces(await chatService.memberIds(space._id));
  res.json(await chatService.spaceDto(space, meId(req)));
});

chatRouter.post('/spaces/:id/guests', validateBody(chatInviteGuestSchema), async (req, res) => {
  requireTeam(req);
  const { space } = await chatService.requireMember(String(req.params.id), meId(req));
  if (space.kind !== 'space') throw HttpError.badRequest('Invite guests to a space.');
  const { email, name } = req.body as { email: string; name: string };
  if (isTeamEmail(email)) {
    throw HttpError.badRequest('That is a team address: add them as a teammate instead.');
  }
  const now = new Date();
  let guest = await collections.chatUsers().findOne({ email });
  if (guest?.kind === 'team') throw HttpError.badRequest('That person is on the team.');
  if (!guest) {
    guest = {
      _id: new ObjectId(),
      kind: 'guest',
      email,
      name: name || email.split('@')[0]!,
      company: null,
      passwordHash: null,
      status: 'invited',
      avatar: null,
      invitedBy: meId(req),
      createdAt: now,
      updatedAt: now,
      lastSeenAt: null,
      emailNotifiedAt: null,
    };
    await collections.chatUsers().insertOne(guest);
  } else if (guest.status === 'removed') {
    guest = (await collections
      .chatUsers()
      .findOneAndUpdate(
        { _id: guest._id },
        { $set: { status: guest.passwordHash ? 'active' : 'invited', updatedAt: now } },
        { returnDocument: 'after' },
      ))!;
  }
  await chatService.addMembers(space, [guest._id], 'member');
  await chatService.announceSpaces(await chatService.memberIds(space._id));

  const inviter = me(req).name;
  let inviteUrl: string | null = null;
  let emailed: boolean;
  if (!guest.passwordHash) {
    inviteUrl = await newInvite(guest, meId(req), space._id);
    emailed = await emailGuest(req, guest, {
      subject: `${inviter} invited you to chat with Muvance`,
      heading: `${inviter} invited you to “${space.name}”`,
      lines: [
        'Muvance Chat is where we talk with you about your work: messages, files and updates in one place.',
        'Open the link to choose your password. It works for 14 days.',
      ],
      button: 'Join the conversation',
      url: inviteUrl,
    });
  } else {
    emailed = await emailGuest(req, guest, {
      subject: `${inviter} added you to “${space.name}”`,
      heading: `You were added to “${space.name}”`,
      lines: [`${inviter} added you to a new conversation in Muvance Chat.`],
      button: 'Open Muvance Chat',
      url: `${env.CHAT_URL}/c/${space._id.toHexString()}`,
    });
  }
  const body: ChatInviteResultDto = { person: toPersonDto(guest), inviteUrl, emailed };
  res.status(201).json(body);
});

chatRouter.delete('/spaces/:id/members/:userId', async (req, res) => {
  const { space, member } = await chatService.requireMember(String(req.params.id), meId(req));
  const target = toObjectId(String(req.params.userId), 'Person');
  if (!target.equals(meId(req))) requireManager(req, member, space);
  else if (space.kind !== 'space') throw HttpError.badRequest("You can't leave a direct message.");
  await removeMember(space, target);
  res.status(204).end();
});

chatRouter.patch(
  '/spaces/:id/members/:userId',
  validateBody(chatMemberRoleSchema),
  async (req, res) => {
    const { space, member } = await chatService.requireMember(String(req.params.id), meId(req));
    requireManager(req, member, space);
    const target = await chatService.user(toObjectId(String(req.params.userId), 'Person'));
    if (target.kind === 'guest') throw HttpError.badRequest("Guests can't manage spaces.");
    const { role } = req.body as { role: 'manager' | 'member' };
    if (role === 'member') {
      const managers = await collections
        .chatMembers()
        .countDocuments({ spaceId: space._id, role: 'manager' });
      if (managers <= 1 && target._id.equals(meId(req))) {
        throw HttpError.badRequest('Make someone else a manager first.');
      }
    }
    await collections
      .chatMembers()
      .updateOne({ spaceId: space._id, userId: target._id }, { $set: { role } });
    await chatService.announceSpaces(await chatService.memberIds(space._id));
    res.status(204).end();
  },
);

chatRouter.put('/spaces/:id/read', async (req, res) => {
  const user = me(req);
  const { space } = await chatService.requireMember(String(req.params.id), user._id);
  const now = new Date();
  await collections
    .chatMembers()
    .updateOne({ spaceId: space._id, userId: user._id }, { $set: { lastReadAt: now } });
  await collections.chatUsers().updateOne({ _id: user._id }, { $set: { lastSeenAt: now } });
  hub.send(await chatService.memberIds(space._id), {
    type: 'read',
    spaceId: space._id.toHexString(),
    userId: user._id.toHexString(),
    lastReadAt: now.toISOString(),
  });
  res.status(204).end();
});

chatRouter.put('/spaces/:id/mute', validateBody(chatMuteSchema), async (req, res) => {
  const { space } = await chatService.requireMember(String(req.params.id), meId(req));
  await collections
    .chatMembers()
    .updateOne({ spaceId: space._id, userId: meId(req) }, { $set: { muted: req.body.muted } });
  hub.send([meId(req).toHexString()], { type: 'spaces' });
  res.status(204).end();
});

chatRouter.post('/spaces/:id/typing', validateBody(chatTypingSchema), async (req, res) => {
  const { space } = await chatService.requireMember(String(req.params.id), meId(req));
  hub.send(
    await chatService.memberIds(space._id),
    {
      type: 'typing',
      spaceId: space._id.toHexString(),
      threadId: req.body.threadId as string | null,
      userId: meId(req).toHexString(),
    },
    meId(req).toHexString(),
  );
  res.status(204).end();
});

// --- Messages ------------------------------------------------------------------------------

chatRouter.get('/spaces/:id/messages', async (req, res) => {
  const { space } = await chatService.requireMember(String(req.params.id), meId(req));
  const before = typeof req.query.before === 'string' ? req.query.before : null;
  const filter: Record<string, unknown> = { spaceId: space._id, threadId: null };
  if (before) filter._id = { $lt: toObjectId(before, 'Message') };
  const docs = await collections
    .chatMessages()
    .find(filter)
    .sort({ _id: -1 })
    .limit(PAGE_SIZE + 1)
    .toArray();
  const body: ChatMessagePage = {
    messages: docs.slice(0, PAGE_SIZE).reverse().map(toMessageDto),
    hasMore: docs.length > PAGE_SIZE,
  };
  res.json(body);
});

chatRouter.get('/messages/:id/thread', async (req, res) => {
  const { message } = await findMessage(String(req.params.id), meId(req));
  const root = message.threadId
    ? await collections.chatMessages().findOne({ _id: message.threadId })
    : message;
  if (!root) throw HttpError.notFound('Message not found');
  const replies = await collections
    .chatMessages()
    .find({ threadId: root._id })
    .sort({ _id: 1 })
    .limit(1000)
    .toArray();
  const body: ChatThreadDto = { root: toMessageDto(root), replies: replies.map(toMessageDto) };
  res.json(body);
});

chatRouter.post('/spaces/:id/messages', validateBody(chatSendSchema), async (req, res) => {
  const user = me(req);
  const { space } = await chatService.requireMember(String(req.params.id), user._id);
  const input = req.body as { text: string; threadId: string | null; attachmentIds: string[] };

  let root: ChatMessageDoc | null = null;
  if (input.threadId) {
    root = await collections
      .chatMessages()
      .findOne({ _id: new ObjectId(input.threadId), spaceId: space._id, threadId: null });
    if (!root || root.deletedAt) throw HttpError.badRequest('That message was deleted.');
  }

  const fileIds = input.attachmentIds.map((id) => new ObjectId(id));
  const files = fileIds.length
    ? await collections
        .chatFiles()
        .find({ _id: { $in: fileIds }, spaceId: space._id, uploaderId: user._id, messageId: null })
        .toArray()
    : [];
  if (files.length !== fileIds.length) {
    throw HttpError.badRequest('A file is missing. Attach it again.');
  }

  const memberIds = await chatService.memberIds(space._id);
  const now = new Date();
  const message: ChatMessageDoc = {
    _id: new ObjectId(),
    spaceId: space._id,
    authorId: user._id,
    text: input.text.trim(),
    threadId: root?._id ?? null,
    replyCount: 0,
    lastReplyAt: null,
    replierIds: [],
    attachments: fileIds.map((id) => {
      const f = files.find((x) => x._id.equals(id))!;
      return {
        id: f._id,
        name: f.name,
        size: f.size,
        contentType: f.contentType,
        width: f.width,
        height: f.height,
      };
    }),
    reactions: [],
    mentions: mentionsIn(input.text, new Set(memberIds)),
    editedAt: null,
    deletedAt: null,
    createdAt: now,
  };
  await collections.chatMessages().insertOne(message);
  if (files.length) {
    await collections
      .chatFiles()
      .updateMany({ _id: { $in: fileIds } }, { $set: { messageId: message._id } });
  }
  await collections
    .chatSpaces()
    .updateOne({ _id: space._id }, { $set: { lastMessageAt: now, updatedAt: now } });
  // Writing in a conversation means you've read it.
  await collections
    .chatMembers()
    .updateOne({ spaceId: space._id, userId: user._id }, { $set: { lastReadAt: now } });

  hub.send(memberIds, { type: 'message', message: toMessageDto(message) });
  if (root) {
    const replierIds = [user._id, ...root.replierIds.filter((id) => !id.equals(user._id))].slice(
      0,
      3,
    );
    const updatedRoot = await collections
      .chatMessages()
      .findOneAndUpdate(
        { _id: root._id },
        { $inc: { replyCount: 1 }, $set: { lastReplyAt: now, replierIds } },
        { returnDocument: 'after' },
      );
    if (updatedRoot) await broadcastMessage(updatedRoot);
  }

  // Guests who don't see it soon get an email (see alerts.ts).
  if (user.kind === 'team') {
    const guests = await collections
      .chatUsers()
      .find({
        _id: { $in: memberIds.map((id) => new ObjectId(id)) },
        kind: 'guest',
        status: 'active',
      })
      .project<{ _id: ObjectId }>({ _id: 1 })
      .toArray();
    for (const g of guests) {
      if (hub.isOnline(g._id.toHexString())) continue;
      await collections.chatEmailAlerts().updateOne(
        { _id: g._id },
        {
          $setOnInsert: {
            spaceId: space._id,
            messageId: message._id,
            authorId: user._id,
            queuedAt: now,
            dueAt: new Date(now.getTime() + env.CHAT_EMAIL_ALERT_MINUTES * 60_000),
          },
        },
        { upsert: true },
      );
    }
  }

  const dto: ChatMessageDto = toMessageDto(message);
  res.status(201).json(dto);
});

chatRouter.patch('/messages/:id', validateBody(chatEditSchema), async (req, res) => {
  const { message } = await findMessage(String(req.params.id), meId(req));
  if (!message.authorId.equals(meId(req))) {
    throw HttpError.forbidden('You can only edit your own messages.');
  }
  if (message.deletedAt) throw HttpError.badRequest('That message was deleted.');
  const text = req.body.text as string;
  const updated = await collections.chatMessages().findOneAndUpdate(
    { _id: message._id },
    {
      $set: {
        text,
        mentions: mentionsIn(text, new Set(await chatService.memberIds(message.spaceId))),
        editedAt: new Date(),
      },
    },
    { returnDocument: 'after' },
  );
  await broadcastMessage(updated!);
  res.json(toMessageDto(updated!));
});

chatRouter.delete('/messages/:id', async (req, res) => {
  const { message, member, space } = await findMessage(String(req.params.id), meId(req));
  const own = message.authorId.equals(meId(req));
  const manager = space.kind === 'space' && member.role === 'manager' && me(req).kind === 'team';
  if (!own && !manager) throw HttpError.forbidden('You can only delete your own messages.');
  const fileIds = message.attachments.map((a) => a.id);
  const updated = await collections
    .chatMessages()
    .findOneAndUpdate(
      { _id: message._id },
      { $set: { deletedAt: new Date(), text: '', attachments: [], reactions: [], mentions: [] } },
      { returnDocument: 'after' },
    );
  if (fileIds.length) {
    await collections.chatFiles().deleteMany({ _id: { $in: fileIds } });
    await chatFiles.remove(fileIds);
  }
  await broadcastMessage(updated!);
  res.status(204).end();
});

chatRouter.put('/messages/:id/reactions', validateBody(chatReactSchema), async (req, res) => {
  const { message } = await findMessage(String(req.params.id), meId(req));
  if (message.deletedAt) throw HttpError.badRequest('That message was deleted.');
  const emoji = req.body.emoji as string;
  const userId = meId(req);
  const existing = message.reactions.find((r) => r.emoji === emoji);
  let reactions = message.reactions;
  if (!existing) {
    if (reactions.length >= 20) throw HttpError.badRequest('That message has enough reactions.');
    reactions = [...reactions, { emoji, userIds: [userId] }];
  } else if (existing.userIds.some((id) => id.equals(userId))) {
    reactions = reactions
      .map((r) =>
        r.emoji === emoji ? { ...r, userIds: r.userIds.filter((id) => !id.equals(userId)) } : r,
      )
      .filter((r) => r.userIds.length);
  } else {
    reactions = reactions.map((r) =>
      r.emoji === emoji ? { ...r, userIds: [...r.userIds, userId] } : r,
    );
  }
  const updated = await collections
    .chatMessages()
    .findOneAndUpdate({ _id: message._id }, { $set: { reactions } }, { returnDocument: 'after' });
  await broadcastMessage(updated!);
  res.json(toMessageDto(updated!));
});

// --- Files ---------------------------------------------------------------------------------

chatRouter.post(
  '/spaces/:id/files',
  express.raw({ type: () => true, limit: CHAT_FILE_MAX_BYTES }),
  async (req, res) => {
    const { space } = await chatService.requireMember(String(req.params.id), meId(req));
    const data = req.body as Buffer;
    if (!Buffer.isBuffer(data) || !data.length) throw HttpError.badRequest('That file is empty.');
    const name =
      String(req.query.name ?? 'file')
        .replace(/[\\/\0\r\n"]/g, '_')
        .slice(0, 200) || 'file';
    const contentType = (req.get('content-type') ?? 'application/octet-stream')
      .split(';')[0]!
      .trim()
      .toLowerCase()
      .slice(0, 100);
    const dim = (v: unknown) => {
      const n = Number(v);
      return Number.isInteger(n) && n > 0 && n < 100_000 ? n : null;
    };
    const id = new ObjectId();
    await chatFiles.save(id, data);
    const doc = {
      _id: id,
      spaceId: space._id,
      uploaderId: meId(req),
      name,
      size: data.length,
      contentType,
      width: dim(req.query.width),
      height: dim(req.query.height),
      messageId: null,
      createdAt: new Date(),
    };
    await collections.chatFiles().insertOne(doc);
    res.status(201).json({
      id: id.toHexString(),
      name,
      size: doc.size,
      contentType,
      width: doc.width,
      height: doc.height,
    });
  },
);

chatRouter.get('/files/:id', async (req, res) => {
  const file = await collections
    .chatFiles()
    .findOne({ _id: toObjectId(String(req.params.id), 'File') });
  if (!file) throw HttpError.notFound('File not found');
  await chatService.requireMember(file.spaceId.toHexString(), meId(req));
  const inline = INLINE_TYPES.has(file.contentType) && req.query.download === undefined;
  res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
  res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader(
    'Content-Disposition',
    `${inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
  );
  res.type(inline ? file.contentType : 'application/octet-stream');
  res.sendFile(chatFiles.pathOf(file._id), { dotfiles: 'allow' }, (error) => {
    if (error && !res.headersSent) res.status(404).json({ error: { message: 'File not found' } });
  });
});

// --- Search --------------------------------------------------------------------------------

chatRouter.get('/search', async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  if (q.length < 2) {
    res.json({ messages: [] });
    return;
  }
  const mine = await collections
    .chatMembers()
    .find({ userId: meId(req) }, { projection: { spaceId: 1 } })
    .toArray();
  const pattern = q.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const docs = await collections
    .chatMessages()
    .find({
      spaceId: { $in: mine.map((m) => m.spaceId) },
      deletedAt: null,
      $or: [
        { text: { $regex: pattern, $options: 'i' } },
        { 'attachments.name': { $regex: pattern, $options: 'i' } },
      ],
    })
    .sort({ _id: -1 })
    .limit(40)
    .toArray();
  res.json({ messages: docs.map(toMessageDto) });
});

// --- Guests (the team manages them) ----------------------------------------------------------

chatRouter.get('/guests', async (req, res) => {
  requireTeam(req);
  const guests = await collections
    .chatUsers()
    .find({ kind: 'guest', status: { $ne: 'removed' } }, { projection: { avatar: 0 } })
    .sort({ name: 1 })
    .toArray();
  const memberships = await collections
    .chatMembers()
    .find({ userId: { $in: guests.map((g) => g._id) } })
    .toArray();
  const spaces = await collections
    .chatSpaces()
    .find({ _id: { $in: memberships.map((m) => m.spaceId) }, kind: 'space' })
    .toArray();
  const inviters = await collections
    .chatUsers()
    .find({ _id: { $in: guests.flatMap((g) => (g.invitedBy ? [g.invitedBy] : [])) } })
    .toArray();
  const body: ChatGuestDto[] = guests.map((g) => ({
    ...toPersonDto(g),
    invitedByName: inviters.find((i) => g.invitedBy && i._id.equals(g.invitedBy))?.name ?? null,
    spaceNames: memberships
      .filter((m) => m.userId.equals(g._id))
      .flatMap((m) => spaces.filter((s) => s._id.equals(m.spaceId)).map((s) => s.name)),
    lastSeenAt: iso(g.lastSeenAt),
  }));
  res.json(body);
});

/** A new sign-in link for a guest: for one who lost the invite or forgot their password. */
chatRouter.post('/guests/:id/link', async (req, res) => {
  requireTeam(req);
  const guest = await chatService.user(toObjectId(String(req.params.id), 'Guest'));
  if (guest.kind !== 'guest' || guest.status === 'removed') {
    throw HttpError.notFound('Guest not found');
  }
  const url = await newInvite(guest, meId(req), null);
  const emailed = await emailGuest(req, guest, {
    subject: 'Your Muvance Chat sign-in link',
    heading: guest.passwordHash ? 'Choose a new password' : 'Join Muvance Chat',
    lines: [
      `${me(req).name} sent you a link to ${guest.passwordHash ? 'choose a new password for' : 'join'} Muvance Chat. It works for 14 days.`,
    ],
    button: guest.passwordHash ? 'Choose a new password' : 'Join the conversation',
    url,
  });
  res.json({ inviteUrl: url, emailed });
});

chatRouter.delete('/guests/:id', async (req, res) => {
  requireTeam(req);
  const guest = await chatService.user(toObjectId(String(req.params.id), 'Guest'));
  if (guest.kind !== 'guest') throw HttpError.notFound('Guest not found');
  const memberships = await collections.chatMembers().find({ userId: guest._id }).toArray();
  await collections
    .chatUsers()
    .updateOne({ _id: guest._id }, { $set: { status: 'removed', updatedAt: new Date() } });
  await chatSessions.destroyAll(guest._id);
  await collections.chatInvites().deleteMany({ userId: guest._id });
  await collections.chatEmailAlerts().deleteOne({ _id: guest._id });
  for (const m of memberships) {
    const space = await collections.chatSpaces().findOne({ _id: m.spaceId });
    if (space?.kind === 'space') await removeMember(space, guest._id);
  }
  res.status(204).end();
});
