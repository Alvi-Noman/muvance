import request from 'supertest';
import { describe, expect, it } from 'vitest';
import type { MailAccountDto, WebmailContact, WebmailMeDto } from '@muvance/shared';
import { app, signedIn } from './helpers';

async function newMailbox(localPart: string, password = 'mailbox-password-1') {
  const { agent } = await signedIn('admin');
  const res = await agent
    .post('/api/mail-accounts')
    .send({ localPart, name: `${localPart} Person`, password });
  expect(res.status).toBe(201);
  return { admin: agent, account: res.body as MailAccountDto };
}

describe('Muvance Mail sign-in', () => {
  it('signs in with the mailbox password, by full address or just the name', async () => {
    await newMailbox('sara');
    const wrong = await request(app)
      .post('/api/webmail/login')
      .send({ email: 'sara@muvance.com', password: 'nope-nope-nope' });
    expect(wrong.status).toBe(401);

    const web = request.agent(app);
    const ok = await web
      .post('/api/webmail/login')
      .send({ email: 'Sara', password: 'mailbox-password-1' });
    expect(ok.status).toBe(200);
    expect(ok.headers['set-cookie']?.[0]).toMatch(/mvm_session=.*HttpOnly/i);

    const me = (await web.get('/api/webmail/me')).body as WebmailMeDto;
    expect(me.address).toBe('sara@muvance.com');
    expect(me.displayName).toBe('sara Person');

    // Admin sessions don't open webmail, and webmail sessions don't open the admin.
    const { agent: adminAgent } = await signedIn('owner');
    expect((await adminAgent.get('/api/webmail/me')).status).toBe(401);
    expect((await web.get('/api/mail-accounts')).status).toBe(401);

    await web.post('/api/webmail/logout');
    expect((await web.get('/api/webmail/me')).status).toBe(401);
  });

  it('saves the display name and signature', async () => {
    await newMailbox('lina');
    const web = request.agent(app);
    await web.post('/api/webmail/login').send({ email: 'lina', password: 'mailbox-password-1' });
    expect(
      (
        await web
          .put('/api/webmail/settings')
          .send({ displayName: 'Lina K.', signature: '<p>Lina</p>' })
      ).status,
    ).toBe(204);
    const me = (await web.get('/api/webmail/me')).body as WebmailMeDto;
    expect(me).toMatchObject({ displayName: 'Lina K.', signature: '<p>Lina</p>' });
  });

  it('suggests teammates as recipients', async () => {
    await newMailbox('aria');
    await newMailbox('omar2');
    const web = request.agent(app);
    await web.post('/api/webmail/login').send({ email: 'aria', password: 'mailbox-password-1' });
    const found = (await web.get('/api/webmail/contacts?q=omar')).body as WebmailContact[];
    expect(found.map((c) => c.address)).toContain('omar2@muvance.com');
  });

  it('changes the password and keeps you signed in; admin resets sign you out', async () => {
    const { admin, account } = await newMailbox('ruma');
    const web = request.agent(app);
    await web.post('/api/webmail/login').send({ email: 'ruma', password: 'mailbox-password-1' });

    expect(
      (
        await web
          .post('/api/webmail/password')
          .send({ current: 'wrong-one-123', next: 'new-password-22' })
      ).status,
    ).toBe(403);
    expect(
      (
        await web
          .post('/api/webmail/password')
          .send({ current: 'mailbox-password-1', next: 'new-password-22' })
      ).status,
    ).toBe(204);
    expect((await web.get('/api/webmail/me')).status).toBe(200);
    expect(
      (
        await request(app)
          .post('/api/webmail/login')
          .send({ email: 'ruma', password: 'new-password-22' })
      ).status,
    ).toBe(200);

    await admin
      .post(`/api/mail-accounts/${account.id}/password`)
      .send({ password: 'admin-set-pass-3' });
    expect((await web.get('/api/webmail/me')).status).toBe(401);
  });
});
