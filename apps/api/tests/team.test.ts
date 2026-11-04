import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app, signedIn } from './helpers';

const tokenFrom = (url: string) => new URL(url).searchParams.get('token')!;

describe('team & roles', () => {
  it('invites a teammate who sets their own password and gets the invited role', async () => {
    const { agent } = await signedIn('owner');
    const invite = await agent
      .post('/api/team/invites')
      .send({ email: 'New@Test.dev', role: 'member' });
    expect(invite.status).toBe(201);
    expect(invite.body.url).toMatch(/^http:\/\/admin\.test\/accept-invite\?token=/);
    const token = tokenFrom(invite.body.url);

    const info = await request(app).get(`/api/auth/invites/${token}`);
    expect(info.body).toEqual({ email: 'new@test.dev', type: 'invite' });

    const invitee = request.agent(app);
    const accepted = await invitee
      .post('/api/auth/accept-invite')
      .send({ token, name: 'New Person', password: 'a-strong-password' });
    expect(accepted.status).toBe(200);
    expect(accepted.body).toMatchObject({
      email: 'new@test.dev',
      role: 'member',
      name: 'New Person',
    });
    expect((await invitee.get('/api/auth/me')).status).toBe(200);

    // Links are single use.
    const again = await request(app)
      .post('/api/auth/accept-invite')
      .send({ token, name: 'Someone', password: 'a-strong-password' });
    expect(again.status).toBe(400);
  });

  it('enforces permissions per role', async () => {
    const { agent: member } = await signedIn('member');
    const { agent: viewer } = await signedIn('viewer');

    expect((await member.get('/api/leads')).status).toBe(200);
    expect((await member.get('/api/team')).status).toBe(403);
    expect((await member.get('/api/leads/export.csv')).status).toBe(403);
    expect((await member.put('/api/settings/availability').send({})).status).toBe(403);

    expect((await viewer.get('/api/leads')).status).toBe(200);
    const write = await viewer.post('/api/leads').send({ name: 'X', phone: '01712345678' });
    expect(write.status).toBe(403);
  });

  it('stops admins from inviting admins and anyone from changing their own role', async () => {
    const { agent: admin, user } = await signedIn('admin');
    expect(
      (await admin.post('/api/team/invites').send({ email: 'a@test.dev', role: 'admin' })).status,
    ).toBe(403);
    expect(
      (await admin.post('/api/team/invites').send({ email: 'm@test.dev', role: 'member' })).status,
    ).toBe(201);
    expect((await admin.patch(`/api/team/${user._id}`).send({ role: 'owner' })).status).toBe(400);
  });

  it('disabling a teammate signs them out immediately', async () => {
    const { agent: owner } = await signedIn('owner');
    const { agent: member, user } = await signedIn('member');
    expect((await member.get('/api/auth/me')).status).toBe(200);

    const res = await owner.patch(`/api/team/${user._id}`).send({ status: 'disabled' });
    expect(res.status).toBe(200);
    expect((await member.get('/api/auth/me')).status).toBe(401);
  });

  it('password reset links let a teammate set a new password', async () => {
    const { agent: owner } = await signedIn('owner');
    const { user } = await signedIn('member');
    const link = await owner.post(`/api/team/${user._id}/reset-link`);
    expect(link.status).toBe(201);

    const res = await request(app)
      .post('/api/auth/accept-invite')
      .send({ token: tokenFrom(link.body.url), password: 'reset-password-123' });
    expect(res.status).toBe(200);
    const login = await request(app)
      .post('/api/auth/login')
      .send({ identifier: user.email, password: 'reset-password-123' });
    expect(login.status).toBe(200);
  });
});
