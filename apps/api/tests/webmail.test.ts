import request from 'supertest';
import { describe, expect, it } from 'vitest';
import type {
  MailAccountDto,
  WebmailContact,
  WebmailMeDto,
  WebmailTeamAvatars,
} from '@muvance/shared';
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

  it('makes people choose their own password at first sign-in, and again after an admin reset', async () => {
    const { admin, account } = await newMailbox('nila');
    const web = request.agent(app);
    await web.post('/api/webmail/login').send({ email: 'nila', password: 'mailbox-password-1' });
    expect(((await web.get('/api/webmail/me')).body as WebmailMeDto).mustChangePassword).toBe(true);

    // The same password again isn't a change.
    expect(
      (await web.post('/api/webmail/password').send({ next: 'mailbox-password-1' })).status,
    ).toBe(400);
    // No current password needed for this first change: the session proves it.
    expect(
      (await web.post('/api/webmail/password').send({ next: 'nilas-own-pass-9' })).status,
    ).toBe(204);
    expect(((await web.get('/api/webmail/me')).body as WebmailMeDto).mustChangePassword).toBe(
      false,
    );

    // The admin's starting password no longer works; hers does.
    const login = (password: string) =>
      request(app).post('/api/webmail/login').send({ email: 'nila', password });
    expect((await login('mailbox-password-1')).status).toBe(401);
    expect((await login('nilas-own-pass-9')).status).toBe(200);

    // Later changes need the current password.
    expect((await web.post('/api/webmail/password').send({ next: 'another-pass-77' })).status).toBe(
      403,
    );

    // An admin reset asks her to choose again.
    await admin
      .post(`/api/mail-accounts/${account.id}/password`)
      .send({ password: 'temporary-pass-5' });
    const again = request.agent(app);
    await again.post('/api/webmail/login').send({ email: 'nila', password: 'temporary-pass-5' });
    expect(((await again.get('/api/webmail/me')).body as WebmailMeDto).mustChangePassword).toBe(
      true,
    );
  });

  it('profile pictures: admins set them, people change their own, teammates see them', async () => {
    // A real 1x1 PNG.
    const png =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const { admin, account } = await newMailbox('pia');
    expect(account.avatarUrl).toBeNull();

    // Admin sets it.
    const set = await admin.put(`/api/mail-accounts/${account.id}/avatar`).send({ image: png });
    expect(set.status).toBe(200);
    const url = (set.body as MailAccountDto).avatarUrl!;
    expect(url).toMatch(/\/avatar\?v=\d+$/);
    const img = await admin.get(url);
    expect(img.status).toBe(200);
    expect(img.headers['content-type']).toBe('image/png');

    // A file that only claims to be a picture is refused.
    const fake =
      'data:image/png;base64,' + Buffer.from('<script>alert(1)</script>').toString('base64');
    expect(
      (await admin.put(`/api/mail-accounts/${account.id}/avatar`).send({ image: fake })).status,
    ).toBe(400);

    // The person sees it, and can remove or replace it.
    const web = request.agent(app);
    await web.post('/api/webmail/login').send({ email: 'pia', password: 'mailbox-password-1' });
    const me = (await web.get('/api/webmail/me')).body as WebmailMeDto;
    expect(me.avatarUrl).toMatch(/^\/api\/webmail\/avatars\/pia%40muvance\.com\?v=/);
    expect((await web.get(me.avatarUrl!)).status).toBe(200);
    expect((await web.delete('/api/webmail/avatar')).status).toBe(204);
    expect(((await web.get('/api/webmail/me')).body as WebmailMeDto).avatarUrl).toBeNull();
    expect((await web.put('/api/webmail/avatar').send({ image: png })).status).toBe(204);

    // A realistic picture (~150 KB as base64) gets through; the general 100 KB limit doesn't apply.
    const big =
      'data:image/png;base64,' +
      Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        Buffer.alloc(110_000),
      ]).toString('base64');
    expect((await web.put('/api/webmail/avatar').send({ image: big })).status).toBe(204);

    // Teammates get everyone's pictures; strangers get nothing.
    await newMailbox('quinn');
    const mate = request.agent(app);
    await mate.post('/api/webmail/login').send({ email: 'quinn', password: 'mailbox-password-1' });
    const team = (await mate.get('/api/webmail/team-avatars')).body as WebmailTeamAvatars;
    expect(Object.keys(team)).toContain('pia@muvance.com');
    expect((await request(app).get('/api/webmail/team-avatars')).status).toBe(401);
  });
});
