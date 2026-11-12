import { randomUUID } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { collections } from '@/db/client';
import {
  parseDevice,
  parseSource,
  recordingsService,
} from '@/modules/recordings/recordings.service';
import { app, bookingDetails, openSlots, signedIn } from './helpers';

const BROWSER =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Mobile Safari/537.36';

async function startVisit(visitorId = randomUUID(), landingUrl = 'https://muvance.com/') {
  const id = randomUUID();
  const res = await request(app)
    .post('/api/visits')
    .set('User-Agent', BROWSER)
    .send({ id, visitorId, landingUrl, referrer: '', width: 390, height: 844 });
  expect(res.status).toBe(204);
  return { id, visitorId };
}

function upload(id: string, events: object[], seq = 0, path = '/') {
  const ts = events.map((e) => (e as { timestamp: number }).timestamp);
  return request(app)
    .post(`/api/visits/${id}/chunks`)
    .query({ seq, start: Math.min(...ts), end: Math.max(...ts), path, encoding: 'gzip' })
    .set('Content-Type', 'application/octet-stream')
    .send(gzipSync(JSON.stringify(events)));
}

afterEach(async () => {
  await collections.recordings().deleteMany({});
  await collections.recordingChunks().deleteMany({});
});

describe('session recordings', () => {
  it('stores a visit in pieces and plays it back as one list of events', async () => {
    const { id } = await startVisit();
    const t = 1_800_000_000_000;
    expect(
      (
        await upload(id, [
          { type: 4, timestamp: t },
          { type: 2, timestamp: t + 10 },
        ])
      ).status,
    ).toBe(204);
    expect((await upload(id, [{ type: 3, timestamp: t + 42_000 }], 1, '/book')).status).toBe(204);

    const { agent } = await signedIn('viewer');
    const list = await agent.get('/api/recordings');
    expect(list.body.total).toBe(1);
    expect(list.body.items[0]).toMatchObject({
      id,
      pages: ['/', '/book'],
      durationMs: 42_000,
      device: { type: 'mobile', browser: 'Chrome', os: 'Android' },
      source: { label: 'Direct', fromAd: false },
      visitNumber: 1,
    });

    const events = await agent.get(`/api/recordings/${id}/events`);
    expect(events.body.map((e: { type: number }) => e.type)).toEqual([4, 2, 3]);
  });

  it('ignores bots and refuses pieces for unknown visits', async () => {
    await request(app).post('/api/visits').set('User-Agent', 'Googlebot/2.1').send({
      id: randomUUID(),
      visitorId: randomUUID(),
      landingUrl: 'https://muvance.com/',
      width: 1,
      height: 1,
    });
    expect(await collections.recordings().countDocuments()).toBe(0);
    expect((await upload(randomUUID(), [{ type: 4, timestamp: 1 }])).status).toBe(404);
  });

  it("links all of a visitor's visits to the lead when they book", async () => {
    const visitorId = randomUUID();
    const first = await startVisit(visitorId);
    await upload(first.id, [{ type: 4, timestamp: 1_800_000_000_000 }]);
    const second = await startVisit(visitorId);
    await upload(second.id, [{ type: 4, timestamp: 1_800_000_100_000 }]);

    const [slot] = await openSlots();
    const res = await request(app)
      .post('/api/bookings')
      .send({
        ...bookingDetails,
        phone: '01755550001',
        startsAt: slot,
        visitorId,
        recordingId: second.id,
      });
    expect(res.status).toBe(201);
    expect(res.body).not.toHaveProperty('leadId');

    const lead = await collections.leads().findOne({ phoneKey: '1755550001' });
    const { agent } = await signedIn('viewer');
    const list = await agent.get('/api/recordings').query({ leadId: lead!._id.toHexString() });
    expect(list.body.total).toBe(2);
    const byId = Object.fromEntries(
      list.body.items.map((r: { id: string; booked: boolean }) => [r.id, r]),
    );
    expect(byId[second.id]).toMatchObject({
      booked: true,
      visitNumber: 2,
      lead: { name: 'Sam Rahman' },
    });
    expect(byId[first.id]).toMatchObject({ booked: false, visitNumber: 1 });

    const booked = await agent.get('/api/recordings').query({ filter: 'booked' });
    expect(booked.body.items.map((r: { id: string }) => r.id)).toEqual([second.id]);

    // A later visit from the same browser is linked straight away.
    const third = await startVisit(visitorId);
    expect((await collections.recordings().findOne({ _id: third.id }))?.leadId).toEqual(lead!._id);
  });

  it('stops storing a visit once it reaches its size limit', async () => {
    const { id } = await startVisit();
    await collections.recordings().updateOne({ _id: id }, { $set: { bytes: 20 * 1024 * 1024 } });
    const res = await upload(id, [{ type: 3, timestamp: 1_800_000_000_000 }]);
    expect(res.status).toBe(204);
    expect(res.headers['x-recording']).toBe('stop');
    expect(await collections.recordingChunks().countDocuments({ recordingId: id })).toBe(0);
  });

  it('only lets signed-in staff watch, and only managers delete', async () => {
    const { id } = await startVisit();
    await upload(id, [{ type: 4, timestamp: 1_800_000_000_000 }]);
    expect((await request(app).get('/api/recordings')).status).toBe(401);

    const { agent: member } = await signedIn('member');
    expect((await member.delete(`/api/recordings/${id}`)).status).toBe(403);
    const { agent: admin } = await signedIn('admin');
    expect((await admin.delete(`/api/recordings/${id}`)).status).toBe(204);
    expect(await collections.recordingChunks().countDocuments({ recordingId: id })).toBe(0);
  });

  it('keeps visits that did not become leads under the storage cap, oldest deleted first', async () => {
    const old = await startVisit();
    const recent = await startVisit();
    await upload(old.id, [{ type: 4, timestamp: 1 }]);
    await upload(recent.id, [{ type: 4, timestamp: 2 }]);
    // Pretend each is 200 MB (the cap is 300 MB).
    await collections
      .recordings()
      .updateOne({ _id: old.id }, { $set: { bytes: 200 * 1024 * 1024, startedAt: new Date(1) } });
    await collections
      .recordings()
      .updateOne({ _id: recent.id }, { $set: { bytes: 200 * 1024 * 1024 } });

    await recordingsService.cleanUp();
    expect(await collections.recordings().findOne({ _id: old.id })).toBeNull();
    expect(await collections.recordings().findOne({ _id: recent.id })).not.toBeNull();
  });
});

describe('visit details', () => {
  it('recognises Meta ads, social, search and direct visits', () => {
    expect(
      parseSource(
        'https://muvance.com/?utm_source=facebook&utm_medium=paid&utm_campaign=Leads&fbclid=x',
        '',
      ),
    ).toEqual({ label: 'Meta ad', fromAd: true, campaign: 'Leads' });
    expect(parseSource('https://muvance.com/?fbclid=x', 'https://l.facebook.com/')).toMatchObject({
      label: 'Facebook',
      fromAd: false,
    });
    expect(parseSource('https://muvance.com/', 'https://www.google.com/').label).toBe('Google');
    expect(parseSource('https://muvance.com/', '').label).toBe('Direct');
  });

  it('recognises devices and in-app browsers', () => {
    expect(
      parseDevice(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 [FBAN/FBIOS;FBAV/480.0]',
      ),
    ).toEqual({ type: 'mobile', browser: 'Facebook app', os: 'iOS' });
    expect(
      parseDevice(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36',
      ),
    ).toEqual({ type: 'desktop', browser: 'Chrome', os: 'Windows' });
  });
});
