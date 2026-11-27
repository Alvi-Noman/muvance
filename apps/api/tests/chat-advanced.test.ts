import request from 'supertest';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type {
  ChatBootstrapDto,
  ChatMessageDto,
  ChatMessagePage,
  ChatSpaceDto,
} from '@muvance/shared';
import { collections } from '@/db/client';
import { firstLink, isPrivateAddress, parsePreview } from '@/modules/chat/previews';
import { pushTransport, type ChatPushPayload } from '@/modules/chat/push';
import { app, signedIn } from './helpers';

vi.mock('@/modules/chat/mailer', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/modules/chat/mailer')>();
  return { ...real, chatMailer: { send: vi.fn(async () => {}) } };
});

// Push notifications are captured instead of sent.
const pushes = vi.hoisted(() => [] as { endpoint: string; payload: ChatPushPayload }[]);

let admin: Awaited<ReturnType<typeof signedIn>>['agent'];

beforeAll(async () => {
  admin = (await signedIn('admin')).agent;
  vi.spyOn(pushTransport, 'send').mockImplementation(async (sub, payload) => {
    pushes.push({ endpoint: sub.endpoint, payload });
    return !sub.endpoint.includes('gone');
  });
});

async function teammate(localPart: string) {
  const res = await admin.post('/api/mail-accounts').send({
    localPart,
    name: `${localPart[0]!.toUpperCase()}${localPart.slice(1)} Rahman`,
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

async function spaceWith(owner: request.Agent, name: string, memberIds: string[]) {
  const res = await owner.post('/api/chat/spaces').send({ name, memberIds });
  expect(res.status).toBe(201);
  return res.body as ChatSpaceDto;
}

async function send(agent: request.Agent, spaceId: string, body: Record<string, unknown>) {
  const res = await agent.post(`/api/chat/spaces/${spaceId}/messages`).send(body);
  expect(res.status).toBe(201);
  return res.body as ChatMessageDto;
}

describe('Message tools', () => {
  it('quotes, pins, saves and marks as unread', async () => {
    const a = await teammate('quinn');
    const b = await teammate('rumi');
    const space = await spaceWith(a.agent, 'Tools', [b.id]);
    const first = await send(a.agent, space.id, { text: 'Budget is $5k this month' });

    const reply = await send(b.agent, space.id, { text: 'Sounds good', quoteId: first.id });
    expect(reply.quote).toMatchObject({ id: first.id, authorId: a.id, text: first.text });

    // Pins are shared with everyone in the conversation.
    const pinned = await b.agent.put(`/api/chat/messages/${first.id}/pin`).send({ pinned: true });
    expect(pinned.body.pinned).toMatchObject({ byId: b.id });
    const pins = await a.agent.get(`/api/chat/spaces/${space.id}/pins`);
    expect(pins.body.messages.map((m: ChatMessageDto) => m.id)).toEqual([first.id]);
    await a.agent.put(`/api/chat/messages/${first.id}/pin`).send({ pinned: false });
    expect((await a.agent.get(`/api/chat/spaces/${space.id}/pins`)).body.messages).toHaveLength(0);

    // Saved messages are personal.
    expect(
      (await a.agent.put(`/api/chat/messages/${reply.id}/save`).send({ saved: true })).status,
    ).toBe(204);
    expect((await bootstrap(a.agent)).savedIds).toEqual([reply.id]);
    expect((await bootstrap(b.agent)).savedIds).toEqual([]);
    const saved = await a.agent.get('/api/chat/saved');
    expect(saved.body.messages[0].id).toBe(reply.id);

    // Mark as unread: counts again from that message.
    await a.agent.put(`/api/chat/spaces/${space.id}/read`);
    const unread = await a.agent
      .put(`/api/chat/spaces/${space.id}/unread`)
      .send({ messageId: reply.id });
    expect(unread.body.unread).toBe(1);

    // Deleting a message un-pins and un-saves it.
    await a.agent.put(`/api/chat/messages/${reply.id}/pin`).send({ pinned: true });
    await b.agent.delete(`/api/chat/messages/${reply.id}`);
    expect((await bootstrap(a.agent)).savedIds).toEqual([]);
    expect((await a.agent.get(`/api/chat/spaces/${space.id}/pins`)).body.messages).toHaveLength(0);
  });

  it('forwards a message with its files to another conversation', async () => {
    const a = await teammate('sami');
    const b = await teammate('tara');
    const from = await spaceWith(a.agent, 'From', [b.id]);
    const to = await spaceWith(a.agent, 'To', []);
    const upload = await a.agent
      .post(
        `/api/chat/spaces/${from.id}/files?name=voice.webm&voice=1&duration=4200&waveform=1,50,100,300`,
      )
      .set('Content-Type', 'audio/webm')
      .send(Buffer.from('fake audio'));
    expect(upload.status).toBe(201);
    expect(upload.body).toMatchObject({
      voice: true,
      durationMs: 4200,
      waveform: [1, 50, 100, 100],
    });
    const original = await send(a.agent, from.id, {
      text: `For <@${b.id}>`,
      attachmentIds: [upload.body.id],
    });

    // Only into conversations you're in.
    const stranger = await teammate('uma');
    const theirs = await spaceWith(stranger.agent, 'Theirs', []);
    expect(
      (
        await a.agent
          .post(`/api/chat/messages/${original.id}/forward`)
          .send({ spaceIds: [theirs.id] })
      ).status,
    ).toBe(404);

    const res = await a.agent
      .post(`/api/chat/messages/${original.id}/forward`)
      .send({ spaceIds: [to.id] });
    expect(res.status).toBe(201);
    const copy = res.body.messages[0] as ChatMessageDto;
    expect(copy).toMatchObject({ spaceId: to.id, forwarded: true, text: 'For @Tara Rahman' });
    expect(copy.attachments[0]).toMatchObject({ voice: true, durationMs: 4200 });
    expect(copy.attachments[0]!.id).not.toBe(upload.body.id);
    const file = await a.agent.get(`/api/chat/files/${copy.attachments[0]!.id}`);
    expect(file.status).toBe(200);
    expect(file.body.toString()).toBe('fake audio');

    // The copy survives the original being deleted.
    await a.agent.delete(`/api/chat/messages/${original.id}`);
    expect((await a.agent.get(`/api/chat/files/${copy.attachments[0]!.id}`)).status).toBe(200);
  });

  it('lists shared media, files and links', async () => {
    const a = await teammate('vera');
    const space = await spaceWith(a.agent, 'Shared', []);
    const photo = await a.agent
      .post(`/api/chat/spaces/${space.id}/files?name=ad.png&width=1080&height=1350`)
      .set('Content-Type', 'image/png')
      .send(Buffer.from('png'));
    const pdf = await a.agent
      .post(`/api/chat/spaces/${space.id}/files?name=report.pdf`)
      .set('Content-Type', 'application/pdf')
      .send(Buffer.from('pdf'));
    await send(a.agent, space.id, { attachmentIds: [photo.body.id] });
    await send(a.agent, space.id, { attachmentIds: [pdf.body.id] });
    await send(a.agent, space.id, { text: 'See https://example.com/brief' });
    await send(a.agent, space.id, { text: 'No link here' });

    const kinds = async (kind: string) =>
      (
        (await a.agent.get(`/api/chat/spaces/${space.id}/shared?kind=${kind}`))
          .body as ChatMessagePage
      ).messages;
    expect((await kinds('media'))[0]!.attachments[0]!.name).toBe('ad.png');
    expect((await kinds('files'))[0]!.attachments[0]!.name).toBe('report.pdf');
    expect((await kinds('links')).map((m) => m.text)).toEqual(['See https://example.com/brief']);
  });
});

describe('Status, do not disturb and push notifications', () => {
  it('shows a custom status that clears itself', async () => {
    const a = await teammate('wasi');
    const b = await teammate('yara');
    const set = await a.agent
      .put('/api/chat/me/status')
      .send({ emoji: '🌴', text: 'On holiday', clearAt: null });
    expect(set.body.customStatus).toMatchObject({ emoji: '🌴', text: 'On holiday' });
    const seen = (await bootstrap(b.agent)).people.find((p) => p.id === a.id)!;
    expect(seen.customStatus?.text).toBe('On holiday');

    await a.agent.put('/api/chat/me/status').send({
      emoji: '📅',
      text: 'In a meeting',
      clearAt: new Date(Date.now() - 1000).toISOString(),
    });
    expect((await bootstrap(b.agent)).people.find((p) => p.id === a.id)!.customStatus).toBeNull();
  });

  it('pushes new messages to subscribed devices, except muted, paused or your own', async () => {
    const a = await teammate('zain');
    const b = await teammate('zoya');
    const c = await teammate('zara');
    const space = await spaceWith(a.agent, 'Pushy', [b.id, c.id]);
    expect((await bootstrap(b.agent)).pushKey).toMatch(/^[A-Za-z0-9_-]{40,}$/);

    const sub = (endpoint: string) => ({
      endpoint,
      keys: { p256dh: 'BPx1', auth: 'auth1' },
    });
    for (const [agent, endpoint] of [
      [a.agent, 'https://push.example/a'],
      [b.agent, 'https://push.example/b'],
      [b.agent, 'https://push.example/gone-b'],
      [c.agent, 'https://push.example/c'],
    ] as const) {
      expect((await agent.post('/api/chat/push/subscribe').send(sub(endpoint))).status).toBe(204);
    }
    // c pauses notifications.
    await c.agent
      .put('/api/chat/me/dnd')
      .send({ until: new Date(Date.now() + 3_600_000).toISOString() });

    pushes.length = 0;
    await send(a.agent, space.id, { text: 'Launch moved to Friday' });
    await vi.waitFor(() => expect(pushes.length).toBe(2));
    expect(pushes.map((p) => p.endpoint).sort()).toEqual([
      'https://push.example/b',
      'https://push.example/gone-b',
    ]);
    expect(pushes[0]!.payload).toMatchObject({
      title: 'Zain Rahman in Pushy',
      body: 'Launch moved to Friday',
      spaceId: space.id,
    });
    // A device that's gone is forgotten.
    await vi.waitFor(async () =>
      expect(await collections.chatPushSubscriptions().countDocuments({ endpoint: /gone/ })).toBe(
        0,
      ),
    );

    // Muted: only mentions come through.
    await b.agent.put(`/api/chat/spaces/${space.id}/mute`).send({ muted: true });
    pushes.length = 0;
    await send(a.agent, space.id, { text: 'Small update' });
    await send(a.agent, space.id, { text: `<@${b.id}> please check` });
    await vi.waitFor(() => expect(pushes.length).toBe(1));
    expect(pushes[0]!.payload.body).toBe('@Zoya Rahman please check');

    await b.agent.post('/api/chat/push/unsubscribe').send({ endpoint: 'https://push.example/b' });
    expect(
      await collections.chatPushSubscriptions().countDocuments({ userId: { $exists: true } }),
    ).toBe(2);
  });
});

describe('Link previews', () => {
  it('finds the first link outside code', () => {
    expect(firstLink('see `https://a.com` and https://b.example.com/x).')).toBe(
      'https://b.example.com/x',
    );
    expect(firstLink('no links, just http:// and localhost')).toBeNull();
  });

  it('reads Open Graph tags', () => {
    const html = `<html><head><title>Fallback</title>
      <meta property="og:title" content="Spring &amp; Summer Ads">
      <meta name="description" content="A guide">
      <meta property="og:image" content="/img/cover.png">
      <meta property="og:site_name" content="Example"></head></html>`;
    expect(parsePreview(html, 'https://example.com/post')).toEqual({
      url: 'https://example.com/post',
      title: 'Spring & Summer Ads',
      description: 'A guide',
      image: 'https://example.com/img/cover.png',
      siteName: 'Example',
    });
    expect(parsePreview('<p>nothing</p>', 'https://example.com')).toBeNull();
  });

  it('never fetches private addresses', () => {
    for (const ip of [
      '127.0.0.1',
      '10.1.2.3',
      '172.20.0.5',
      '192.168.1.1',
      '169.254.169.254',
      '::1',
      'fd00::1',
      '::ffff:10.0.0.1',
    ]) {
      expect(isPrivateAddress(ip)).toBe(true);
    }
    for (const ip of ['8.8.8.8', '84.247.161.161', '2606:4700::1111']) {
      expect(isPrivateAddress(ip)).toBe(false);
    }
  });
});
