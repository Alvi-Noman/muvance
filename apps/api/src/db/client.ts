import { MongoClient, type Db } from 'mongodb';
import { suggestAddressName } from '@muvance/shared';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import type {
  ActivityDoc,
  ApplicationDoc,
  CallRecordingDoc,
  ChatEmailAlertDoc,
  ChatFileDoc,
  ChatInviteDoc,
  ChatMemberDoc,
  ChatMessageDoc,
  ChatSessionDoc,
  ChatSpaceDoc,
  ChatUserDoc,
  MailAccountDoc,
  MailAddressDoc,
  WebmailProfileDoc,
  WebmailSessionDoc,
  BlockedTimeDoc,
  DeviceDoc,
  InviteDoc,
  LeadDoc,
  MeetingDoc,
  MeetJoinRequestDoc,
  MeetRoomDoc,
  RecordingChunkDoc,
  RecordingDoc,
  SessionDoc,
  SettingsDoc,
  UnfinishedBookingDoc,
  UserDoc,
} from './types';

let client: MongoClient | undefined;
let db: Db | undefined;
let memoryServer: { stop: () => Promise<boolean> } | undefined;

/** Connects to MongoDB (once) and makes sure indexes exist. */
export async function connectDb(uri = env.MONGODB_URI) {
  if (db) return db;

  let connectionUri = uri;
  if (uri === 'memory') {
    // Development convenience: a throwaway database that needs no install. Data is lost on restart.
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const server = await MongoMemoryServer.create();
    memoryServer = server;
    connectionUri = server.getUri();
    logger.warn('Using an in-memory MongoDB. Data will be lost when the API stops.');
  }

  client = new MongoClient(connectionUri, { serverSelectionTimeoutMS: 10_000 });
  await client.connect();
  db = client.db(env.MONGODB_DB);
  await ensureIndexes(db);
  logger.info({ db: env.MONGODB_DB }, 'Connected to MongoDB');
  return db;
}

export async function closeDb() {
  await client?.close();
  await memoryServer?.stop();
  client = undefined;
  db = undefined;
  memoryServer = undefined;
}

export function getDb() {
  if (!db) throw new Error('Database not connected. Call connectDb() first.');
  return db;
}

export async function pingDb() {
  await getDb().command({ ping: 1 });
}

/** Typed collection accessors. */
export const collections = {
  users: () => getDb().collection<UserDoc>('users'),
  sessions: () => getDb().collection<SessionDoc>('sessions'),
  devices: () => getDb().collection<DeviceDoc>('devices'),
  invites: () => getDb().collection<InviteDoc>('invites'),
  leads: () => getDb().collection<LeadDoc>('leads'),
  meetings: () => getDb().collection<MeetingDoc>('meetings'),
  activities: () => getDb().collection<ActivityDoc>('activities'),
  settings: () => getDb().collection<SettingsDoc>('settings'),
  blockedTimes: () => getDb().collection<BlockedTimeDoc>('blockedTimes'),
  recordings: () => getDb().collection<RecordingDoc>('recordings'),
  recordingChunks: () => getDb().collection<RecordingChunkDoc>('recordingChunks'),
  unfinishedBookings: () => getDb().collection<UnfinishedBookingDoc>('unfinishedBookings'),
  applications: () => getDb().collection<ApplicationDoc>('applications'),
  meetRooms: () => getDb().collection<MeetRoomDoc>('meetRooms'),
  meetJoinRequests: () => getDb().collection<MeetJoinRequestDoc>('meetJoinRequests'),
  callRecordings: () => getDb().collection<CallRecordingDoc>('callRecordings'),
  mailAccounts: () => getDb().collection<MailAccountDoc>('mailAccounts'),
  mailAddresses: () => getDb().collection<MailAddressDoc>('mailAddresses'),
  webmailSessions: () => getDb().collection<WebmailSessionDoc>('webmailSessions'),
  webmailProfiles: () => getDb().collection<WebmailProfileDoc>('webmailProfiles'),
  chatUsers: () => getDb().collection<ChatUserDoc>('chatUsers'),
  chatSessions: () => getDb().collection<ChatSessionDoc>('chatSessions'),
  chatInvites: () => getDb().collection<ChatInviteDoc>('chatInvites'),
  chatSpaces: () => getDb().collection<ChatSpaceDoc>('chatSpaces'),
  chatMembers: () => getDb().collection<ChatMemberDoc>('chatMembers'),
  chatMessages: () => getDb().collection<ChatMessageDoc>('chatMessages'),
  chatFiles: () => getDb().collection<ChatFileDoc>('chatFiles'),
  chatEmailAlerts: () => getDb().collection<ChatEmailAlertDoc>('chatEmailAlerts'),
};

