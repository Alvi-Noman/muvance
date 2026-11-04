import { MongoClient, type Db } from 'mongodb';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import type {
  ActivityDoc,
  InviteDoc,
  LeadDoc,
  MeetingDoc,
  SessionDoc,
  SettingsDoc,
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
  invites: () => getDb().collection<InviteDoc>('invites'),
  leads: () => getDb().collection<LeadDoc>('leads'),
  meetings: () => getDb().collection<MeetingDoc>('meetings'),
  activities: () => getDb().collection<ActivityDoc>('activities'),
  settings: () => getDb().collection<SettingsDoc>('settings'),
};

/** Brings data from earlier versions up to date. Safe to run on every start. */
async function migrate(database: Db) {
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
    database.collection('sessions').createIndex({ tokenHash: 1 }, { unique: true }),
    // MongoDB deletes expired sessions and invites automatically.
    database.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database.collection('sessions').createIndex({ userId: 1 }),
    database.collection('invites').createIndex({ tokenHash: 1 }, { unique: true }),
    database.collection('invites').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database.collection('leads').createIndex({ phoneKey: 1 }),
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
