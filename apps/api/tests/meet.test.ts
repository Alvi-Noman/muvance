import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  CallRecordingDto,
  MeetJoinRequestDto,
  MeetRoomDto,
  MeetRoomInfoDto,
} from '@muvance/shared';
import type { LiveParticipant } from '@/modules/meet/livekit';
import { callRecordingsService } from '@/modules/meet/call-recordings.service';
import { app, signedIn } from './helpers';

// LiveKit (the media server) is faked: these tests cover who may join, not audio and video.
const live = vi.hoisted(() => ({
  people: [] as LiveParticipant[],
  removed: [] as string[],
  muted: [] as string[],
  ended: [] as string[],
}));

vi.mock('@/modules/meet/livekit', () => ({
  livekit: {
    ensureRoom: vi.fn(async () => {}),
    participants: vi.fn(async () => live.people),
    token: vi.fn(async (code: string, identity: string, name: string) =>
      JSON.stringify({ code, identity, name }),
    ),
    mute: vi.fn(async (_code: string, _identity: string, sid: string) => {
      live.muted.push(sid);
    }),
    remove: vi.fn(async (_code: string, identity: string) => {
      live.removed.push(identity);
    }),
    end: vi.fn(async (code: string) => {
      live.ended.push(code);
    }),
  },
}));

// The recorder (LiveKit Egress) is faked too: jobs finish when told to.
const rec = vi.hoisted(() => ({
  jobs: new Map<string, { status: 'recording' | 'processing' | 'ready' | 'failed' }>(),
  next: 1,
}));

vi.mock('@/modules/meet/egress', () => ({
  recorder: {
    start: vi.fn(async () => {
      const egressId = `EG_${rec.next++}`;
      rec.jobs.set(egressId, { status: 'recording' });
      return {
        egressId,
        status: 'recording',
        durationSec: null,
        sizeBytes: null,
        error: null,
        limitReached: false,
      };
    }),
    stop: vi.fn(async (egressId: string) => {
      rec.jobs.set(egressId, { status: 'ready' });
    }),
    state: vi.fn(async (egressId: string) => {
      const job = rec.jobs.get(egressId);
      if (!job) return null;
      const done = job.status === 'ready';
      return {
        egressId,
        status: job.status,
        durationSec: done ? 95 : null,
        sizeBytes: done ? 12_000_000 : null,
        error: null,
        limitReached: false,
      };
    }),
  },
}));

function person(identity: string, name = 'Someone'): LiveParticipant {
  return {
    identity,
    name,
    tracks: [{ sid: `TR_${identity}`, source: 'microphone', muted: false }],
  };
}

async function newRoom() {
  const host = await signedIn('member');
  const res = await host.agent.post('/api/meet/rooms').send({ title: 'Strategy call' });
  expect(res.status).toBe(201);
  return { ...host, room: res.body as MeetRoomDto };
}

beforeEach(() => {
  live.people = [];
  live.removed = [];
  live.muted = [];
  live.ended = [];
  rec.jobs.clear();
});