/** Brings data from earlier versions up to date. Safe to run on every start. */
export async function migrate(database: Db) {
  const leads = database.collection('leads');
  const renamed: Record<string, string> = {
    new: 'discovery_booked',
    contacted: 'discovery_done',
    qualified: 'team_review',
    proposal: 'proposal_booked',
  };
  for (const [from, to] of Object.entries(renamed)) {
    await leads.updateMany({ stage: from }, { $set: { stage: to } });
  }
  await leads.updateMany(
    { stage: 'lost', lostReason: { $exists: false } },
    { $set: { lostReason: 'other' } },
  );
  await database
    .collection('meetings')
    .updateMany({ type: { $exists: false } }, { $set: { type: 'discovery' } });

  // Discovery: "Main products" text became a product list with prices; margin was dropped
  // (it's worked out per product from the purchasing and selling price instead).
  const textProducts = await leads
    .find({ 'discovery.products': { $type: 'string' } }, { projection: { discovery: 1 } })
    .toArray();
  for (const lead of textProducts) {
    const name = String(lead.discovery.products).trim();
    await leads.updateOne(
      { _id: lead._id },
      {
        $set: {
          'discovery.products': name ? [{ name, purchasePrice: null, sellingPrice: null }] : [],
        },
      },
    );
  }
  await leads.updateMany(
    { 'discovery.marginPercent': { $exists: true } },
    { $unset: { 'discovery.marginPercent': '' } },
  );
  // ROAS is now calculated from ad spend and delivered sales, not typed in.
  await leads.updateMany(
    { 'discovery.roas': { $exists: true } },
    { $unset: { 'discovery.roas': '' } },
  );

  // Booking hours: one set of hours for all working days became separate hours per weekday.
  const settings = database.collection<{ _id: string; availability: object }>('settings');
  const oldHours = await settings.findOne({
    _id: 'booking',
    'availability.workingDays': { $exists: true },
  });
  if (oldHours) {
    const { workingDays, firstStartHour, lastStartHour, ...rest } = oldHours.availability as {
      workingDays: number[];
      firstStartHour: number;
      lastStartHour: number;
    };
    const weekly = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
      open: workingDays.includes(day),
      firstStart: firstStartHour * 60,
      lastStart: lastStartHour * 60,
    }));
    await settings.updateOne({ _id: 'booking' }, { $set: { availability: { ...rest, weekly } } });
  }

  // Mail: each mailbox's extra addresses (aliases) became shared addresses of their own.
  const withAliases = await database
    .collection('mailAccounts')
    .find({ aliases: { $exists: true } })
    .toArray();
  for (const account of withAliases) {
    for (const localPart of (account.aliases as string[] | undefined) ?? []) {
      const domain = String(account.address).split('@')[1];
      await database.collection('mailAddresses').updateOne(
        { localPart },
        {
          $setOnInsert: {
            localPart,
            address: `${localPart}@${domain}`,
            displayName: suggestAddressName(localPart),
            createdAt: new Date(),
          },
          $addToSet: { ownerIds: account._id },
          $set: { updatedAt: new Date() },
        },
        { upsert: true },
      );
    }
    await database
      .collection('mailAccounts')
      .updateOne({ _id: account._id }, { $unset: { aliases: '' } });
  }
  if (
    await database
      .collection('mailAccounts')
      .indexExists('aliases_1')
      .catch(() => false)
  ) {
    await database.collection('mailAccounts').dropIndex('aliases_1');
  }

  // Usernames: the old full unique index on email is replaced by a partial one.
  const users = database.collection('users');
  await users.updateMany(
    { username: { $exists: false } },
    { $set: { username: null, usernameKey: null } },
  );
  if (await users.indexExists('email_1').catch(() => false)) await users.dropIndex('email_1');
}

