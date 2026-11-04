import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { PASSWORD, app, createUser } from './helpers';

describe('username sign-in', () => {
  it('signs in with a username in any case, even without an email', async () => {
    await createUser('owner', { email: null, username: 'Rafi.Owner' });
    const agent = request.agent(app);
    const res = await agent
      .post('/api/auth/login')
      .send({ identifier: '  rafi.owner ', password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ username: 'Rafi.Owner', email: null, role: 'owner' });

    // A username-only account can't remove its username (it would be locked out).
    const cleared = await agent.patch('/api/auth/me').send({ name: 'Rafi', username: '' });
    expect(cleared.status).toBe(400);
  });

  it('lets people set a unique username and then sign in with it', async () => {
    const taken = await createUser('member', { username: 'taken_name' });
    const user = await createUser('member');
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ identifier: user.email, password: PASSWORD });

    const clash = await agent.patch('/api/auth/me').send({ name: 'M', username: 'TAKEN_NAME' });
    expect(clash.status).toBe(409);
    expect(taken.usernameKey).toBe('taken_name');

    const ok = await agent.patch('/api/auth/me').send({ name: 'M', username: 'Mina' });
    expect(ok.body.username).toBe('Mina');
    const login = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'MINA', password: PASSWORD });
    expect(login.status).toBe(200);

    const bad = await agent.patch('/api/auth/me').send({ name: 'M', username: 'no spaces' });
    expect(bad.status).toBe(400);
  });
});
