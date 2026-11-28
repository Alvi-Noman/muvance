import request from 'supertest';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type {
  ChatBootstrapDto,
  ChatBrowseSpaceDto,
  ChatGuestDto,
  ChatInviteInfoDto,
  ChatInviteResultDto,
  ChatMessageDto,
  ChatMessagePage,
  ChatSpaceDto,
  ChatThreadDto,
} from '@muvance/shared';
import { env } from '@/config/env';
import { collections } from '@/db/client';
import { googleId } from '@/lib/google-id';
import { chatAlerts } from '@/modules/chat/alerts';
import { app, muvancePerson, signedIn } from './helpers';

// Emails (invites, alerts) are captured instead of sent.
const sent = vi.hoisted(() => [] as { from: string; to: string; subject: string; text: string }[]);
vi.mock('@/modules/chat/mailer', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/modules/chat/mailer')>();
  return {
    ...real,
    systemMailer: {
      send: vi.fn(async (m: { to: string; subject: string; text: string }) => {
        sent.push({ from: 'no-reply@muvance.com', to: m.to, subject: m.subject, text: m.text });
      }),
    },
    chatMailer: {
      send: vi.fn(
        async (from: { email: string }, m: { to: string; subject: string; text: string }) => {
          sent.push({ from: from.email, to: m.to, subject: m.subject, text: m.text });
        },
      ),
    },
  };
});

let admin: Awaited<ReturnType<typeof signedIn>>['agent'];

beforeAll(async () => {
  admin = (await signedIn('admin')).agent;
});

/** A teammate: a Muvance account with Mail and Chat, signed in, past their starting password. */
async function teammate(localPart: string) {
  const { agent } = await muvancePerson(admin, localPart);
  const me = await agent.get('/api/chat/me');
  expect(me.status).toBe(200);
  return { agent, id: me.body.id as string };
}

async function bootstrap(agent: request.Agent) {
  return (await agent.get('/api/chat/bootstrap')).body as ChatBootstrapDto;
}

/** Invites a guest to a space and has them accept, returning their signed-in agent. */
async function guestIn(team: request.Agent, spaceId: string, email: string) {
  const invite = await team
    .post(`/api/chat/spaces/${spaceId}/guests`)
    .send({ email, name: 'Rafi' });
  expect(invite.status).toBe(201);
  const body = invite.body as ChatInviteResultDto;
  const token = body.inviteUrl!.split('/join/')[1]!;
  const guest = request.agent(app);
  const accept = await guest.post(`/api/chat/invites/${token}/accept`).send({ name: 'Rafi Ahmed' });
  expect(accept.status).toBe(200);
  return { agent: guest, id: body.person.id, token };
}

/** The code in the latest sign-in email to `email`. */
function lastCode(email: string) {
  const mail = [...sent].reverse().find((m) => m.to === email && /code/.test(m.subject));
  return /\b(\d{6})\b/.exec(mail?.subject ?? '')?.[1] ?? null;
}

