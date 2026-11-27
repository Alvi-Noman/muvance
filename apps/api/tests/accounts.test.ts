import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ObjectId } from 'mongodb';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import type { CreateUserResultDto, MeDto, TeamDto } from '@muvance/shared';
import { env } from '@/config/env';
import { collections } from '@/db/client';
import { hashPassword } from '@/lib/security';
import { sha512Crypt, verifySha512Crypt } from '@/lib/sha512-crypt';
import { accounts } from '@/modules/auth/account';
import { mailService } from '@/modules/mail/mail.service';
import { app, muvancePerson, PERSON_PASSWORD, signedIn } from './helpers';

const STARTING = 'starting-password-1';
const everything = { admin: true, mail: true, chat: true, meet: true };
const person = (username: string, role = 'member', apps = everything) => ({
  name: `${username} Person`,
  username,
  password: STARTING,
  role,
  apps,
});

/** The password hashes the mail server reads, by address. */
async function mailServerHashes() {
  const text = await readFile(path.join(env.MAIL_CONFIG_DIR, 'postfix-accounts.cf'), 'utf8');
  return Object.fromEntries(
    text
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => line.split('|{SHA512-CRYPT}') as [string, string]),
  );
}

describe('Muvance accounts', () => {
  it('adds someone with their address, mailbox and apps; one password works everywhere', async () => {
    const { agent: owner } = await signedIn('owner');
    const added = await owner.post('/api/team').send(person('Nadia'));
    expect(added.status).toBe(201);
    const { user, link } = added.body as CreateUserResultDto;
    expect(link).toBeNull();
    expect(user).toMatchObject({
      username: 'Nadia',
      email: 'nadia@muvance.com',
      address: 'nadia@muvance.com',
      mustChangePassword: true,
      apps: everything,
    });
    expect(JSON.stringify(added.body)).not.toContain(STARTING);
    // The mailbox exists, with the same password.
    expect(verifySha512Crypt(STARTING, (await mailServerHashes())['nadia@muvance.com']!)).toBe(
      true,
    );

    // Username or address, any capitals.
    for (const identifier of ['nadia', 'NADIA@muvance.com']) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ identifier, password: STARTING });
      expect(res.status).toBe(200);
    }

    const nadia = request.agent(app);
    const login = await nadia
      .post('/api/auth/login')
      .send({ identifier: 'nadia', password: STARTING });
    expect(login.body.mustChangePassword).toBe(true);
    // Nothing works until she chooses her own password: not the admin, mail or chat.
    expect((await nadia.get('/api/auth/me')).status).toBe(200);
    expect((await nadia.get('/api/leads')).status).toBe(403);
    expect((await nadia.get('/api/webmail/me')).status).toBe(403);
    expect((await nadia.get('/api/chat/me')).status).toBe(401);

    const changed = await nadia
      .post('/api/auth/change-password')
      .send({ currentPassword: STARTING, newPassword: 'her-own-password-1' });
    expect(changed.status).toBe(204);

    // The same sign-in now opens every app, and the mail server has the new password.
    expect((await nadia.get('/api/leads')).status).toBe(200);
    expect((await nadia.get('/api/team')).status).toBe(403);
    expect((await nadia.get('/api/chat/me')).body).toMatchObject({ email: 'nadia@muvance.com' });
    expect(
      verifySha512Crypt('her-own-password-1', (await mailServerHashes())['nadia@muvance.com']!),
    ).toBe(true);
    expect(
      (await request(app).post('/api/auth/login').send({ identifier: 'nadia', password: STARTING }))
        .status,
    ).toBe(401);
  });

  it('gives a link to choose a password when none was set', async () => {
    const { agent: owner } = await signedIn('owner');
    const added = await owner.post('/api/team').send({ ...person('sami'), password: undefined });
    const { link } = added.body as CreateUserResultDto;
    expect(link!.url).toMatch(/^http:\/\/localhost:5178\/set-password\?token=/);
    const token = new URL(link!.url).searchParams.get('token');

    const sami = request.agent(app);
    const set = await sami
      .post('/api/auth/accept-invite')
      .send({ token, password: 'sami-own-password' });
    expect(set.status).toBe(200);
    expect(set.body).toMatchObject({ mustChangePassword: false, address: 'sami@muvance.com' });
    expect((await sami.get('/api/leads')).status).toBe(200);
    expect(
      verifySha512Crypt('sami-own-password', (await mailServerHashes())['sami@muvance.com']!),
    ).toBe(true);
  });

  it('only lets people into the apps switched on for them', async () => {
    const { agent: owner } = await signedIn('owner');
    const { agent, me } = await muvancePerson(owner, 'rafi', {
      admin: false,
      mail: false,
      chat: true,
      meet: false,
    });
    const leads = await agent.get('/api/leads');
    expect(leads.status).toBe(403);
    expect(leads.body.error.message).toMatch(/Admin CRM/);
    expect((await agent.get('/api/webmail/me')).status).toBe(403);
    expect((await agent.post('/api/meet/rooms').send({ title: 'x' })).status).toBe(403);
    expect((await agent.get('/api/chat/me')).status).toBe(200);
    expect((await mailServerHashes())['rafi@muvance.com']).toBeUndefined();

    // Switching Mail on makes the mailbox, with the password he signed in with.
    const on = await owner.patch(`/api/team/${me.id}`).send({ apps: { ...me.apps, mail: true } });
    expect(on.status).toBe(200);
    expect(on.body.apps.mail).toBe(true);
    expect(
      verifySha512Crypt(PERSON_PASSWORD, (await mailServerHashes())['rafi@muvance.com']!),
    ).toBe(true);
    expect((await agent.get('/api/webmail/me')).status).not.toBe(403);

    // Off again: the mailbox leaves the mail server.
    await owner.patch(`/api/team/${me.id}`).send({ apps: { ...me.apps, mail: false } });
    expect((await mailServerHashes())['rafi@muvance.com']).toBeUndefined();

    // Chat off: no more chat.
    await owner.patch(`/api/team/${me.id}`).send({ apps: { ...me.apps, chat: false } });
    expect((await agent.get('/api/chat/me')).status).toBe(403);
  });

  it('disabling someone signs them out of everything, mail included', async () => {
    const { agent: owner } = await signedIn('owner');
    const { agent, me } = await muvancePerson(owner, 'tara');
    expect((await mailServerHashes())['tara@muvance.com']).toBeDefined();
    await owner.patch(`/api/team/${me.id}`).send({ status: 'disabled' });
    expect((await agent.get('/api/auth/me')).status).toBe(401);
    expect((await mailServerHashes())['tara@muvance.com']).toBeUndefined();
    const again = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'tara', password: PERSON_PASSWORD });
    expect(again.status).toBe(403);
  });

  it('follows the role rules and refuses taken or bad usernames', async () => {
    const { agent: owner } = await signedIn('owner');
    const { agent: admin } = await signedIn('admin');
    const { agent: member } = await signedIn('member');

    expect((await owner.post('/api/team').send(person('own_admin', 'admin'))).status).toBe(201);
    expect((await admin.post('/api/team').send(person('adm_member'))).status).toBe(201);
    expect((await admin.post('/api/team').send(person('adm_admin', 'admin'))).status).toBe(403);
    expect((await member.post('/api/team').send(person('mem_new'))).status).toBe(403);
    expect((await request(app).post('/api/team').send(person('anon_new'))).status).toBe(401);

    expect((await owner.post('/api/team').send(person('Rumi'))).status).toBe(201);
    const taken = await owner.post('/api/team').send(person('RUMI'));
    expect(taken.status).toBe(409);
    expect(taken.body.error.message).toMatch(/rumi@muvance.com/);
    for (const bad of [
      { ...person('short_pw'), password: 'short' },
      person('no spaces'),
      person('with@sign'),
      person('root'),
      { ...person('bad_role'), role: 'god' },
    ]) {
      expect((await owner.post('/api/team').send(bad)).status, JSON.stringify(bad)).toBe(400);
    }
  });
});