async function ensureIndexes(database: Db) {
  await migrate(database);
  await Promise.all([
    // Partial, so several username-only accounts (email: null) can exist.
    database.collection('users').createIndex(
      { email: 1 },
      {
        unique: true,
        partialFilterExpression: { email: { $type: 'string' } },
        name: 'email_unique',
      },
    ),
    database.collection('users').createIndex(
      { usernameKey: 1 },
      {
        unique: true,
        partialFilterExpression: { usernameKey: { $type: 'string' } },
        name: 'username_unique',
      },
    ),
    database.collection('devices').createIndex({ token: 1 }, { unique: true }),
    database.collection('devices').createIndex({ userId: 1 }),
    database.collection('sessions').createIndex({ tokenHash: 1 }, { unique: true }),
    // MongoDB deletes expired sessions and invites automatically.
    database.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database.collection('sessions').createIndex({ userId: 1 }),
    database.collection('invites').createIndex({ tokenHash: 1 }, { unique: true }),
    database.collection('invites').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database.collection('leads').createIndex({ phoneKey: 1 }),
    database.collection('blockedTimes').createIndex({ endDate: 1 }),
    database.collection('recordings').createIndex({ startedAt: -1 }),
    database.collection('recordings').createIndex({ visitorId: 1 }),
    database.collection('recordings').createIndex({ leadId: 1 }),
    database.collection('recordings').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database.collection('recordingChunks').createIndex({ recordingId: 1, seq: 1 }),
    database.collection('unfinishedBookings').createIndex({ status: 1, updatedAt: -1 }),
    database.collection('unfinishedBookings').createIndex({ phoneKey: 1 }),
    database.collection('applications').createIndex({ createdAt: -1 }),
    database.collection('meetRooms').createIndex({ code: 1 }, { unique: true }),
    database.collection('meetRooms').createIndex({ createdBy: 1, createdAt: -1 }),
    database.collection('meetJoinRequests').createIndex({ code: 1, status: 1 }),
    database.collection('callRecordings').createIndex({ startedAt: -1 }),
    database.collection('callRecordings').createIndex({ egressId: 1 }, { unique: true }),
    database.collection('callRecordings').createIndex({ code: 1, status: 1 }),
    database.collection('mailAccounts').createIndex({ localPart: 1 }, { unique: true }),
    database.collection('mailAddresses').createIndex({ localPart: 1 }, { unique: true }),
    database.collection('mailAddresses').createIndex({ ownerIds: 1 }),
    database.collection('webmailSessions').createIndex({ tokenHash: 1 }, { unique: true }),
    database.collection('webmailSessions').createIndex({ address: 1 }),
    database.collection('webmailSessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database
      .collection('meetJoinRequests')
      .createIndex({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 }),
    // Muvance Chat
    database.collection('chatUsers').createIndex({ email: 1 }, { unique: true }),
    database.collection('chatSessions').createIndex({ tokenHash: 1 }, { unique: true }),
    database.collection('chatSessions').createIndex({ userId: 1 }),
    database.collection('chatSessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database.collection('chatInvites').createIndex({ tokenHash: 1 }, { unique: true }),
    database.collection('chatInvites').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database
      .collection('chatSpaces')
      .createIndex(
        { dmKey: 1 },
        { unique: true, partialFilterExpression: { dmKey: { $type: 'string' } }, name: 'one_dm' },
      ),
    database.collection('chatMembers').createIndex({ spaceId: 1, userId: 1 }, { unique: true }),
    database.collection('chatMembers').createIndex({ userId: 1 }),
    database.collection('chatMessages').createIndex({ spaceId: 1, threadId: 1, createdAt: -1 }),
    database.collection('chatMessages').createIndex({ spaceId: 1, createdAt: -1 }),
    database.collection('chatMessages').createIndex({ threadId: 1, createdAt: 1 }),
    database.collection('chatFiles').createIndex({ messageId: 1, createdAt: 1 }),
    database.collection('chatFiles').createIndex({ spaceId: 1 }),
    database.collection('chatEmailAlerts').createIndex({ dueAt: 1 }),
    database.collection('recordingChunks').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database.collection('leads').createIndex({ stage: 1, createdAt: -1 }),
    database.collection('leads').createIndex({ assigneeId: 1 }),
    database.collection('leads').createIndex({ followUpAt: 1 }),
    // Only one *scheduled* call per time slot: this is what makes double-booking impossible.
    database.collection('meetings').createIndex(
      { startsAt: 1 },
      {
        unique: true,
        partialFilterExpression: { status: 'scheduled' },
        name: 'one_call_per_slot',
      },
    ),
    database.collection('meetings').createIndex({ leadId: 1, startsAt: -1 }),
    database.collection('activities').createIndex({ leadId: 1, createdAt: -1 }),
    database.collection('activities').createIndex({ createdAt: -1 }),
  ]);
}

/** True for MongoDB duplicate-key errors (unique index violations). */
export function isDuplicateKeyError(error: unknown) {
  return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
}
