import { ObjectId } from 'mongodb';
import request from 'supertest';
import type { AppAccess, Availability, MeDto, Role } from '@muvance/shared';
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

export const PERSON_PASSWORD = 'person-password-1';

/**
 * Adds someone to Muvance through the People page (as `owner`), past their starting password, and
 * signs them in. By default they have Mail, Chat and Meet but not the Admin CRM.
 */
export async function muvancePerson(
  owner: request.Agent,
  username: string,
  apps: AppAccess = { admin: false, mail: true, chat: true, meet: true },
  role: Role = 'member',
) {
  const res = await owner.post('/api/team').send({
    name: `${username[0]!.toUpperCase()}${username.slice(1)} Khan`,
    username,
    password: PERSON_PASSWORD,
    role,
    apps,
  });
  if (res.status !== 201) throw new Error(`Add failed: ${res.status} ${JSON.stringify(res.body)}`);
  await collections
    .users()
    .updateOne(
      { _id: new ObjectId(res.body.user.id as string) },
      { $set: { mustChangePassword: false } },
    );
  const agent = request.agent(app);
  const login = await agent
    .post('/api/auth/login')
    .send({ identifier: username, password: PERSON_PASSWORD });
  if (login.status !== 200) throw new Error(`Login failed: ${login.status}`);
  return { agent, me: login.body as MeDto };
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
