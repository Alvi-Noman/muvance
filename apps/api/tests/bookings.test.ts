import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { defaultAvailability, hostTimeZone } from '@/config/booking';
import { collections } from '@/db/client';
import { app, bookingDetails, openSlots, signedIn } from './helpers';

const offsetMs = hostTimeZone.utcOffsetMinutes * 60_000;
const hostTime = (iso: string) => new Date(Date.parse(iso) + offsetMs);

describe('public booking', () => {
  it('offers on-the-hour slots inside working hours on working days', async () => {
    const slots = await openSlots();
    expect(slots.length).toBeGreaterThan(0);
    expect([...slots].sort()).toEqual(slots);
    for (const slot of slots) {
      const host = hostTime(slot);
      expect(defaultAvailability.workingDays).toContain(host.getUTCDay());
      expect(host.getUTCMinutes()).toBe(0);
      expect(host.getUTCHours()).toBeGreaterThanOrEqual(defaultAvailability.firstStartHour);
      expect(host.getUTCHours()).toBeLessThanOrEqual(defaultAvailability.lastStartHour);
    }
  });

  it('creates a lead, a meeting and timeline entries, and removes the slot', async () => {
    const [slot] = await openSlots();
    const res = await request(app)
      .post('/api/bookings')
      .send({ ...bookingDetails, phone: '+880 1811-111111', startsAt: slot, message: 'Hi!' });
    expect(res.status).toBe(201);

    const lead = await collections.leads().findOne({ phoneKey: '1811111111' });
    expect(lead).toMatchObject({
      stage: 'discovery_booked',
      source: 'website',
      businessName: 'Brand Co',
      nextMeetingType: 'discovery',
    });
    expect(lead?.nextMeetingAt?.toISOString()).toBe(slot);
    const activities = await collections.activities().find({ leadId: lead!._id }).toArray();
    expect(activities.map((a) => a.type).sort()).toEqual(['created', 'meeting_booked']);
    expect(await openSlots()).not.toContain(slot);
  });

  it('attaches repeat bookings from the same phone (any format) to the same lead', async () => {
    const slots = await openSlots();
    await request(app)
      .post('/api/bookings')
      .send({ ...bookingDetails, phone: '+880 1922-222222', startsAt: slots[0] });
    await request(app)
      .post('/api/bookings')
      .send({ ...bookingDetails, phone: '01922222222', startsAt: slots[1] });
    expect(await collections.leads().countDocuments({ phoneKey: '1922222222' })).toBe(1);
    const lead = await collections.leads().findOne({ phoneKey: '1922222222' });
    expect(await collections.meetings().countDocuments({ leadId: lead!._id })).toBe(2);
  });

  it('never double-books a slot', async () => {
    const [slot] = await openSlots();
    const results = await Promise.all(
      [1, 2, 3].map((n) =>
        request(app)
          .post('/api/bookings')
          .send({ ...bookingDetails, phone: `0171000000${n}`, startsAt: slot }),
      ),
    );
    expect(results.map((r) => r.status).sort()).toEqual([201, 409, 409]);
  });

  it('rejects times that were never offered and missing fields', async () => {
    const bad = await request(app)
      .post('/api/bookings')
      .send({ ...bookingDetails, startsAt: '2020-01-01T05:00:00.000Z' });
    expect(bad.status).toBe(409);
    const [slot] = await openSlots();
    const missing = await request(app)
      .post('/api/bookings')
      .send({ ...bookingDetails, startsAt: slot, website: '' });
    expect(missing.status).toBe(400);
    for (const website of ['my shop', 'n/a', 'brand', 'ftp://brand.com']) {
      const invalid = await request(app)
        .post('/api/bookings')
        .send({ ...bookingDetails, startsAt: slot, website });
      expect(invalid.status, website).toBe(400);
    }
  });

  it('saves monthly sales in taka, without doubling a currency they typed', async () => {
    const [a, b] = await openSlots();
    await request(app)
      .post('/api/bookings')
      .send({ ...bookingDetails, phone: '01734440001', monthlySales: '50 lac', startsAt: a });
    await request(app)
      .post('/api/bookings')
      .send({ ...bookingDetails, phone: '01734440002', monthlySales: '50,00,000 tk', startsAt: b });
    const saved = await collections
      .leads()
      .find({ phoneKey: { $in: ['1734440001', '1734440002'] } })
      .sort({ phoneKey: 1 })
      .toArray();
    expect(saved.map((l) => l.monthlySales)).toEqual(['50 lac Taka', '50,00,000 tk']);
  });

  it('cancelling a call frees its slot', async () => {
    const [slot] = await openSlots();
    await request(app)
      .post('/api/bookings')
      .send({ ...bookingDetails, phone: '01733333333', startsAt: slot });
    const meeting = await collections.meetings().findOne({ startsAt: new Date(slot!) });

    const { agent } = await signedIn('member');
    const res = await agent.patch(`/api/meetings/${meeting!._id}`).send({ status: 'cancelled' });
    expect(res.status).toBe(200);
    expect(await openSlots()).toContain(slot);
  });

  it('re-opens a lost lead when they book again (e.g. after a no-show)', async () => {
    const slots = await openSlots();
    await request(app)
      .post('/api/bookings')
      .send({ ...bookingDetails, phone: '01744440000', startsAt: slots[0] });
    const lead = await collections.leads().findOne({ phoneKey: '1744440000' });
    const meeting = await collections.meetings().findOne({ leadId: lead!._id });

    const { agent } = await signedIn('member');
    await agent.patch(`/api/meetings/${meeting!._id}`).send({ status: 'no_show' });
    await agent.patch(`/api/leads/${lead!._id}`).send({ stage: 'lost', lostReason: 'no_show' });

    const rebook = await request(app)
      .post('/api/bookings')
      .send({ ...bookingDetails, phone: '01744440000', startsAt: slots[1] });
    expect(rebook.status).toBe(201);
    const after = await collections.leads().findOne({ _id: lead!._id });
    expect(after).toMatchObject({ stage: 'discovery_booked', lostReason: null });
  });

  it('hides website slots that overlap a meeting you scheduled yourself', async () => {
    const [slot] = await openSlots();
    const { agent } = await signedIn('member');
    const lead = await agent.post('/api/leads').send({ name: 'Manual', phone: '01722220000' });
    // A proposal meeting starting 15 minutes into the slot.
    const res = await agent.post(`/api/leads/${lead.body.id}/meetings`).send({
      type: 'proposal',
      startsAt: new Date(Date.parse(slot!) + 15 * 60_000).toISOString(),
    });
    expect(res.status).toBe(201);
    expect(await openSlots()).not.toContain(slot);
  });

  it('shows a booked time as taken until the lead is disqualified, which frees it', async () => {
    const [slot] = await openSlots();
    const booked = await request(app)
      .post('/api/bookings')
      .send({ ...bookingDetails, phone: '01735550001', startsAt: slot });
    expect(booked.status).toBe(201);

    const taken = (await request(app).get('/api/availability')).body;
    expect(taken.slots).not.toContain(slot);
    expect(taken.bookedSlots).toContain(slot);
    // Nobody else can take it, and the public response says nothing about who has it.
    const second = await request(app)
      .post('/api/bookings')
      .send({ ...bookingDetails, phone: '01735550002', startsAt: slot });
    expect(second.status).toBe(409);
    expect(JSON.stringify(taken)).not.toContain('01735550001');

    const { agent } = await signedIn('member');
    const lead = await collections.leads().findOne({ phoneKey: '1735550001' });
    const id = lead!._id.toHexString();
    const lost = await agent
      .patch(`/api/leads/${id}`)
      .send({ stage: 'lost', lostReason: 'too_small' });
    expect(lost.status).toBe(200);

    const freed = (await request(app).get('/api/availability')).body;
    expect(freed.slots).toContain(slot);
    expect(freed.bookedSlots).not.toContain(slot);

    // It leaves the main list, but is still there under Lost and in search.
    const ids = async (query: Record<string, string>) =>
      (await agent.get('/api/leads').query({ pageSize: 200, ...query })).body.items.map(
        (l: { id: string }) => l.id,
      );
    expect(await ids({ excludeLost: 'true' })).not.toContain(id);
    expect(await ids({ stage: 'lost' })).toContain(id);
    expect(await ids({})).toContain(id);

    // And someone else can now book that time.
    const rebooked = await request(app)
      .post('/api/bookings')
      .send({ ...bookingDetails, phone: '01735550003', startsAt: slot });
    expect(rebooked.status).toBe(201);
  });

  it('follows availability settings changed by an admin', async () => {
    const { agent } = await signedIn('admin');
    const res = await agent.put('/api/settings/availability').send({
      ...defaultAvailability,
      workingDays: [5],
      firstStartHour: 15,
      lastStartHour: 15,
    });
    expect(res.status).toBe(200);
    const slots = await openSlots();
    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) {
      expect(hostTime(slot).getUTCDay()).toBe(5);
      expect(hostTime(slot).getUTCHours()).toBe(15);
    }
    await agent.put('/api/settings/availability').send(defaultAvailability);
  });
});
