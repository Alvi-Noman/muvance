import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { collections } from '@/db/client';
import { app, bookingDetails, openSlots, signedIn } from './helpers';

const BROWSER = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15';

const saveDraft = (fields: Record<string, unknown>) =>
  request(app).post('/api/booking-drafts').set('User-Agent', BROWSER).send(fields);

afterEach(async () => {
  await collections.unfinishedBookings().deleteMany({});
});

describe('unfinished bookings', () => {
  it('saves what people type, keeps the latest, and lists it for the team', async () => {
    const id = randomUUID();
    expect((await saveDraft({ id, phone: '01766-000001' })).status).toBe(204);
    await saveDraft({ id, phone: '01766-000001', name: 'Karim', businessName: 'Karim Store' });

    const { agent } = await signedIn('viewer');
    const res = await agent.get('/api/unfinished-bookings');
    expect(res.body.total).toBe(1);
    expect(res.body.items[0]).toMatchObject({
      id,
      name: 'Karim',
      phone: '01766-000001',
      businessName: 'Karim Store',
      existingLead: null,
    });
  });

  it('refuses drafts without a real phone number', async () => {
    expect((await saveDraft({ id: randomUUID(), phone: 'abc' })).status).toBe(400);
  });

  it('drops off the list when the person books after all', async () => {
    const visitorId = randomUUID();
    await saveDraft({ id: randomUUID(), visitorId, phone: '01766-000002', name: 'Lima' });
    const [slot] = await openSlots();
    // Booked with the number written differently: still recognised.
    await request(app)
      .post('/api/bookings')
      .send({ ...bookingDetails, phone: '+8801766000002', startsAt: slot });

    const { agent } = await signedIn('viewer');
    expect((await agent.get('/api/unfinished-bookings')).body.total).toBe(0);
    // Later typing in the same form doesn't put them back.
    const doc = await collections.unfinishedBookings().findOne({ visitorId });
    await saveDraft({ id: doc!._id, visitorId, phone: '01766-000002', name: 'Lima K' });
    expect((await agent.get('/api/unfinished-bookings')).body.total).toBe(0);
  });

  it('adds one to the leads, or points to the lead that already has the number', async () => {
    const { agent } = await signedIn('member');
    const id = randomUUID();
    await saveDraft({ id, phone: '01766-000003', name: 'Rafi', website: 'rafi.shop' });
    const added = await agent.post(`/api/unfinished-bookings/${id}/add-to-leads`);
    expect(added.status).toBe(200);
    const lead = await collections.leads().findOne({ phoneKey: '1766000003' });
    expect(lead).toMatchObject({
      name: 'Rafi',
      website: 'rafi.shop',
      tags: ['unfinished booking'],
    });
    expect(added.body.leadId).toBe(lead!._id.toHexString());

    // The same person again: no duplicate lead, and the list shows who they are.
    const again = randomUUID();
    await saveDraft({ id: again, phone: '017 6600 0003' });
    const list = await agent.get('/api/unfinished-bookings');
    expect(list.body.items[0].existingLead).toEqual({ id: added.body.leadId, name: 'Rafi' });
    await agent.post(`/api/unfinished-bookings/${again}/add-to-leads`);
    expect(await collections.leads().countDocuments({ phoneKey: '1766000003' })).toBe(1);
  });

  it('lets members remove entries, and viewers only look', async () => {
    const id = randomUUID();
    await saveDraft({ id, phone: '01766-000004' });
    const { agent: viewer } = await signedIn('viewer');
    expect((await viewer.delete(`/api/unfinished-bookings/${id}`)).status).toBe(403);
    const { agent: member } = await signedIn('member');
    expect((await member.delete(`/api/unfinished-bookings/${id}`)).status).toBe(204);
    expect((await member.get('/api/unfinished-bookings')).body.total).toBe(0);
  });
});
