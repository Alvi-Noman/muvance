import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app, signedIn } from './helpers';

const STARTING = 'starting-password-1';
const person = (username: string, role = 'member') => ({
  username,
  email: `${username}@Test.dev`,
  password: STARTING,
  role,
});

describe('adding people directly', () => {
  it('lets them sign in with either, and blocks everything until they set a password', async () => {
    const { agent: owner } = await signedIn('owner');
    const added = await owner.post('/api/team').send(person('Nadia'));
    expect(added.status).toBe(201);
    expect(added.body).toMatchObject({
      username: 'Nadia',
      email: 'nadia@test.dev',
      role: 'member',
      mustChangePassword: true,
    });
    expect(JSON.stringify(added.body)).not.toContain(STARTING);
    expect(added.body.passwordHash).toBeUndefined();

    // Either one works, whatever the capitals.
    for (const identifier of ['nadia', 'NADIA@test.dev']) {
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

    // Only their own details and changing the password are allowed.
    expect((await nadia.get('/api/auth/me')).status).toBe(200);
    expect((await nadia.get('/api/leads')).status).toBe(403);
    expect((await nadia.get('/api/dashboard')).status).toBe(403);
    expect((await nadia.patch('/api/auth/me').send({ name: 'N' })).status).toBe(403);

    // It has to be a new password, and needs the starting one.
    const same = await nadia
      .post('/api/auth/change-password')
      .send({ currentPassword: STARTING, newPassword: STARTING });
    expect(same.status).toBe(400);
    const wrong = await nadia
      .post('/api/auth/change-password')
      .send({ currentPassword: 'not-the-password', newPassword: 'her-own-password-1' });
    expect(wrong.status).toBe(400);
    expect((await nadia.get('/api/leads')).status).toBe(403);

    const changed = await nadia
      .post('/api/auth/change-password')
      .send({ currentPassword: STARTING, newPassword: 'her-own-password-1' });
    expect(changed.status).toBe(204);

    // Same session carries on, with the access their role gives.
    expect((await nadia.get('/api/leads')).status).toBe(200);
    expect((await nadia.get('/api/team')).status).toBe(403);
    expect((await nadia.get('/api/auth/me')).body.mustChangePassword).toBe(false);

    // The starting password no longer works.
    const old = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'nadia', password: STARTING });
    expect(old.status).toBe(401);
    const fresh = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'nadia@test.dev', password: 'her-own-password-1' });
    expect(fresh.status).toBe(200);
    expect(fresh.body.mustChangePassword).toBe(false);
  });

  it('follows the role rules', async () => {
    const { agent: owner } = await signedIn('owner');
    const { agent: admin } = await signedIn('admin');
    const { agent: member } = await signedIn('member');
    const { agent: viewer } = await signedIn('viewer');

    expect((await owner.post('/api/team').send(person('own_admin', 'admin'))).status).toBe(201);
    expect((await owner.post('/api/team').send(person('own_owner', 'owner'))).status).toBe(201);

    expect((await admin.post('/api/team').send(person('adm_member'))).status).toBe(201);
    expect((await admin.post('/api/team').send(person('adm_viewer', 'viewer'))).status).toBe(201);
    expect((await admin.post('/api/team').send(person('adm_admin', 'admin'))).status).toBe(403);
    expect((await admin.post('/api/team').send(person('adm_owner', 'owner'))).status).toBe(403);

    expect((await member.post('/api/team').send(person('mem_new'))).status).toBe(403);
    expect((await viewer.post('/api/team').send(person('view_new'))).status).toBe(403);
    expect((await request(app).post('/api/team').send(person('anon_new'))).status).toBe(401);
  });

  it('refuses taken usernames and emails, and bad input', async () => {
    const { agent } = await signedIn('owner');
    expect((await agent.post('/api/team').send(person('Rumi'))).status).toBe(201);

    const username = await agent
      .post('/api/team')
      .send({ ...person('RUMI'), email: 'other@test.dev' });
    expect(username.status).toBe(409);
    expect(username.body.error.message).toMatch(/username/i);

    const email = await agent
      .post('/api/team')
      .send({ ...person('rumi2'), email: 'rumi@test.dev' });
    expect(email.status).toBe(409);
    expect(email.body.error.message).toMatch(/email/i);

    for (const bad of [
      { ...person('short_pw'), password: 'short' },
      { ...person('bad_email'), email: 'nope' },
      { ...person('no spaces') },
      { ...person('with@sign') },
      { ...person('bad_role'), role: 'god' },
    ]) {
      expect((await agent.post('/api/team').send(bad)).status, JSON.stringify(bad)).toBe(400);
    }
  });

  it('clears the requirement when they use a reset link', async () => {
    const { agent: owner } = await signedIn('owner');
    const added = await owner.post('/api/team').send(person('Sami'));
    const link = await owner.post(`/api/team/${added.body.id}/reset-link`);
    const token = new URL(link.body.url).searchParams.get('token');

    const sami = request.agent(app);
    const reset = await sami
      .post('/api/auth/accept-invite')
      .send({ token, password: 'sami-own-password' });
    expect(reset.status).toBe(200);
    expect(reset.body.mustChangePassword).toBe(false);
    expect((await sami.get('/api/leads')).status).toBe(200);
  });
});
