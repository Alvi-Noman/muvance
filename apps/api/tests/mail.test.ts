import { readFile } from 'node:fs/promises';
import path from 'node:path';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import type { MailAccountDto, MailAccountsDto } from '@muvance/shared';
import { env } from '@/config/env';
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

  it('creates mailboxes the mail server can read, with aliases and quotas', async () => {
    const { agent } = await signedIn('admin');
    const res = await agent.post('/api/mail-accounts').send({
      localPart: 'Nadia.K',
      name: 'Nadia Karim',
      password: 'a-long-password-1',
      quotaGb: 5,
      aliases: ['sales'],
    });
    expect(res.status).toBe(201);
    const account = res.body as MailAccountDto;
    expect(account.address).toBe('nadia.k@muvance.com');
    expect(account.aliases).toEqual(['sales@muvance.com']);

    const hashes = await accountsFile();
    expect(verifySha512Crypt('a-long-password-1', hashes['nadia.k@muvance.com']!)).toBe(true);
    const aliases = await file('postfix-virtual.cf');
    expect(aliases).toContain('sales@muvance.com nadia.k@muvance.com');
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
    await agent.post('/api/mail-accounts').send({ ...base, localPart: 'rafi', aliases: ['hello'] });
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

  it('resets passwords, and lets people change their own from webmail', async () => {
    const { agent } = await signedIn('admin');
    const created = await agent
      .post('/api/mail-accounts')
      .send({ localPart: 'omar', name: 'Omar', password: 'first-password-1' });
    const id = (created.body as MailAccountDto).id;

    await agent.post(`/api/mail-accounts/${id}/password`).send({ password: 'second-password-2' });
    expect(
      verifySha512Crypt('second-password-2', (await accountsFile())['omar@muvance.com']!),
    ).toBe(true);

    // Roundcube's password plugin posts a form and expects "ok".
    const change = (fields: Record<string, string>) =>
      request(app).post('/api/mail/password').type('form').send(fields);
    expect(
      (
        await change({
          user: 'omar@muvance.com',
          curpass: 'wrong-password',
          newpass: 'third-password-3',
        })
      ).status,
    ).toBe(403);
    expect(
      (await change({ user: 'omar@muvance.com', curpass: 'second-password-2', newpass: 'short' }))
        .status,
    ).toBe(400);
    const ok = await change({
      user: 'omar@muvance.com',
      curpass: 'second-password-2',
      newpass: 'third-password-3',
    });
    expect(ok.status).toBe(200);
    expect(ok.text).toBe('ok');
    expect(verifySha512Crypt('third-password-3', (await accountsFile())['omar@muvance.com']!)).toBe(
      true,
    );
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
});
