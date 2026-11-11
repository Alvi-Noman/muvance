import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { defaultAvailability, hostTimeZone } from '@/config/booking';
import { collections, getDb, migrate } from '@/db/client';
import { app, bookingDetails, openSlots, signedIn } from './helpers';

const offsetMs = hostTimeZone.utcOffsetMinutes * 60_000;
const hostTime = (iso: string) => new Date(Date.parse(iso) + offsetMs);
/** A slot's date ("YYYY-MM-DD") and minute of the day, in host time. */
const hostParts = (iso: string) => {
  const t = hostTime(iso);
  return { date: t.toISOString().slice(0, 10), minute: t.getUTCHours() * 60 + t.getUTCMinutes() };
};

afterEach(async () => {
  await collections.blockedTimes().deleteMany({});
});

describe('blocked times', () => {
  it('blocks a whole day, and unblocks it when removed', async () => {
    const { agent } = await signedIn('admin');
    const [slot] = await openSlots();
    const { date } = hostParts(slot!);

    const res = await agent
      .post('/api/settings/blocked-times')
      .send({ startDate: date, endDate: date, from: null, to: null, note: 'Holiday' });
    expect(res.status).toBe(201);
    expect(res.body.alreadyBooked).toBe(0);
    expect((await openSlots()).some((s) => hostParts(s).date === date)).toBe(false);

    // Booking a blocked time directly is refused too.
    const booking = await request(app)
      .post('/api/bookings')
      .send({ ...bookingDetails, phone: '01744440001', startsAt: slot });
    expect(booking.status).toBe(409);

    const list = await agent.get('/api/settings/blocked-times');
    expect(list.body.blockedTimes).toHaveLength(1);
    const del = await agent.delete(`/api/settings/blocked-times/${res.body.blockedTime.id}`);
    expect(del.status).toBe(204);
    expect(await openSlots()).toContain(slot);
  });

  it('blocks only the chosen hours on a date', async () => {
    const { agent } = await signedIn('admin');
    const slots = await openSlots();
    const { date, minute } = hostParts(slots[0]!);
    const sameDay = slots.filter((s) => hostParts(s).date === date);

    await agent
      .post('/api/settings/blocked-times')
      .send({ startDate: date, endDate: date, from: minute, to: minute + 60 });
    const after = await openSlots();
    expect(after).not.toContain(slots[0]);
    expect(after.filter((s) => hostParts(s).date === date)).toHaveLength(sameDay.length - 1);
  });

  it('reports calls already booked in a new block, and keeps them', async () => {
    const { agent } = await signedIn('admin');
    const [slot] = await openSlots();
    const { date } = hostParts(slot!);
    await request(app)
      .post('/api/bookings')
      .send({ ...bookingDetails, phone: '01744440002', startsAt: slot });

    const res = await agent
      .post('/api/settings/blocked-times')
      .send({ startDate: date, endDate: date, from: null, to: null });
    expect(res.body.alreadyBooked).toBe(1);
    expect(
      await collections
        .meetings()
        .countDocuments({ startsAt: new Date(slot!), status: 'scheduled' }),
    ).toBe(1);
  });

  it('rejects muddled blocks and lets only managers block time', async () => {
    const { agent } = await signedIn('admin');
    const bad = await agent
      .post('/api/settings/blocked-times')
      .send({ startDate: '2030-01-02', endDate: '2030-01-01', from: null, to: null });
    expect(bad.status).toBe(400);
    const halfTime = await agent
      .post('/api/settings/blocked-times')
      .send({ startDate: '2030-01-01', endDate: '2030-01-01', from: 600, to: null });
    expect(halfTime.status).toBe(400);

    const { agent: member } = await signedIn('member');
    const res = await member
      .post('/api/settings/blocked-times')
      .send({ startDate: '2030-01-01', endDate: '2030-01-01', from: null, to: null });
    expect(res.status).toBe(403);
  });
});

describe('weekly hours', () => {
  it('uses different hours on different days', async () => {
    const { agent } = await signedIn('admin');
    const weekly = defaultAvailability.weekly.map((d, day) =>
      day === 0 ? { open: true, firstStart: 9 * 60 + 30, lastStart: 10 * 60 + 30 } : d,
    );
    await agent.put('/api/settings/availability').send({ ...defaultAvailability, weekly });

    for (const slot of await openSlots()) {
      const t = hostTime(slot);
      const { minute } = hostParts(slot);
      if (t.getUTCDay() === 0) expect([570, 630]).toContain(minute);
      else expect(minute).toBeGreaterThanOrEqual(11 * 60);
    }
    await agent.put('/api/settings/availability').send(defaultAvailability);
  });

  it('turns booking hours saved in the old format into weekly hours', async () => {
    const settings = getDb().collection<{ _id: string; availability: object }>('settings');
    await settings.updateOne(
      { _id: 'booking' },
      {
        $set: {
          availability: {
            workingDays: [1, 3],
            firstStartHour: 10,
            lastStartHour: 16,
            slotIntervalMinutes: 60,
            durationMinutes: 30,
            daysAhead: 30,
            minNoticeHours: 3,
          },
        },
      },
      { upsert: true },
    );
    await migrate(getDb());
    const doc = await collections.settings().findOne({ _id: 'booking' });
    expect(doc?.availability.weekly[1]).toEqual({ open: true, firstStart: 600, lastStart: 960 });
    expect(doc?.availability.weekly[2]?.open).toBe(false);
    expect(doc?.availability).not.toHaveProperty('workingDays');
    await collections.settings().deleteOne({ _id: 'booking' });
  });
});
