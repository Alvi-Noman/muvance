import type { Binary, ObjectId } from 'mongodb';
import type {
  ActivityType,
  Application,
  ApplicationStatus,
  AppAccess,
  AvailabilitySettings,
  DiscoveryDto,
  LeadStage,
  LostReason,
  MeetingStatus,
  MeetingType,
  OfferDto,
  RecordingDto,
  RecordingSource,
  Role,
  UserStatus,
} from '@muvance/shared';

export interface UserDoc {
  _id: ObjectId;
  name: string;
  /** Teammates who joined by invite have an email; accounts created with a username may not. */
  email: string | null;
  /** Display form, e.g. "Alvi". */
  username: string | null;
  /** Lower-cased username, used to sign in. */
  usernameKey: string | null;
  passwordHash: string;
  /** Set when an admin chose the password; cleared once the person replaces it. */
  mustChangePassword?: boolean;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  /**
   * Muvance account: their mailbox (whose address is their `email`). The mailbox's password is
   * kept the same as the account's, so phone mail apps use it too.
   */
  mailAccountId?: ObjectId | null;
  /** The apps they may use. Older accounts without it: see `appsOf`. */
  apps?: AppAccess;
  /** The email they used before getting a Muvance address; still accepted at sign-in. */
  contactEmail?: string | null;
}

