import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { PASSWORD, app, createUser, signedIn } from './helpers';

describe('auth', () => {
  it('signs in with the right password and returns the user with permissions', async () => {
    const user = await createUser('member');
    const agent = request.agent(app);
    const res = await agent
      .post('/api/auth/login')
      .send({ identifier: user.email, password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ email: user.email, role: 'member' });
    expect(res.body.permissions).toContain('leads:write');
    expect(res.body.permissions).not.toContain('team:manage');
    expect(res.body.passwordHash).toBeUndefined();

    // Session cookie is httpOnly and SameSite=Strict.
    const cookie = String(res.headers['set-cookie']);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Strict/i);

    expect((await agent.get('/api/auth/me')).status).toBe(200);
  });

  it('rejects a wrong password and an unknown email with the same message', async () => {
    const user = await createUser('member');
    const wrong = await request(app)
      .post('/api/auth/login')
      .send({ identifier: user.email, password: 'nope-nope-nope' });
    const unknown = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'nobody@test.dev', password: PASSWORD });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.error.message).toBe(unknown.body.error.message);
  });

  it('requires a session for admin routes', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/leads')).status).toBe(401);
  });

  it('logs out and invalidates the session', async () => {
    const { agent } = await signedIn('admin');
    expect((await agent.post('/api/auth/logout')).status).toBe(204);
    expect((await agent.get('/api/auth/me')).status).toBe(401);
  });

  it('blocks disabled accounts', async () => {
    const user = await createUser('member', { status: 'disabled' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: user.email, password: PASSWORD });
    expect(res.status).toBe(403);
  });

  it('changes password and requires the current one', async () => {
    const { agent, user } = await signedIn('member');
    const bad = await agent
      .post('/api/auth/change-password')
      .send({ currentPassword: 'wrong-wrong', newPassword: 'a-brand-new-password' });
    expect(bad.status).toBe(400);
    const ok = await agent
      .post('/api/auth/change-password')
      .send({ currentPassword: PASSWORD, newPassword: 'a-brand-new-password' });
    expect(ok.status).toBe(204);
    const login = await request(app)
      .post('/api/auth/login')
      .send({ identifier: user.email, password: 'a-brand-new-password' });
    expect(login.status).toBe(200);
  });

  it('blocks cross-site state-changing requests', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Origin', 'https://evil.example')
      .send({ identifier: 'x@test.dev', password: 'whatever' });
    expect(res.status).toBe(403);
  });
});