describe('meet', () => {
  it('lets only team members create meetings, with Meet-style codes', async () => {
    expect((await request(app).post('/api/meet/rooms').send({})).status).toBe(401);

    const { agent, room } = await newRoom();
    expect(room.code).toMatch(/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/);
    expect(room.title).toBe('Strategy call');
    expect(room.quickAccess).toBe(false);

    const mine = await agent.get('/api/meet/rooms');
    expect((mine.body as MeetRoomDto[]).map((r) => r.code)).toContain(room.code);
  });

  it('shows anyone with the link who is in the call', async () => {
    const { room } = await newRoom();
    live.people = [person('u_1', 'Alvi')];

    const info = await request(app).get(`/api/meet/rooms/${room.code}`);
    expect(info.status).toBe(200);
    const body = info.body as MeetRoomInfoDto;
    expect(body.participants).toEqual(['Alvi']);
    expect(body.full).toBe(false);
    expect(body.maxParticipants).toBe(5);

    expect((await request(app).get('/api/meet/rooms/abc-defg-hij')).status).toBe(404);
    expect((await request(app).get('/api/meet/rooms/not-a-code')).status).toBe(404);
  });

  it('lets team members straight in as hosts', async () => {
    const { agent, room } = await newRoom();
    const res = await agent.post(`/api/meet/rooms/${room.code}/join`).send({ name: 'Ignored' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('admitted');
    expect(res.body.role).toBe('host');
    expect(JSON.parse(res.body.token).name).toBe('member user');
  });

  it('makes guests ask, and a host admits them', async () => {
    const { agent, room } = await newRoom();
    const ask = await request(app)
      .post(`/api/meet/rooms/${room.code}/join`)
      .send({ name: 'Nadia' });
    expect(ask.status).toBe(202);
    const requestId = ask.body.requestId as string;

    // Guests can't see or decide on requests.
    expect((await request(app).get(`/api/meet/rooms/${room.code}/requests`)).status).toBe(401);

    const waiting = await agent.get(`/api/meet/rooms/${room.code}/requests`);
    expect((waiting.body as MeetJoinRequestDto[]).map((r) => r.name)).toEqual(['Nadia']);

    const poll = await request(app).get(`/api/meet/rooms/${room.code}/requests/${requestId}`);
    expect(poll.body.status).toBe('pending');

    expect(
      (
        await agent
          .post(`/api/meet/rooms/${room.code}/requests/${requestId}/decision`)
          .send({ admit: true })
      ).status,
    ).toBe(204);

    const admitted = await request(app).get(`/api/meet/rooms/${room.code}/requests/${requestId}`);
    expect(admitted.body.status).toBe('admitted');
    expect(admitted.body.role).toBe('guest');
    const token = JSON.parse(admitted.body.token);
    expect(token.name).toBe('Nadia');

    // A refresh rejoins as the same person rather than a second copy.
    const again = await request(app).get(`/api/meet/rooms/${room.code}/requests/${requestId}`);
    expect(JSON.parse(again.body.token).identity).toBe(token.identity);
  });

  it('tells denied guests, and hides requests from other meetings', async () => {
    const { agent, room } = await newRoom();
    const other = await newRoom();
    const ask = await request(app)
      .post(`/api/meet/rooms/${room.code}/join`)
      .send({ name: 'Spammer' });
    const id = ask.body.requestId as string;

    expect(
      (await other.agent.get(`/api/meet/rooms/${other.room.code}/requests`)).body,
    ).toHaveLength(0);
    expect(
      (await request(app).get(`/api/meet/rooms/${other.room.code}/requests/${id}`)).status,
    ).toBe(404);

    await agent.post(`/api/meet/rooms/${room.code}/requests/${id}/decision`).send({ admit: false });
    const poll = await request(app).get(`/api/meet/rooms/${room.code}/requests/${id}`);
    expect(poll.body).toEqual({ status: 'denied' });
  });

  it('lets guests in without asking when quick access is on', async () => {
    const { agent, room } = await newRoom();
    const waiting = await request(app)
      .post(`/api/meet/rooms/${room.code}/join`)
      .send({ name: 'Early' });

    const res = await agent.patch(`/api/meet/rooms/${room.code}`).send({ quickAccess: true });
    expect(res.body.quickAccess).toBe(true);

    // Whoever was already waiting gets in too.
    const early = await request(app).get(
      `/api/meet/rooms/${room.code}/requests/${waiting.body.requestId}`,
    );
    expect(early.body.status).toBe('admitted');

    const guest = await request(app)
      .post(`/api/meet/rooms/${room.code}/join`)
      .send({ name: 'Rafi' });
    expect(guest.status).toBe(200);
    expect(guest.body.status).toBe('admitted');

    expect(
      (await request(app).patch(`/api/meet/rooms/${room.code}`).send({ quickAccess: false }))
        .status,
    ).toBe(401);
  });

  it('turns people away once 5 are in the call', async () => {
    const { agent, room } = await newRoom();
    live.people = ['a', 'b', 'c', 'd', 'e'].map((id) => person(id));

    const info = await request(app).get(`/api/meet/rooms/${room.code}`);
    expect(info.body.full).toBe(true);

    const guest = await request(app)
      .post(`/api/meet/rooms/${room.code}/join`)
      .send({ name: 'Sixth' });
    expect(guest.status).toBe(409);
    const host = await agent.post(`/api/meet/rooms/${room.code}/join`).send({ name: 'Host' });
    expect(host.status).toBe(409);
  });

  it('lets hosts mute, remove and end the call for everyone', async () => {
    const { agent, room } = await newRoom();
    live.people = [person('g_guest', 'Guest')];

    expect(
      (await request(app).post(`/api/meet/rooms/${room.code}/participants/g_guest/mute`).send({}))
        .status,
    ).toBe(401);

    await agent.post(`/api/meet/rooms/${room.code}/participants/g_guest/mute`).send({});
    expect(live.muted).toEqual(['TR_g_guest']);

    await agent.delete(`/api/meet/rooms/${room.code}/participants/g_guest`);
    expect(live.removed).toEqual(['g_guest']);

    await agent.post(`/api/meet/rooms/${room.code}/end`);
    expect(live.ended).toEqual([room.code]);
  });
});

describe('call recordings', () => {
  it('lets hosts record, and tells everyone in the call', async () => {
    const { agent, room } = await newRoom();
    const state = () => request(app).get(`/api/meet/rooms/${room.code}/recording`);
    expect((await state()).body.active).toBe(false);

    // Guests can't start or stop recordings.
    expect((await request(app).post(`/api/meet/rooms/${room.code}/recording`)).status).toBe(401);

    const started = await agent.post(`/api/meet/rooms/${room.code}/recording`);
    expect(started.status).toBe(201);
    expect((await state()).body).toMatchObject({ active: true, startedByName: 'member user' });

    // One recording at a time.
    expect((await agent.post(`/api/meet/rooms/${room.code}/recording`)).status).toBe(409);

    const stopped = await agent.delete(`/api/meet/rooms/${room.code}/recording`);
    expect(stopped.body.active).toBe(false);
  });

  it('lists recordings in the admin, and only admins can delete them', async () => {
    const { agent, room } = await newRoom();
    await agent.post(`/api/meet/rooms/${room.code}/recording`);
    await agent.delete(`/api/meet/rooms/${room.code}/recording`);

    const viewer = await signedIn('viewer');
    const list = await viewer.agent.get('/api/call-recordings');
    expect(list.status).toBe(200);
    const mine = (list.body as CallRecordingDto[]).find((r) => r.code === room.code)!;
    expect(mine).toMatchObject({ status: 'ready', title: 'Strategy call', durationSec: 95 });

    // The test has no real video file on disk.
    expect((await viewer.agent.get(`/api/call-recordings/${mine.id}/file`)).status).toBe(404);

    expect((await request(app).get('/api/call-recordings')).status).toBe(401);
    expect((await agent.delete(`/api/call-recordings/${mine.id}`)).status).toBe(403);
    const admin = await signedIn('admin');
    expect((await admin.agent.delete(`/api/call-recordings/${mine.id}`)).status).toBe(204);
    const after = await viewer.agent.get('/api/call-recordings');
    expect((after.body as CallRecordingDto[]).some((r) => r.id === mine.id)).toBe(false);
  });

  it('stops the recording when a host ends the call for everyone', async () => {
    const { agent, room } = await newRoom();
    await agent.post(`/api/meet/rooms/${room.code}/recording`);
    await agent.post(`/api/meet/rooms/${room.code}/end`);
    const state = await request(app).get(`/api/meet/rooms/${room.code}/recording`);
    expect(state.body.active).toBe(false);
  });

  it('stops recording a call that has gone quiet for 10 minutes', async () => {
    const { agent, room } = await newRoom();
    const state = () => request(app).get(`/api/meet/rooms/${room.code}/recording`);
    live.people = [person('u_host', 'Host'), person('g_client', 'Client')];
    await agent.post(`/api/meet/rooms/${room.code}/recording`);
    const t0 = Date.now();
    const at = (min: number) => new Date(t0 + min * 60_000);

    // Two people talking: keeps recording.
    await callRecordingsService.stopIdle(at(1));
    expect((await state()).body.active).toBe(true);

    // The client leaves; the host stays (forgot the laptop open).
    live.people = [person('u_host', 'Host')];
    await callRecordingsService.stopIdle(at(2)); // quiet from here
    await callRecordingsService.stopIdle(at(11)); // 9 minutes: not yet
    expect((await state()).body.active).toBe(true);

    // Someone comes back for a moment: the clock starts again.
    live.people = [person('u_host', 'Host'), person('g_client', 'Client')];
    await callRecordingsService.stopIdle(at(11.5));
    live.people = [person('u_host', 'Host')];
    await callRecordingsService.stopIdle(at(12));
    await callRecordingsService.stopIdle(at(21));
    expect((await state()).body.active).toBe(true);

    await callRecordingsService.stopIdle(at(22.5)); // 10.5 quiet minutes
    expect((await state()).body.active).toBe(false);

    const viewer = await signedIn('viewer');
    const list = (await viewer.agent.get('/api/call-recordings')).body as CallRecordingDto[];
    expect(list.find((r) => r.code === room.code)?.stopReason).toMatch(/fewer than two people/);
  });

  it('treats a call where every microphone is off as quiet', async () => {
    const { agent, room } = await newRoom();
    const muted = (id: string) => ({
      ...person(id),
      tracks: [{ sid: `TR_${id}`, source: 'microphone' as const, muted: true }],
    });
    live.people = [muted('a'), muted('b')];
    await agent.post(`/api/meet/rooms/${room.code}/recording`);
    const t0 = Date.now();
    await callRecordingsService.stopIdle(new Date(t0));
    await callRecordingsService.stopIdle(new Date(t0 + 10 * 60_000 + 1000));
    const state = await request(app).get(`/api/meet/rooms/${room.code}/recording`);
    expect(state.body.active).toBe(false);
  });
});
