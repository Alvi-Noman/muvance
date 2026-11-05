import type { ObjectId } from 'mongodb';
import type {
  ActivityType,
  AvailabilitySettings,
  DiscoveryDto,
  LeadStage,
  LostReason,
  MeetingStatus,
  MeetingType,
  OfferDto,
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

export interface SettingsDoc {
  _id: 'booking';
  availability: AvailabilitySettings;
  updatedAt: Date;
  updatedBy: ObjectId | null;
}
