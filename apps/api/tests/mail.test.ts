import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ObjectId } from 'mongodb';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import type { MailAccountsDto } from '@muvance/shared';
import { env } from '@/config/env';
import { collections, getDb, migrate } from '@/db/client';
import { verifySha512Crypt } from '@/lib/sha512-crypt';
import { app, signedIn } from './helpers';

const file = (name: string) => readFile(path.join(env.MAIL_CONFIG_DIR, name), 'utf8');
const accountsFile = async () =>
  Object.fromEntries(
    (await file('postfix-accounts.cf'))
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => line.split('|{SHA512-CRYPT}') as [string, string]),
  );

type Agent = Awaited<ReturnType<typeof signedIn>>['agent'];

/** Adds a person with Mail (People page) and returns their mailbox's id and account id. */
async function personWithMail(agent: Agent, username: string, password = 'a-long-password-1') {
  const res = await agent.post('/api/team').send({
    name: `${username} Person`,
    username,
    password,
    role: 'member',
    apps: { admin: false, mail: true, chat: true, meet: true },
  });
  expect(res.status).toBe(201);
  const userId = res.body.user.id as string;
  const user = await collections.users().findOne({ _id: new ObjectId(userId) });
  return { id: user!.mailAccountId!.toHexString(), userId };
}

describe('team email accounts', () => {
  it('only owners and admins manage email accounts', async () => {
    const member = await signedIn('member');
    expect((await member.agent.get('/api/mail-accounts')).status).toBe(403);
    expect((await request(app).get('/api/mail-accounts')).status).toBe(401);
  });

  it('makes mailboxes the mail server can read, with quotas and a sender name', async () => {
    const { agent } = await signedIn('admin');
    const { id } = await personWithMail(agent, 'Nadia.K');
    const updated = await agent
      .patch(`/api/mail-accounts/${id}`)
      .send({ quotaGb: 5, senderName: 'Nadia from Muvance' });
    expect(updated.body).toMatchObject({
      address: 'nadia.k@muvance.com',
      senderName: 'Nadia from Muvance',
    });

    const hashes = await accountsFile();
    expect(verifySha512Crypt('a-long-password-1', hashes['nadia.k@muvance.com']!)).toBe(true);
    // Role addresses go to the first mailbox.
    expect(await file('postfix-virtual.cf')).toMatch(/postmaster@muvance.com \S+@muvance.com/);
    expect(await file('dovecot-quotas.cf')).toContain('nadia.k@muvance.com:5G');
    expect(Number(await file('mailbox-count'))).toBeGreaterThan(0);

    const list = (await agent.get('/api/mail-accounts')).body as MailAccountsDto;
    expect(list.webmailUrl).toBe('https://mail.muvance.com');
    expect(list.accounts.map((a) => a.address)).toContain('nadia.k@muvance.com');
  });

  it('mailboxes only come from People: no separate mailbox or password routes', async () => {
    const { agent } = await signedIn('owner');
    const { id } = await personWithMail(agent, 'solo');
    expect(
      (
        await agent
          .post('/api/mail-accounts')
          .send({ localPart: 'loose', name: 'X', password: 'a-long-password-1' })
      ).status,
    ).toBe(404);
    expect(
      (await agent.post(`/api/mail-accounts/${id}/password`).send({ password: 'x-long-pass-1' }))
        .status,
    ).toBe(404);
  });

  it('keeps every address unique', async () => {
    const { agent } = await signedIn('owner');
    const rafi = await personWithMail(agent, 'rafi');
    await agent
      .post('/api/mail-addresses')
      .send({ localPart: 'hello', displayName: 'Muvance', ownerIds: [rafi.id] });
    const taken = await agent.post('/api/team').send({
      name: 'X',
      username: 'hello',
      password: 'a-long-password-1',
      role: 'member',
      apps: { admin: false, mail: true, chat: true, meet: true },
    });
    expect(taken.status).toBe(409);
  });

  it('switching Mail off removes the mailbox from the mail server', async () => {
    const { agent } = await signedIn('admin');
    const { userId } = await personWithMail(agent, 'temp');
    expect(await accountsFile()).toHaveProperty(['temp@muvance.com']);
    await agent
      .patch(`/api/team/${userId}`)
      .send({ apps: { admin: false, mail: false, chat: true, meet: true } });
    expect(await accountsFile()).not.toHaveProperty(['temp@muvance.com']);
  });

  it('shared addresses go to one or more people, and stay unique', async () => {
    const { agent } = await signedIn('admin');
    const ana = await personWithMail(agent, 'ana');
    const ben = await personWithMail(agent, 'ben');

    const hr = await agent
      .post('/api/mail-addresses')
      .send({ localPart: 'hr', displayName: 'Muvance HR', ownerIds: [ana.id, ben.id] });
    expect(hr.status).toBe(201);
    expect(await file('postfix-virtual.cf')).toContain(
      'hr@muvance.com ana@muvance.com,ben@muvance.com',
    );

    // A name used by a mailbox or another address is taken.
    expect(
      (
        await agent
          .post('/api/mail-addresses')
          .send({ localPart: 'ana', displayName: 'X', ownerIds: [ben.id] })
      ).status,
    ).toBe(409);
    expect(
      (
        await agent
          .post('/api/mail-addresses')
          .send({ localPart: 'hr', displayName: 'X', ownerIds: [ben.id] })
      ).status,
    ).toBe(409);
    // Nobody to receive it isn't allowed.
    expect(
      (
        await agent
          .post('/api/mail-addresses')
          .send({ localPart: 'ops', displayName: 'X', ownerIds: [] })
      ).status,
    ).toBe(400);

    // Moving it to just Ben.
    await agent
      .patch(`/api/mail-addresses/${hr.body.id}`)
      .send({ ownerIds: [ben.id], displayName: 'Muvance People' });
    const list = (await agent.get('/api/mail-accounts')).body as MailAccountsDto;
    const hrDto = list.addresses.find((a) => a.localPart === 'hr')!;
    expect(hrDto.displayName).toBe('Muvance People');
    expect(hrDto.owners.map((o) => o.address)).toEqual(['ben@muvance.com']);
    expect(list.accounts.find((a) => a.id === ben.id)?.addresses).toEqual(['hr@muvance.com']);

    // Ben losing his mailbox leaves hr@ with nobody, so the mail server stops accepting it.
    await agent
      .patch(`/api/team/${ben.userId}`)
      .send({ apps: { admin: false, mail: false, chat: true, meet: true } });
    expect(await file('postfix-virtual.cf')).not.toContain('hr@muvance.com');

    const member = await signedIn('member');
    expect(
      (
        await member.agent
          .post('/api/mail-addresses')
          .send({ localPart: 'x', displayName: 'X', ownerIds: [ana.id] })
      ).status,
    ).toBe(403);
  });

  it('turns old per-mailbox extra addresses into shared addresses', async () => {
    const { agent } = await signedIn('admin');
    const { id } = await personWithMail(agent, 'olda');
    // How a mailbox looked before shared addresses existed.
    await collections
      .mailAccounts()
      .updateOne({ _id: new ObjectId(id) }, { $set: { aliases: ['billing'] } });

    await migrate(getDb());

    const address = await collections.mailAddresses().findOne({ localPart: 'billing' });
    expect(address).toMatchObject({
      address: 'billing@muvance.com',
      displayName: 'Muvance Billing',
    });
    expect(address?.ownerIds.map(String)).toEqual([id]);
    const account = await collections.mailAccounts().findOne({ _id: new ObjectId(id) });
    expect(account).not.toHaveProperty('aliases');
  });
});
