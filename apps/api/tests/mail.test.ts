import { readFile } from 'node:fs/promises';
import path from 'node:path';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import type { MailAccountDto, MailAccountsDto } from '@muvance/shared';
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

describe('team email accounts', () => {
  it('only owners and admins manage email accounts', async () => {
    const member = await signedIn('member');
    expect((await member.agent.get('/api/mail-accounts')).status).toBe(403);
    expect((await request(app).get('/api/mail-accounts')).status).toBe(401);
  });

  it('creates mailboxes the mail server can read, with quotas and a sender name', async () => {
    const { agent } = await signedIn('admin');
    const res = await agent.post('/api/mail-accounts').send({
      localPart: 'Nadia.K',
      name: 'Nadia Karim',
      password: 'a-long-password-1',
      quotaGb: 5,
      senderName: 'Nadia from Muvance',
    });
    expect(res.status).toBe(201);
    const account = res.body as MailAccountDto;
    expect(account.address).toBe('nadia.k@muvance.com');
    expect(account.senderName).toBe('Nadia from Muvance');

    const hashes = await accountsFile();
    expect(verifySha512Crypt('a-long-password-1', hashes['nadia.k@muvance.com']!)).toBe(true);
    const aliases = await file('postfix-virtual.cf');
    // Role addresses go to the first mailbox.
    expect(aliases).toContain('postmaster@muvance.com nadia.k@muvance.com');
    expect(await file('dovecot-quotas.cf')).toContain('nadia.k@muvance.com:5G');
    expect(Number(await file('mailbox-count'))).toBeGreaterThan(0);

    const list = (await agent.get('/api/mail-accounts')).body as MailAccountsDto;
    expect(list.webmailUrl).toBe('https://mail.muvance.com');
    expect(list.accounts.map((a) => a.address)).toContain('nadia.k@muvance.com');
  });

  it('keeps every address unique and rejects bad names', async () => {
    const { agent } = await signedIn('owner');
    const base = { name: 'X', password: 'a-long-password-1' };
    const rafi = await agent.post('/api/mail-accounts').send({ ...base, localPart: 'rafi' });
    await agent
      .post('/api/mail-addresses')
      .send({ localPart: 'hello', displayName: 'Muvance', ownerIds: [rafi.body.id] });
    expect(
      (await agent.post('/api/mail-accounts').send({ ...base, localPart: 'rafi' })).status,
    ).toBe(409);
    expect(
      (await agent.post('/api/mail-accounts').send({ ...base, localPart: 'hello' })).status,
    ).toBe(409);
    expect(
      (await agent.post('/api/mail-accounts').send({ ...base, localPart: '.bad' })).status,
    ).toBe(400);
    expect(
      (await agent.post('/api/mail-accounts').send({ ...base, localPart: 'root' })).status,
    ).toBe(400);
    expect(
      (await agent.post('/api/mail-accounts').send({ ...base, localPart: 'ok', password: 'short' }))
        .status,
    ).toBe(400);
  });

  it('resets passwords', async () => {
    const { agent } = await signedIn('admin');
    const created = await agent
      .post('/api/mail-accounts')
      .send({ localPart: 'omar', name: 'Omar', password: 'first-password-1' });
    const id = (created.body as MailAccountDto).id;

    await agent.post(`/api/mail-accounts/${id}/password`).send({ password: 'second-password-2' });
    expect(
      verifySha512Crypt('second-password-2', (await accountsFile())['omar@muvance.com']!),
    ).toBe(true);
  });

  it('removes deleted mailboxes from the mail server', async () => {
    const { agent } = await signedIn('admin');
    const created = await agent
      .post('/api/mail-accounts')
      .send({ localPart: 'temp', name: 'Temp', password: 'a-long-password-1', aliases: ['temp2'] });
    expect((await agent.delete(`/api/mail-accounts/${created.body.id}`)).status).toBe(204);
    expect(await accountsFile()).not.toHaveProperty('temp@muvance.com');
    expect(await file('postfix-virtual.cf')).not.toContain('temp2@');
  });

  it('shared addresses go to one or more people, and stay unique', async () => {
    const { agent } = await signedIn('admin');
    const base = { password: 'a-long-password-1' };
    const ana = (
      await agent.post('/api/mail-accounts').send({ ...base, localPart: 'ana', name: 'Ana' })
    ).body as MailAccountDto;
    const ben = (
      await agent.post('/api/mail-accounts').send({ ...base, localPart: 'ben', name: 'Ben' })
    ).body as MailAccountDto;

    const hr = await agent
      .post('/api/mail-addresses')
      .send({ localPart: 'hr', displayName: 'Muvance HR', ownerIds: [ana.id, ben.id] });
    expect(hr.status).toBe(201);
    expect(await file('postfix-virtual.cf')).toContain(
      'hr@muvance.com ana@muvance.com,ben@muvance.com',
    );

    // A name used by a mailbox or another address is taken; so is a mailbox name already used.
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
    expect(
      (await agent.post('/api/mail-accounts').send({ ...base, localPart: 'hr', name: 'X' })).status,
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

    // Deleting Ben's mailbox leaves hr@ with nobody, so the mail server stops accepting it.
    await agent.delete(`/api/mail-accounts/${ben.id}`);
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
    const res = await agent
      .post('/api/mail-accounts')
      .send({ localPart: 'olda', name: 'Old A', password: 'a-long-password-1' });
    const id = res.body.id as string;
    // How a mailbox looked before shared addresses existed.
    const { ObjectId } = await import('mongodb');
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