describe('Muvance Chat sign-in', () => {
  it('lets teammates in with their Muvance account, once they chose their own password', async () => {
    await admin.post('/api/team').send({
      name: 'Nadia',
      username: 'nadia',
      password: 'starting-password-1',
      role: 'member',
      apps: { admin: false, mail: true, chat: true, meet: true },
    });
    // Chat's own sign-in is for clients only.
    const viaChat = await request(app)
      .post('/api/chat/login/email')
      .send({ email: 'nadia@muvance.com' });
    expect(viaChat.status).toBe(400);
    expect(viaChat.body.error.message).toMatch(/team member/);
    // Still on the starting password: not yet.
    const fresh = request.agent(app);
    await fresh
      .post('/api/auth/login')
      .send({ identifier: 'nadia', password: 'starting-password-1' });
    expect((await fresh.get('/api/chat/me')).status).toBe(401);

    const { agent } = await teammate('omar');
    const data = await bootstrap(agent);
    expect(data.me).toMatchObject({ email: 'omar@muvance.com', kind: 'team', canManage: true });
    // Every teammate is listed, even before their first sign-in.
    expect(data.people.map((p) => p.email)).toEqual(
      expect.arrayContaining(['omar@muvance.com', 'nadia@muvance.com']),
    );

    // An account without a Muvance address (or without Chat) can't use chat.
    expect((await admin.get('/api/chat/me')).status).toBe(403);
    // Signing out of the Muvance account signs out of chat.
    await agent.post('/api/auth/logout');
    expect((await agent.get('/api/chat/me')).status).toBe(401);
  });

  it('ends access when Chat is switched off for them', async () => {
    const { agent } = await teammate('temp');
    const account = await collections.users().findOne({ usernameKey: 'temp' });
    expect(
      (
        await admin
          .patch(`/api/team/${account!._id.toHexString()}`)
          .send({ apps: { admin: false, mail: true, chat: false, meet: true } })
      ).status,
    ).toBe(200);
    expect((await agent.get('/api/chat/me')).status).toBe(403);
    // The next sync marks them removed for everyone else.
    const { agent: other } = await teammate('keeper');
    const people = (await bootstrap(other)).people;
    expect(people.find((p) => p.email === 'temp@muvance.com')?.status).toBe('removed');
  });
});

