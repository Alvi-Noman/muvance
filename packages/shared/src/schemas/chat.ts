import { z } from 'zod';

/** Muvance Chat (chat.muvance.com): what the chat app and the API exchange. */

export const CHAT_MESSAGE_MAX = 8000;
export const CHAT_FILE_MAX_BYTES = 25 * 1024 * 1024;
export const CHAT_ATTACHMENTS_MAX = 10;

/** "team": a @muvance.com mailbox. "guest": a client invited by the team. */
export type ChatUserKind = 'team' | 'guest';

export const chatLoginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Enter your email address').max(200),
  password: z.string().min(1, 'Enter your password').max(200),
});

export const chatPasswordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(200, 'That password is too long');

export const chatAcceptInviteSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80),
  password: chatPasswordSchema,
});

export const chatProfileSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(80).optional(),
  company: z.string().trim().max(80).optional(),
});

export const chatChangePasswordSchema = z.object({
  current: z.string().min(1, 'Enter your current password').max(200),
  next: chatPasswordSchema,
});

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const chatCreateSpaceSchema = z.object({
  name: z.string().trim().min(1, 'Name the space').max(80),
  description: z.string().trim().max(300).default(''),
  /** Anyone on the team can find and join it. Guests never can. */
  discoverable: z.boolean().default(true),
  memberIds: z.array(objectId).max(200).default([]),
});

export const chatUpdateSpaceSchema = z.object({
  name: z.string().trim().min(1, 'Name the space').max(80).optional(),
  description: z.string().trim().max(300).optional(),
  discoverable: z.boolean().optional(),
});

export const chatStartDmSchema = z.object({ userId: objectId });

export const chatAddMembersSchema = z.object({ userIds: z.array(objectId).min(1).max(200) });

export const chatInviteGuestSchema = z.object({
  email: z.string().trim().toLowerCase().max(200).pipe(z.email('Enter a valid email address')),
  name: z.string().trim().max(80).default(''),
});

export const chatMemberRoleSchema = z.object({ role: z.enum(['manager', 'member']) });

export const chatMuteSchema = z.object({ muted: z.boolean() });

export const chatSendSchema = z
  .object({
    text: z.string().max(CHAT_MESSAGE_MAX, 'That message is too long').default(''),
    threadId: objectId.nullable().default(null),
    attachmentIds: z.array(objectId).max(CHAT_ATTACHMENTS_MAX).default([]),
  })
  .refine((m) => m.text.trim() || m.attachmentIds.length, { message: 'Write a message' });

export const chatEditSchema = z.object({
  text: z.string().trim().min(1, 'Write a message').max(CHAT_MESSAGE_MAX),
});

export const chatReactSchema = z.object({ emoji: z.string().min(1).max(16) });

export const chatTypingSchema = z.object({ threadId: objectId.nullable().default(null) });

export interface ChatPersonDto {
  id: string;
  kind: ChatUserKind;
  name: string;
  email: string;
  /** Guests only: their company, shown next to their name. */
  company: string | null;
  avatarUrl: string | null;
  online: boolean;
  /** Guests who haven't opened their invite yet are "invited". */
  status: 'invited' | 'active' | 'removed';
}

export interface ChatMeDto extends ChatPersonDto {
  /** Team members can create spaces, invite guests and manage them. */
  canManage: boolean;
}

export interface ChatMemberDto {
  userId: string;
  role: 'manager' | 'member';
  lastReadAt: string | null;
}

export interface ChatSpaceDto {
  id: string;
  kind: 'space' | 'dm';
  /** For direct messages: empty (the app shows the other person's name). */
  name: string;
  description: string;
  discoverable: boolean;
  members: ChatMemberDto[];
  /** For you: messages from others you haven't read, and whether one mentions you. */
  unread: number;
  mentioned: boolean;
  muted: boolean;
  lastMessageAt: string | null;
  lastMessage: { authorId: string; text: string } | null;
  createdAt: string;
}

export interface ChatAttachmentDto {
  id: string;
  name: string;
  size: number;
  contentType: string;
  width: number | null;
  height: number | null;
}

export interface ChatReactionDto {
  emoji: string;
  userIds: string[];
}

export interface ChatMessageDto {
  id: string;
  spaceId: string;
  authorId: string;
  /** Mentions are written as <@userId>, or <@all> for everyone. */
  text: string;
  /** Replies point at the message they reply to; null for a message in the main conversation. */
  threadId: string | null;
  replyCount: number;
  lastReplyAt: string | null;
  /** Up to three people who replied, newest first. */
  replierIds: string[];
  attachments: ChatAttachmentDto[];
  reactions: ChatReactionDto[];
  editedAt: string | null;
  deleted: boolean;
  createdAt: string;
}

export interface ChatBootstrapDto {
  me: ChatMeDto;
  spaces: ChatSpaceDto[];
  /** Everyone in your spaces (and, for the team, every teammate). */
  people: ChatPersonDto[];
}

export interface ChatMessagePage {
  messages: ChatMessageDto[];
  /** More, older messages exist. */
  hasMore: boolean;
}

export interface ChatThreadDto {
  root: ChatMessageDto;
  replies: ChatMessageDto[];
}

export interface ChatBrowseSpaceDto {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

export interface ChatInviteInfoDto {
  email: string;
  name: string;
  invitedBy: string;
  spaceName: string | null;
  /** They already have a password: the link sets a new one. */
  existing: boolean;
}

export interface ChatInviteResultDto {
  person: ChatPersonDto;
  /** A sign-in link for the guest, to send another way if the email doesn't arrive. */
  inviteUrl: string | null;
  emailed: boolean;
}

export interface ChatSearchResultDto {
  messages: ChatMessageDto[];
}

export interface ChatGuestDto extends ChatPersonDto {
  invitedByName: string | null;
  spaceNames: string[];
  lastSeenAt: string | null;
}

/** Live updates, sent to the app over /api/chat/events. */
export type ChatEvent =
  | { type: 'message'; message: ChatMessageDto }
  | { type: 'spaces' }
  | { type: 'space-removed'; spaceId: string }
  | { type: 'typing'; spaceId: string; threadId: string | null; userId: string }
  | { type: 'presence'; userId: string; online: boolean }
  | { type: 'read'; spaceId: string; userId: string; lastReadAt: string }
  | { type: 'person'; person: ChatPersonDto };

/** The mention token for a person, as stored in message text. */
export const chatMention = (userId: string) => `<@${userId}>`;
export const CHAT_MENTION_ALL = '<@all>';
