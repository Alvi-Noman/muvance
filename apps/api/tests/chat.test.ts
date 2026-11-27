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
import { collections } from '@/db/client';
import { chatAlerts } from '@/modules/chat/alerts';
import { app, signedIn } from './helpers';

// Emails (invites, alerts) are captured instead of sent.
const sent = vi.hoisted(() => [] as { from: string; to: string; subject: string; text: string }[]);
vi.mock('@/modules/chat/mailer', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/modules/chat/mailer')>();
  return {
    ...real,
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

/** A teammate with a mailbox who has already chosen their own password. */
async function teammate(localPart: string) {
  const res = await admin.post('/api/mail-accounts').send({
    localPart,
    name: `${localPart[0]!.toUpperCase()}${localPart.slice(1)} Khan`,
    password: 'mailbox-password-1',
  });
  expect(res.status).toBe(201);
  await collections
    .mailAccounts()
    .updateOne({ localPart }, { $set: { mustChangePassword: false } });
  const agent = request.agent(app);
  const login = await agent
    .post('/api/chat/login')
    .send({ email: localPart, password: 'mailbox-password-1' });
  expect(login.status).toBe(200);
  return { agent, id: login.body.id as string };
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
  const accept = await guest
    .post(`/api/chat/invites/${token}/accept`)
    .send({ name: 'Rafi Ahmed', password: 'client-password-1' });
  expect(accept.status).toBe(200);
  return { agent: guest, id: body.person.id, token };
}

describe('Muvance Chat sign-in', () => {
  it('lets teammates in with their mailbox password, once they chose their own', async () => {
    await admin
      .post('/api/mail-accounts')
      .send({ localPart: 'nadia', name: 'Nadia', password: 'mailbox-password-1' });
    const fresh = await request(app)
      .post('/api/chat/login')
      .send({ email: 'nadia@muvance.com', password: 'mailbox-password-1' });
    expect(fresh.status).toBe(403);
    expect(fresh.body.error.message).toMatch(/Muvance Mail first/);

    const wrong = await request(app)
      .post('/api/chat/login')
      .send({ email: 'nadia', password: 'nope-nope-nope' });
    expect(wrong.status).toBe(401);

    const { agent } = await teammate('omar');
    const data = await bootstrap(agent);
    expect(data.me).toMatchObject({ email: 'omar@muvance.com', kind: 'team', canManage: true });
    // Every teammate is listed, even before their first sign-in.
    expect(data.people.map((p) => p.email)).toEqual(
      expect.arrayContaining(['omar@muvance.com', 'nadia@muvance.com']),
    );

    // Other sign-ins don't open chat.
    expect((await admin.get('/api/chat/me')).status).toBe(401);
    await agent.post('/api/chat/logout');
    expect((await agent.get('/api/chat/me')).status).toBe(401);
  });

  it('ends access when the mailbox is deleted', async () => {
    const { agent } = await teammate('temp');
    const account = await collections.mailAccounts().findOne({ localPart: 'temp' });
    expect((await admin.delete(`/api/mail-accounts/${account!._id.toHexString()}`)).status).toBe(
      204,
    );
    // The next sync marks them removed.
    const { agent: other } = await teammate('keeper');
    await bootstrap(other);
    expect((await agent.get('/api/chat/me')).status).toBe(401);
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

describe('Guests (clients)', () => {
  it('invites a client, who chooses a password and sees only their spaces', async () => {
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
      (
        await guest
          .post(`/api/chat/invites/${token}/accept`)
          .send({ name: 'Rafi', password: 'short' })
      ).status,
    ).toBe(400);
    expect(
      (
        await guest
          .post(`/api/chat/invites/${token}/accept`)
          .send({ name: 'Rafi Ahmed', password: 'client-password-1' })
      ).status,
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

    // They sign in again with their email and password.
    const again = request.agent(app);
    expect(
      (
        await again
          .post('/api/chat/login')
          .send({ email: 'rafi@brandco.com', password: 'client-password-1' })
      ).status,
    ).toBe(200);

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

    // A new link lets them choose a new password.
    const link = await max.agent.post(`/api/chat/guests/${guest.id}/link`);
    expect(link.body.inviteUrl).toContain('/join/');

    expect((await max.agent.delete(`/api/chat/guests/${guest.id}`)).status).toBe(204);
    expect((await guest.agent.get('/api/chat/me')).status).toBe(401);
    const login = await request(app)
      .post('/api/chat/login')
      .send({ email: 'owner@tea.com', password: 'client-password-1' });
    expect(login.status).toBe(403);
    const members = (await bootstrap(max.agent)).spaces.find((s) => s.id === space.id)!.members;
    expect(members.map((m) => m.userId)).not.toContain(guest.id);
  });
});