describe('Spaces and messages', () => {
  it('creates a space, delivers messages and tracks what each person has read', async () => {
    const amy = await teammate('amy');
    const ben = await teammate('ben');
    const created = await amy.agent
      .post('/api/chat/spaces')
      .send({ name: 'Brand Co launch', description: 'Ads for the launch', memberIds: [ben.id] });
    expect(created.status).toBe(201);
    const space = created.body as ChatSpaceDto;
    expect(space.members).toHaveLength(2);
    expect(space.members.find((m) => m.userId === amy.id)?.role).toBe('manager');

    const msg = await amy.agent
      .post(`/api/chat/spaces/${space.id}/messages`)
      .send({ text: `Hi <@${ben.id}>, the creatives are ready` });
    expect(msg.status).toBe(201);

    let benSpace = (await bootstrap(ben.agent)).spaces.find((s) => s.id === space.id)!;
    expect(benSpace).toMatchObject({ unread: 1, mentioned: true });
    expect(benSpace.lastMessage?.text).toContain('creatives');
    expect((await bootstrap(amy.agent)).spaces.find((s) => s.id === space.id)!.unread).toBe(0);

    expect((await ben.agent.put(`/api/chat/spaces/${space.id}/read`)).status).toBe(204);
    benSpace = (await bootstrap(ben.agent)).spaces.find((s) => s.id === space.id)!;
    expect(benSpace).toMatchObject({ unread: 0, mentioned: false });

    const page = (await ben.agent.get(`/api/chat/spaces/${space.id}/messages`))
      .body as ChatMessagePage;
    expect(page.messages.map((m) => m.text)).toEqual([`Hi <@${ben.id}>, the creatives are ready`]);

    // Not a member: the space doesn't exist for you.
    const cara = await teammate('cara');
    expect((await cara.agent.get(`/api/chat/spaces/${space.id}/messages`)).status).toBe(404);
    // But teammates can find it and join, because it's discoverable.
    const browse = (await cara.agent.get('/api/chat/spaces/browse')).body as ChatBrowseSpaceDto[];
    expect(browse.map((s) => s.id)).toContain(space.id);
    expect((await cara.agent.post(`/api/chat/spaces/${space.id}/join`)).status).toBe(200);
    expect((await cara.agent.get(`/api/chat/spaces/${space.id}/messages`)).status).toBe(200);
  });

  it('threads, reactions, edits and deletes', async () => {
    const dan = await teammate('dan');
    const eva = await teammate('eva');
    const space = (
      await dan.agent.post('/api/chat/spaces').send({ name: 'Ops', memberIds: [eva.id] })
    ).body as ChatSpaceDto;
    const root = (
      await dan.agent.post(`/api/chat/spaces/${space.id}/messages`).send({ text: 'Budget?' })
    ).body as ChatMessageDto;

    const reply = await eva.agent
      .post(`/api/chat/spaces/${space.id}/messages`)
      .send({ text: '50k', threadId: root.id });
    expect(reply.status).toBe(201);
    const thread = (await dan.agent.get(`/api/chat/messages/${root.id}/thread`))
      .body as ChatThreadDto;
    expect(thread.root).toMatchObject({ replyCount: 1, replierIds: [eva.id] });
    expect(thread.replies.map((r) => r.text)).toEqual(['50k']);
    // Replies stay out of the main conversation.
    const page = (await dan.agent.get(`/api/chat/spaces/${space.id}/messages`))
      .body as ChatMessagePage;
    expect(page.messages).toHaveLength(1);

    const reacted = await eva.agent
      .put(`/api/chat/messages/${root.id}/reactions`)
      .send({ emoji: '👍' });
    expect(reacted.body.reactions).toEqual([{ emoji: '👍', userIds: [eva.id] }]);
    const unreacted = await eva.agent
      .put(`/api/chat/messages/${root.id}/reactions`)
      .send({ emoji: '👍' });
    expect(unreacted.body.reactions).toEqual([]);

    expect(
      (await eva.agent.patch(`/api/chat/messages/${root.id}`).send({ text: 'hacked' })).status,
    ).toBe(403);
    const edited = await dan.agent
      .patch(`/api/chat/messages/${root.id}`)
      .send({ text: 'Budget for March?' });
    expect(edited.body).toMatchObject({ text: 'Budget for March?' });
    expect(edited.body.editedAt).toBeTruthy();

    expect((await eva.agent.delete(`/api/chat/messages/${root.id}`)).status).toBe(403);
    expect((await dan.agent.delete(`/api/chat/messages/${root.id}`)).status).toBe(204);
    const after = (await dan.agent.get(`/api/chat/spaces/${space.id}/messages`))
      .body as ChatMessagePage;
    expect(after.messages[0]).toMatchObject({ deleted: true, text: '' });
  });

  it('has one direct message per pair', async () => {
    const fay = await teammate('fay');
    const gus = await teammate('gus');
    const a = (await fay.agent.post('/api/chat/dms').send({ userId: gus.id })).body as ChatSpaceDto;
    const b = (await gus.agent.post('/api/chat/dms').send({ userId: fay.id })).body as ChatSpaceDto;
    expect(a.id).toBe(b.id);
    expect(a.kind).toBe('dm');
    expect((await fay.agent.post(`/api/chat/spaces/${a.id}/leave`)).status).toBe(400);
  });

  it('shares files only with people in the conversation', async () => {
    const hal = await teammate('hal');
    const ivy = await teammate('ivy');
    const space = (await hal.agent.post('/api/chat/spaces').send({ name: 'Files' }))
      .body as ChatSpaceDto;
    const upload = await hal.agent
      .post(`/api/chat/spaces/${space.id}/files?name=${encodeURIComponent('report.pdf')}`)
      .set('Content-Type', 'application/pdf')
      .send(Buffer.from('%PDF-1.4 test'));
    expect(upload.status).toBe(201);
    const sentMsg = await hal.agent
      .post(`/api/chat/spaces/${space.id}/messages`)
      .send({ text: '', attachmentIds: [upload.body.id] });
    expect(sentMsg.status).toBe(201);
    expect(sentMsg.body.attachments[0]).toMatchObject({ name: 'report.pdf', size: 13 });

    const file = await hal.agent.get(`/api/chat/files/${upload.body.id}`);
    expect(file.status).toBe(200);
    expect(file.headers['content-type']).toContain('application/pdf');
    expect((await ivy.agent.get(`/api/chat/files/${upload.body.id}`)).status).toBe(404);

    // A file can't be sent twice, or by someone else.
    expect(
      (
        await hal.agent
          .post(`/api/chat/spaces/${space.id}/messages`)
          .send({ attachmentIds: [upload.body.id] })
      ).status,
    ).toBe(400);
  });
});