/** A phone with the Android app, which gets a push when a new lead books. */
export interface DeviceDoc {
  _id: ObjectId;
  token: string;
  userId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionDoc {
  _id: ObjectId;
  /** SHA-256 of the cookie token. The raw token is never stored. */
  tokenHash: string;
  userId: ObjectId;
  createdAt: Date;
  expiresAt: Date;
  userAgent: string;
  ip: string;
  /**
   * The account password, AES-256-GCM encrypted (WEBMAIL_SECRET): Mail opens the mailbox with it,
   * and Chat sends client emails from the person's own address.
   */
  passwordEnc?: string | null;
}

/** A one-time link: either a team invite or a password reset. */
export interface InviteDoc {
  _id: ObjectId;
  tokenHash: string;
  type: 'invite' | 'reset';
  /** For resets of username-only accounts this is the username (shown on the link page). */
  email: string;
  role: Role;
  /** For resets: the user whose password is being reset. */
  userId: ObjectId | null;
  invitedBy: ObjectId | null;
  createdAt: Date;
  expiresAt: Date;
}

export interface LeadDoc {
  _id: ObjectId;
  name: string;
  phone: string;
  /** Digits-only phone, used to match repeat bookings to the same lead. */
  phoneKey: string;
  businessName: string;
  website: string;
  monthlySales: string;
  message: string;
  stage: LeadStage;
  lostReason: LostReason | null;
  lostNote: string;
  tags: string[];
  assigneeId: ObjectId | null;
  source: 'website' | 'manual';
  /** Filled in during the discovery call (fields are added as they're known). */
  discovery: Partial<DiscoveryDto>;
  /** Decided by the team before the proposal meeting. */
  offer: Partial<OfferDto>;
  nextMeetingAt: Date | null;
  nextMeetingType: MeetingType | null;
  /** Milestones, set the first time a lead gets there. Used for conversion rates. */
  discoveryDoneAt: Date | null;
  proposalAt: Date | null;
  decidedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}

export interface MeetingDoc {
  _id: ObjectId;
  leadId: ObjectId;
  type: MeetingType;
  startsAt: Date;
  endsAt: Date;
  status: MeetingStatus;
  /** The visitor's time zone at booking time. */
  timeZone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityDoc {
  _id: ObjectId;
  leadId: ObjectId;
  type: ActivityType;
  body: string;
  meta: Record<string, string | null>;
  /** Null for system events (e.g. a booking from the website). */
  actorId: ObjectId | null;
  createdAt: Date;
}

/** A recorded website visit. Its events are stored in pieces (RecordingChunkDoc). */
export interface RecordingDoc {
  /** Made by the visitor's browser. */
  _id: string;
  visitorId: string;
  /** Which visit this is for the visitor: 1 for their first. */
  visitNumber: number;
  leadId: ObjectId | null;
  /** True for the visit in which they booked a call. */
  booked: boolean;
  startedAt: Date;
  lastEventAt: Date;
  /** Browser timestamps (ms) of the first and last recorded event. */
  firstTs?: number;
  lastTs?: number;
  durationMs: number;
  pages: string[];
  landingUrl: string;
  referrer: string;
  source: RecordingSource;
  device: RecordingDto['device'];
  chunkCount: number;
  bytes: number;
  expiresAt: Date;
}

export interface RecordingChunkDoc {
  _id: ObjectId;
  recordingId: string;
  seq: number;
  encoding: 'gzip' | 'json';
  data: Binary;
  expiresAt: Date;
}

/** A booking form someone started filling in (with a valid phone) but hadn't sent yet. */
export interface UnfinishedBookingDoc {
  _id: string;
  phoneKey: string;
  name: string;
  phone: string;
  businessName: string;
  website: string;
  monthlySales: string;
  message: string;
  startsAt: Date | null;
  timeZone: string | null;
  visitorId: string | null;
  recordingId: string | null;
  /** open: still on the list. booked: they booked after all. added: the team made it a lead. */
  status: 'open' | 'booked' | 'added';
  leadId: ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Time nobody can book (see blockedTimeInputSchema). Dates and minutes are in host time. */
export interface BlockedTimeDoc {
  _id: ObjectId;
  startDate: string;
  endDate: string;
  from: number | null;
  to: number | null;
  note: string;
  createdAt: Date;
  createdBy: ObjectId | null;
}

export interface SettingsDoc {
  _id: 'booking';
  availability: AvailabilitySettings;
  updatedAt: Date;
  updatedBy: ObjectId | null;
}

/** A form sent from the website's invest or training page (see applicationInputSchema). */
export interface ApplicationDoc {
  _id: ObjectId;
  /** The answers as sent, minus the tracking ids. */
  answers: Omit<Application, 'visitorId' | 'recordingId' | 'eventId'>;
  status: ApplicationStatus;
  visitorId: string | null;
  recordingId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** A video meeting at meet.muvance.com. The link (code) works for as long as the room exists. */
export interface MeetRoomDoc {
  _id: ObjectId;
  code: string;
  title: string | null;
  createdBy: ObjectId;
  createdByName: string;
  /** Anyone with the link joins without asking. Off: guests ask, a team member admits them. */
  quickAccess: boolean;
  createdAt: Date;
  lastJoinedAt: Date | null;
}

/** A guest asking to join a meeting. Deleted automatically a day after it was made. */
export interface MeetJoinRequestDoc {
  /** Random and unguessable: the guest's proof that this request is theirs. */
  _id: string;
  code: string;
  name: string;
  status: 'pending' | 'admitted' | 'denied';
  /** The guest's identity in the call, fixed once so a page refresh rejoins as the same person. */
  identity: string;
  createdAt: Date;
  /** The guest's page checks in every few seconds; requests nobody is waiting on are hidden. */
  lastSeenAt: Date;
  decidedAt: Date | null;
}

/** A recorded meeting. The video file lives on the server's disk (CALL_RECORDINGS_DIR). */
export interface CallRecordingDoc {
  _id: ObjectId;
  /** LiveKit Egress job that records it. */
  egressId: string;
  code: string;
  title: string | null;
  startedBy: ObjectId;
  startedByName: string;
  startedAt: Date;
  endedAt: Date | null;
  status: 'recording' | 'processing' | 'ready' | 'failed';
  /** File name in CALL_RECORDINGS_DIR, e.g. "abc-defg-hij_2026-11-21T15-04-05-000Z.mp4". */
  file: string;
  durationSec: number | null;
  sizeBytes: number | null;
  error: string | null;
  /** When the call became inactive (fewer than 2 people, or every mic off); null while active. */
  idleSince?: Date | null;
  /** Why it stopped on its own, e.g. inactivity or the length limit. */
  stopReason?: string | null;
}

/** A team mailbox, <localPart>@MAIL_DOMAIN. The source of truth for the mail server's files. */
export interface MailAccountDoc {
  _id: ObjectId;
  localPart: string;
  address: string;
  name: string;
  /** SHA512-CRYPT ("$6$..."), the scheme the mail server reads. */
  passwordHash: string;
  /** Set by an admin (new mailbox or reset): the person chooses their own at next sign-in. */
  mustChangePassword?: boolean;
  /** Profile picture, a small square image set by an admin or the person. */
  avatar?: { data: Binary; contentType: string; updatedAt: Date } | null;
  quotaGb: number;
  /** The name recipients see on mail from their own address ("Alvi from Muvance"). */
  senderName?: string;
  /** @deprecated Moved to `mailAddresses` (migrated on start). */
  aliases?: string[];
  createdBy: ObjectId;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

/** A Muvance Mail sign-in. The mail password is kept AES-256-GCM encrypted (WEBMAIL_SECRET). */
export interface WebmailSessionDoc {
  _id: ObjectId;
  tokenHash: string;
  address: string;
  passwordEnc: string;
  createdAt: Date;
  expiresAt: Date;
}

/** A Muvance Mail user's settings and the people they write to (for address suggestions). */
export interface WebmailProfileDoc {
  _id: string; // the email address
  displayName: string;
  signature: string;
  contacts: { name: string; address: string; lastUsed: Date; count: number }[];
  /** The person's own name and signature for shared addresses they send as. */
  identities?: { address: string; name: string; signature: string }[];
}

/** A shared address (hr@, accounts@): delivered to its owners, who can send as it. */
export interface MailAddressDoc {
  _id: ObjectId;
  localPart: string;
  address: string;
  displayName: string;
  /** Mailboxes (MailAccountDoc ids) that receive it and may send as it. */
  ownerIds: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

/* Muvance Chat ------------------------------------------------------------------------------ */

/**
 * Someone who can use Muvance Chat: a teammate (signs in with their @muvance.com mailbox, kept in
 * step with `mailAccounts`) or a guest (a client the team invited, with their own password).
 */
export interface ChatUserDoc {
  _id: ObjectId;
  kind: 'team' | 'guest';
  email: string;
  name: string;
  company: string | null;
  /** From before clients signed in without passwords (codes, Google, links); no longer used. */
  passwordHash: string | null;
  /** "invited": a guest who hasn't opened their link yet. "removed": no longer has access. */
  status: 'invited' | 'active' | 'removed';
  /** Guests' own picture. Teammates use their mailbox picture (`teamAvatarAt` is its version). */
  avatar?: { data: Binary; contentType: string; updatedAt: Date } | null;
  teamAvatarAt?: Date | null;
  invitedBy: ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  lastSeenAt: Date | null;
  /** Guests: when we last emailed them about unread messages. */
  emailNotifiedAt: Date | null;
  customStatus?: { emoji: string; text: string; clearAt: Date | null } | null;
  /** Notifications paused until then. */
  dndUntil?: Date | null;
}

export interface ChatSessionDoc {
  _id: ObjectId;
  tokenHash: string;
  userId: ObjectId;
  /**
   * Teammates' mailbox password, AES-256-GCM encrypted (WEBMAIL_SECRET): invites and message
   * alerts to guests are sent from their own address.
   */
  passwordEnc: string | null;
  createdAt: Date;
  expiresAt: Date;
}

/** A one-time link that lets a guest choose their password (first time, or a new one). */
export interface ChatInviteDoc {
  _id: ObjectId;
  tokenHash: string;
  userId: ObjectId;
  invitedBy: ObjectId;
  spaceId: ObjectId | null;
  createdAt: Date;
  expiresAt: Date;
}

/** A six-digit code emailed to a client to sign in to Muvance Chat (no password needed). */
export interface ChatCodeDoc {
  _id: ObjectId;
  email: string;
  codeHash: string;
  /** Wrong guesses so far; the code stops working after a few. */
  attempts: number;
  createdAt: Date;
  expiresAt: Date;
}

/** A group conversation ("space") or a direct message between two people. */
export interface ChatSpaceDoc {
  _id: ObjectId;
  kind: 'space' | 'dm';
  name: string;
  description: string;
  discoverable: boolean;
  /** Direct messages: the two people's ids, sorted and joined, so each pair has one. */
  dmKey: string | null;
  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date | null;
}

export interface ChatMemberDoc {
  _id: ObjectId;
  spaceId: ObjectId;
  userId: ObjectId;
  role: 'manager' | 'member';
  lastReadAt: Date | null;
  muted: boolean;
  joinedAt: Date;
}

export interface ChatMessageDoc {
  _id: ObjectId;
  spaceId: ObjectId;
  authorId: ObjectId;
  text: string;
  threadId: ObjectId | null;
  replyCount: number;
  lastReplyAt: Date | null;
  replierIds: ObjectId[];
  attachments: {
    id: ObjectId;
    name: string;
    size: number;
    contentType: string;
    width: number | null;
    height: number | null;
    durationMs?: number | null;
    voice?: boolean;
    waveform?: number[] | null;
  }[];
  reactions: { emoji: string; userIds: ObjectId[] }[];
  /** People mentioned by id, plus "all" for <@all>. */
  mentions: string[];
  editedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  /** A snapshot of the message this one quotes. */
  quote?: { id: ObjectId; authorId: ObjectId; text: string; attachment: string | null } | null;
  forwarded?: boolean;
  pinnedAt?: Date | null;
  pinnedBy?: ObjectId | null;
  linkPreview?: {
    url: string;
    title: string;
    description: string | null;
    image: string | null;
    siteName: string | null;
  } | null;
}

/** A file shared in chat, stored on disk at CHAT_FILES_DIR/<id>. */
export interface ChatFileDoc {
  _id: ObjectId;
  spaceId: ObjectId;
  uploaderId: ObjectId;
  name: string;
  size: number;
  contentType: string;
  width: number | null;
  height: number | null;
  durationMs?: number | null;
  voice?: boolean;
  waveform?: number[] | null;
  /** Set when it's sent in a message; files never sent are deleted after a day. */
  messageId: ObjectId | null;
  createdAt: Date;
}

/** A guest to email about unread messages, if they still haven't read them by `dueAt`. */
export interface ChatEmailAlertDoc {
  _id: ObjectId; // the guest's id
  spaceId: ObjectId;
  messageId: ObjectId;
  authorId: ObjectId;
  queuedAt: Date;
  dueAt: Date;
}

/** A message someone saved for later (one per person and message). */
export interface ChatSavedDoc {
  _id: ObjectId;
  userId: ObjectId;
  messageId: ObjectId;
  spaceId: ObjectId;
  createdAt: Date;
}

/** A browser (or the Android app) that receives push notifications for someone. */
export interface ChatPushSubscriptionDoc {
  _id: ObjectId;
  userId: ObjectId;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  createdAt: Date;
  updatedAt: Date;
}

/** A link's preview, kept for a week so the same link isn't fetched again and again. */
export interface ChatLinkPreviewCacheDoc {
  _id: string; // the URL
  preview: {
    url: string;
    title: string;
    description: string | null;
    image: string | null;
    siteName: string | null;
  } | null;
  fetchedAt: Date;
}

/** Settings chat makes for itself, such as its push notification keys. */
export interface ChatConfigDoc {
  _id: string;
  value: Record<string, string>;
  createdAt: Date;
}