describe('Bringing older sign-ins together', () => {
  async function mailbox(localPart: string, password: string, mustChangePassword = false) {
    const now = new Date();
    const doc = {
      _id: new ObjectId(),
      localPart,
      address: `${localPart}@muvance.com`,
      name: `${localPart} Mailbox`,
      passwordHash: sha512Crypt(password),
      mustChangePassword,
      quotaGb: 10,
      createdBy: new ObjectId(),
      createdByName: 'Owner',
      createdAt: now,
      updatedAt: now,
    };
    await collections.mailAccounts().insertOne(doc);
    await mailService.sync();
    return doc;
  }

  it('makes the admin user and their mailbox one account, with whichever password they use', async () => {
    // Before: an admin user "alvi" (outside email, admin password), and alvi@muvance.com's mailbox.
    const now = new Date();
    const userId = new ObjectId();
    await collections.users().insertOne({
      _id: userId,
      name: 'Alvi',
      email: 'alvi@gmail.test',
      username: 'Alvi',
      usernameKey: 'alvi',
      passwordHash: await hashPassword('admin-password-1'),
      role: 'owner',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
    });
    await mailbox('alvi', 'mail-password-1');
    await mailbox('omar', 'omar-mail-pass', true);

    await accounts.migrate();
    await accounts.migrate(); // Safe to run again.

    const alvi = (await collections.users().findOne({ _id: userId }))!;
    expect(alvi).toMatchObject({
      email: 'alvi@muvance.com',
      contactEmail: 'alvi@gmail.test',
      apps: everything,
    });
    expect(await collections.users().countDocuments({ email: 'alvi@muvance.com' })).toBe(1);

    // Signing in with the mail password: it becomes the only password, everywhere.
    const agent = request.agent(app);
    const res = await agent
      .post('/api/auth/login')
      .send({ identifier: 'alvi', password: 'mail-password-1' });
    expect(res.status).toBe(200);
    expect((res.body as MeDto).role).toBe('owner');
    expect((await agent.get('/api/team')).status).toBe(200);
    // The old outside email still signs in.
    expect(
      (
        await request(app)
          .post('/api/auth/login')
          .send({ identifier: 'alvi@gmail.test', password: 'mail-password-1' })
      ).status,
    ).toBe(200);

    // A mailbox with nobody in the admin became an account of its own (Mail, Chat, Meet).
    const omar = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'omar@muvance.com', password: 'omar-mail-pass' });
    expect(omar.status).toBe(200);
    expect(omar.body).toMatchObject({
      apps: { admin: false, mail: true, chat: true, meet: true },
      // Still on the password an admin set for the mailbox.
      mustChangePassword: true,
    });

    const team = (await agent.get('/api/team')).body as TeamDto;
    expect(team.users.find((u) => u.address === 'omar@muvance.com')).toBeDefined();
  });

  it('gives an older account its address, merging the mailbox account', async () => {
    const { agent: owner } = await signedIn('owner');
    const now = new Date();
    const userId = new ObjectId();
    await collections.users().insertOne({
      _id: userId,
      name: 'Lina',
      email: 'lina@outside.test',
      username: null,
      usernameKey: null,
      passwordHash: await hashPassword('lina-admin-pass'),
      role: 'member',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
    });
    await mailbox('lina.k', 'lina-mail-pass');
    await accounts.migrate();
    // Different usernames: the mailbox became its own account.
    expect(await collections.users().countDocuments({ email: 'lina.k@muvance.com' })).toBe(1);

    const res = await owner
      .post(`/api/team/${userId.toHexString()}/address`)
      .send({ username: 'lina.k' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      address: 'lina.k@muvance.com',
      apps: { mail: true, chat: true },
    });
    expect(await collections.users().countDocuments({ email: 'lina.k@muvance.com' })).toBe(1);
    expect(await collections.users().countDocuments({ contactEmail: 'lina@outside.test' })).toBe(1);
  });
});