describe('Clients signing in', () => {
  it('lets anyone in by email: someone new gets a conversation with the whole team', async () => {
    const pat = await teammate('pat');
    // Without the relay, there's no way to email someone nobody invited.
    const noRelay = await request(app)
      .post('/api/chat/login/email')
      .send({ email: 'new.lead@shop.com' });
    expect(noRelay.status).toBe(503);

    env.RELAY_USER = 'relay';
    env.RELAY_PASSWORD = 'relay';
    try {
      const lead = request.agent(app);
      expect(
        (await lead.post('/api/chat/login/email').send({ email: 'new.lead@shop.com' })).status,
      ).toBe(204);
      expect(sent.at(-1)).toMatchObject({ from: 'no-reply@muvance.com', to: 'new.lead@shop.com' });
      // No account until they enter the code.
      expect(await collections.chatUsers().findOne({ email: 'new.lead@shop.com' })).toBeNull();
      const ok = await lead
        .post('/api/chat/login/code')
        .send({ email: 'new.lead@shop.com', code: lastCode('new.lead@shop.com') });
      expect(ok.status).toBe(200);
      expect(ok.body).toMatchObject({ kind: 'guest', name: 'new.lead', canManage: false });

      const data = await bootstrap(lead);
      expect(data.spaces).toHaveLength(1);
      const space = data.spaces[0]!;
      expect(space.description).toContain('Muvance team will reply here');
      // The whole team is in it (and sees it), so they're notified when the client writes.
      expect(space.members.map((m) => m.userId)).toContain(pat.id);
      expect((await bootstrap(pat.agent)).spaces.map((s) => s.id)).toContain(space.id);
      expect(
        (await lead.post(`/api/chat/spaces/${space.id}/messages`).send({ text: 'Hi!' })).status,
      ).toBe(201);
      // Still a client: no browsing or creating spaces.
      expect((await lead.get('/api/chat/spaces/browse')).status).toBe(403);
    } finally {
      env.RELAY_USER = undefined;
      env.RELAY_PASSWORD = undefined;
    }

    const team = await request(app).post('/api/chat/login/email').send({ email: 'x@muvance.com' });
    expect(team.status).toBe(400);
    expect(team.body.error.message).toContain('team');
    expect((await request(app).get('/api/chat/sign-in-options')).body).toEqual({
      googleClientId: null,
    });
  });

  it('stops a code after too many wrong guesses', async () => {
    const ivo = await teammate('ivo');
    const space = (await ivo.agent.post('/api/chat/spaces').send({ name: 'Client: Ivy' }))
      .body as ChatSpaceDto;
    await guestIn(ivo.agent, space.id, 'guess@client.com');
    await request(app).post('/api/chat/login/email').send({ email: 'guess@client.com' });
    const code = lastCode('guess@client.com')!;
    const wrong = code === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/chat/login/code')
        .send({ email: 'guess@client.com', code: wrong });
    }
    const late = await request(app)
      .post('/api/chat/login/code')
      .send({ email: 'guess@client.com', code });
    expect(late.status).toBe(400);
    expect(late.body.error.message).toContain('expired');
  });

  it('continues with Google for an invited client, using their Google name the first time', async () => {
    const zoe = await teammate('zoe');
    const space = (await zoe.agent.post('/api/chat/spaces').send({ name: 'Client: Zed' }))
      .body as ChatSpaceDto;
    await zoe.agent
      .post(`/api/chat/spaces/${space.id}/guests`)
      .send({ email: 'ceo@zed.com', name: 'ceo' });

    env.GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';
    const verify = vi.spyOn(googleId, 'verify');
    try {
      expect((await request(app).get('/api/chat/sign-in-options')).body).toEqual({
        googleClientId: 'test-client.apps.googleusercontent.com',
      });
      verify.mockResolvedValueOnce(null);
      const bad = await request(app)
        .post('/api/chat/login/google')
        .send({ credential: 'x'.repeat(40) });
      expect(bad.status).toBe(401);

      // Someone nobody invited comes straight in, with their own conversation with the team.
      verify.mockResolvedValueOnce({ email: 'someone@gmail.com', name: 'Some One' });
      const stranger = request.agent(app);
      const newcomer = await stranger
        .post('/api/chat/login/google')
        .send({ credential: 'x'.repeat(40) });
      expect(newcomer.status).toBe(200);
      expect(newcomer.body).toMatchObject({ kind: 'guest', name: 'Some One' });
      expect((await bootstrap(stranger)).spaces.map((s) => s.name)).toEqual(['Some One']);
      // Signing in again doesn't make another.
      verify.mockResolvedValueOnce({ email: 'someone@gmail.com', name: 'Some One' });
      await request(app)
        .post('/api/chat/login/google')
        .send({ credential: 'x'.repeat(40) });
      expect((await bootstrap(stranger)).spaces).toHaveLength(1);

      verify.mockResolvedValueOnce({ email: 'ceo@zed.com', name: 'Zara Ed' });
      const client = request.agent(app);
      const ok = await client.post('/api/chat/login/google').send({ credential: 'x'.repeat(40) });
      expect(ok.status).toBe(200);
      expect(verify).toHaveBeenLastCalledWith(
        'x'.repeat(40),
        'test-client.apps.googleusercontent.com',
      );
      expect(ok.body).toMatchObject({ kind: 'guest', name: 'Zara Ed', status: 'active' });
      expect((await bootstrap(client)).spaces.map((s) => s.id)).toEqual([space.id]);
    } finally {
      verify.mockRestore();
      env.GOOGLE_CLIENT_ID = undefined;
    }
  });
});

