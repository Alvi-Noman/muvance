import { ObjectId } from 'mongodb';
import { logger } from '@/lib/logger';
import { hashPassword } from '@/lib/security';
import { collections } from './client';

export const DEV_OWNER = { email: 'owner@muvance.local', password: 'muvance-dev-password' };

/**
 * Development only (in-memory database): creates a known Owner account so you can sign in
 * to the admin straight away after every restart.
 */
export async function seedDevOwner() {
  if (await collections.users().countDocuments()) return;
  const now = new Date();
  await collections.users().insertOne({
    _id: new ObjectId(),
    name: 'Dev Owner',
    email: DEV_OWNER.email,
    username: null,
    usernameKey: null,
    passwordHash: await hashPassword(DEV_OWNER.password),
    role: 'owner',
    status: 'active',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  });
  logger.warn(`Dev owner account: ${DEV_OWNER.email} / ${DEV_OWNER.password}`);
}
