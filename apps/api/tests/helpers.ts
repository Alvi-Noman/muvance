import { ObjectId } from 'mongodb';
import request from 'supertest';
import type { Availability, Role } from '@muvance/shared';
import { createApp } from '@/app';
import { collections } from '@/db/client';
import { hashPassword } from '@/lib/security';

export const app = createApp();
export const PASSWORD = 'correct-horse-battery';

/** Creates a user directly in the database. */
export async function createUser(
  role: Role,
  overrides: { email?: string | null; username?: string; status?: 'active' | 'disabled' } = {},
) {
  const now = new Date();
  const user = {
    _id: new ObjectId(),
    name: `${role} user`,
    email:
      overrides.email !== undefined
        ? overrides.email
        : `${role}-${new ObjectId().toHexString()}@test.dev`,
    username: overrides.username ?? null,
    usernameKey: overrides.username?.toLowerCase() ?? null,
    passwordHash: await hashPassword(PASSWORD),
    role,
    status: overrides.status ?? ('active' as const),
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  };
  await collections.users().insertOne(user);
  return user;
}

/** A supertest agent signed in as a new user with `role` (cookies persist across requests). */
export async function signedIn(role: Role) {
  const user = await createUser(role);
  const agent = request.agent(app);
  const res = await agent
    .post('/api/auth/login')
    .send({ identifier: user.email, password: PASSWORD });
  if (res.status !== 200)
    throw new Error(`Login failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { agent, user };
}

export const bookingDetails = {
  name: 'Sam Rahman',
  phone: '+880 1712-345678',
  businessName: 'Brand Co',
  website: 'brand.com',
  monthlySales: '50 lac taka',
  timeZone: 'Asia/Dhaka',
};

export async function openSlots() {
  return ((await request(app).get('/api/availability')).body as Availability).slots;
}