describe('Guests (clients)', () => {
  it('invites a client, who joins from the link (no password) and sees only their spaces', async () => {
    const jay = await teammate('jay');
    const space = (await jay.agent.post('/api/chat/spaces').send({ name: 'Client: Brand Co' }))
      .body as ChatSpaceDto;
    const other = (await jay.agent.post('/api/chat/spaces').send({ name: 'Internal' }))
      .body as ChatSpaceDto;

    sent.length = 0;
    const invite = await jay.agent
      .post(`/api/chat/spaces/${space.id}/guests`)
      .send({ email: 'Rafi@BrandCo.com', name: 'Rafi' });
    expect(invite.status).toBe(201);
    const result = invite.body as ChatInviteResultDto;
    expect(result).toMatchObject({ emailed: true, person: { kind: 'guest', status: 'invited' } });
    expect(sent[0]).toMatchObject({ from: 'jay@muvance.com', to: 'rafi@brandco.com' });
    expect(sent[0]!.text).toContain(result.inviteUrl!);

    const token = result.inviteUrl!.split('/join/')[1]!;
    const info = (await request(app).get(`/api/chat/invites/${token}`)).body as ChatInviteInfoDto;
    expect(info).toMatchObject({
      email: 'rafi@brandco.com',
      invitedBy: 'Jay Khan',
      spaceName: 'Client: Brand Co',
      existing: false,
    });

    const guest = request.agent(app);
    expect(
      (await guest.post(`/api/chat/invites/${token}/accept`).send({ name: 'Rafi Ahmed' })).status,
    ).toBe(200);
    // The link is used up.
    expect((await request(app).get(`/api/chat/invites/${token}`)).status).toBe(404);

    const data = await bootstrap(guest);
    expect(data.me).toMatchObject({ kind: 'guest', name: 'Rafi Ahmed', canManage: false });
    expect(data.spaces.map((s) => s.id)).toEqual([space.id]);
    expect((await guest.get(`/api/chat/spaces/${other.id}/messages`)).status).toBe(404);

    // Guests can't create spaces, browse, invite, or see the guest list.
    expect((await guest.post('/api/chat/spaces').send({ name: 'Mine' })).status).toBe(403);
    expect((await guest.get('/api/chat/spaces/browse')).status).toBe(403);
    expect(
      (await guest.post(`/api/chat/spaces/${space.id}/guests`).send({ email: 'x@y.com' })).status,
    ).toBe(403);
    expect((await guest.get('/api/chat/guests')).status).toBe(403);

    // On another device they sign in with a code emailed to them.
    const again = request.agent(app);
    expect(
      (await again.post('/api/chat/login/email').send({ email: 'Rafi@BrandCo.com ' })).status,
    ).toBe(204);
    const code = lastCode('rafi@brandco.com');
    expect(code).toMatch(/^\d{6}$/);
    const wrong = code === '000000' ? '111111' : '000000';
    expect(
      (await again.post('/api/chat/login/code').send({ email: 'rafi@brandco.com', code: wrong }))
        .status,
    ).toBe(400);
    const ok = await again
      .post('/api/chat/login/code')
      .send({ email: 'rafi@brandco.com', code: `${code!.slice(0, 3)} ${code!.slice(3)}` });
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({ kind: 'guest', name: 'Rafi Ahmed' });
    expect((await again.get('/api/chat/me')).status).toBe(200);
    // A code works once.
    expect(
      (await request(app).post('/api/chat/login/code').send({ email: 'rafi@brandco.com', code }))
        .status,
    ).toBe(400);

    // They can message the teammate who shares their space, but not other guests' contacts.
    expect((await guest.post('/api/chat/dms').send({ userId: jay.id })).status).toBe(200);
    const kim = await teammate('kim');
    expect((await guest.post('/api/chat/dms').send({ userId: kim.id })).status).toBe(403);
  });

  it("emails a client about messages they haven't read, once until they come back", async () => {
    const lee = await teammate('lee');
    const space = (await lee.agent.post('/api/chat/spaces').send({ name: 'Client: Shoes' }))
      .body as ChatSpaceDto;
    const guest = await guestIn(lee.agent, space.id, 'buyer@shoes.com');

    sent.length = 0;
    await lee.agent
      .post(`/api/chat/spaces/${space.id}/messages`)
      .send({ text: `Hi <@${guest.id}>, the report is ready` });
    await lee.agent.post(`/api/chat/spaces/${space.id}/messages`).send({ text: 'Have a look' });

    // Not due yet.
    await chatAlerts.run();
    expect(sent).toHaveLength(0);

    await collections.chatEmailAlerts().updateMany({}, { $set: { dueAt: new Date(0) } });
    await chatAlerts.run();
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({ from: 'lee@muvance.com', to: 'buyer@shoes.com' });
    expect(sent[0]!.subject).toBe('2 unread messages in Muvance Chat');
    expect(sent[0]!.text).toContain('Hi @Rafi Ahmed, the report is ready');

    // More messages: no second email until they've been back.
    await lee.agent.post(`/api/chat/spaces/${space.id}/messages`).send({ text: 'Ping' });
    await collections.chatEmailAlerts().updateMany({}, { $set: { dueAt: new Date(0) } });
    await chatAlerts.run();
    expect(sent).toHaveLength(1);
  });

  it('removes a client’s access', async () => {
    const max = await teammate('max');
    const space = (await max.agent.post('/api/chat/spaces').send({ name: 'Client: Tea' }))
      .body as ChatSpaceDto;
    const guest = await guestIn(max.agent, space.id, 'owner@tea.com');

    const guests = (await max.agent.get('/api/chat/guests')).body as ChatGuestDto[];
    expect(guests.find((g) => g.id === guest.id)).toMatchObject({
      spaceNames: ['Client: Tea'],
      invitedByName: 'Max Khan',
    });

    // A new link signs them in.
    const link = await max.agent.post(`/api/chat/guests/${guest.id}/link`);
    expect(link.body.inviteUrl).toContain('/join/');
    const info = await request(app).get(
      `/api/chat/invites/${(link.body.inviteUrl as string).split('/join/')[1]}`,
    );
    expect(info.body).toMatchObject({ email: 'owner@tea.com', existing: true });

    expect((await max.agent.delete(`/api/chat/guests/${guest.id}`)).status).toBe(204);
    expect((await guest.agent.get('/api/chat/me')).status).toBe(401);
    const login = await request(app).post('/api/chat/login/email').send({ email: 'owner@tea.com' });
    expect(login.status).toBe(403);
    const members = (await bootstrap(max.agent)).spaces.find((s) => s.id === space.id)!.members;
    expect(members.map((m) => m.userId)).not.toContain(guest.id);
  });
});
