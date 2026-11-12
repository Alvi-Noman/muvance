import { randomUUID } from 'node:crypto';
import { afterEach, describe, expect, it } from 'vitest';
import { hostTimeZone } from '@/config/booking';
import { collections } from '@/db/client';
import type { RecordingDoc } from '@/db/types';
import { signedIn } from './helpers';

const offsetMs = hostTimeZone.utcOffsetMinutes * 60_000;

/** A visit `daysAgo` days back at `hour` o'clock Dhaka time. */
function visitAt(hour: number, daysAgo = 1): RecordingDoc {
  const day = new Date(Date.now() - daysAgo * 86_400_000 + offsetMs);
  const startedAt = new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), hour, 15) - offsetMs,
  );
  return {
    _id: randomUUID(),
    visitorId: randomUUID(),
    visitNumber: 1,
    leadId: null,
    booked: false,
    startedAt,
    lastEventAt: startedAt,
    durationMs: 0,
    pages: ['/'],
    landingUrl: 'https://muvance.com/',
    referrer: '',
    source: { label: 'Direct', fromAd: false, campaign: null },
    device: { type: 'mobile', browser: 'Chrome', os: 'Android', width: 390, height: 844 },
    chunkCount: 0,
    bytes: 0,
    expiresAt: new Date(Date.now() + 30 * 86_400_000),
  };
}

afterEach(async () => {
  await collections.recordings().deleteMany({});
});

describe('visitors by time of day', () => {
  it('counts visits per hour in Dhaka time and finds the busiest stretch', async () => {
    await collections.recordings().insertMany([
      visitAt(9),
      visitAt(20),
      visitAt(21),
      visitAt(21),
      visitAt(22),
      visitAt(20, 20), // outside the last 7 days
    ]);
    const { agent } = await signedIn('viewer');

    const week = await agent.get('/api/dashboard/visitors');
    expect(week.status).toBe(200);
    expect(week.body.total).toBe(5);
    expect(week.body.byHour[9]).toBe(1);
    expect(week.body.byHour[21]).toBe(2);
    expect(week.body.busiest).toEqual({ startHour: 20, count: 4 });

    const month = await agent.get('/api/dashboard/visitors').query({ days: 30 });
    expect(month.body.total).toBe(6);
    expect(month.body.byHour[20]).toBe(2);
  });

  it('finds a busy stretch that runs past midnight', async () => {
    await collections.recordings().insertMany([visitAt(23), visitAt(0), visitAt(1), visitAt(12)]);
    const { agent } = await signedIn('viewer');
    const res = await agent.get('/api/dashboard/visitors');
    expect(res.body.busiest).toEqual({ startHour: 23, count: 3 });
  });

  it('only allows 7 or 30 days', async () => {
    const { agent } = await signedIn('viewer');
    expect((await agent.get('/api/dashboard/visitors').query({ days: 5 })).status).toBe(400);
  });
});
