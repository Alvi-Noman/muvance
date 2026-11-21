import type { Binary, ObjectId } from 'mongodb';
import type {
  ActivityType,
  Application,
  ApplicationStatus,
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
