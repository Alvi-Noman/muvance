import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { collections } from '@/db/client';
import { devicesService, pushSender } from '@/modules/devices/devices.service';
import { app, bookingDetails, createUser, openSlots, signedIn } from './helpers';

const token = (name: string) => `${name}-${'x'.repeat(40)}`;

describe('push notifications for new leads', () => {
  afterEach(() => vi.restoreAllMocks());

  it('needs a session, and a phone belongs to whoever signed in last', async () => {
    expect(
      (
        await request(app)
          .post('/api/devices')
          .send({ token: token('anon') })
      ).status,
    ).toBe(401);

    const { agent: first, user: one } = await signedIn('member');
    const { agent: second, user: two } = await signedIn('viewer');
    expect((await first.post('/api/devices').send({ token: token('phone') })).status).toBe(204);
    expect((await first.post('/api/devices').send({ token: 'short' })).status).toBe(400);
    const owner = async () =>
      (await collections.devices().findOne({ token: token('phone') }))?.userId.toHexString();
    expect(await owner()).toBe(one._id.toHexString());

    await second.post('/api/devices').send({ token: token('phone') });
    expect(await owner()).toBe(two._id.toHexString());
    expect(await collections.devices().countDocuments({ token: token('phone') })).toBe(1);

    // Only the phone's current owner can remove it.
    await first.post('/api/devices/unregister').send({ token: token('phone') });
    expect(await owner()).toBe(two._id.toHexString());
    await second.post('/api/devices/unregister').send({ token: token('phone') });
    expect(await owner()).toBeUndefined();
  });

  it('alerts active teammates when someone books, without leaking the token', async () => {
    const send = vi.spyOn(pushSender, 'send').mockResolvedValue([]);
    const { agent: active } = await signedIn('member');
    await active.post('/api/devices').send({ token: token('active') });
    const { agent: gone, user: goneUser } = await signedIn('member');
    await gone.post('/api/devices').send({ token: token('disabled') });
    await collections.users().updateOne({ _id: goneUser._id }, { $set: { status: 'disabled' } });

    const [slot] = await openSlots();
    const booked = await request(app)
      .post('/api/bookings')
      .send({ ...bookingDetails, phone: '01736660001', startsAt: slot });
    expect(booked.status).toBe(201);
    expect(JSON.stringify(booked.body)).not.toContain('xxxx');

    await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(1));
    const [tokens, message] = send.mock.calls[0]!;
    expect(tokens).toContain(token('active'));
    expect(tokens).not.toContain(token('disabled'));
    expect(message.title).toBe('New lead');
    const when = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dhaka',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(slot!));
    expect(message.body).toBe(
      `${bookingDetails.website} · ${bookingDetails.monthlySales} · ${when}`,
    );
    expect(message.body).not.toContain(bookingDetails.name);
    const lead = await collections.leads().findOne({ phoneKey: '1736660001' });
    expect(message.leadId).toBe(lead!._id.toHexString());
  });

  it('removes dead phones, and a push failure never affects a booking', async () => {
    const user = await createUser('member');
    const now = new Date();
    const add = (t: string) =>
      collections
        .devices()
        .updateOne(
          { token: t },
          { $set: { userId: user._id, updatedAt: now }, $setOnInsert: { createdAt: now } },
          { upsert: true },
        );
    await add(token('alive'));
    await add(token('dead'));

    const lead = {
      id: 'lead-1',
      website: 'a.com',
      monthlySales: '5 lac Taka',
      startsAt: new Date(),
    };
    vi.spyOn(pushSender, 'send').mockResolvedValue([token('dead')]);
    await devicesService.notifyNewLead(lead);
    expect(await collections.devices().countDocuments({ token: token('dead') })).toBe(0);
    expect(await collections.devices().countDocuments({ token: token('alive') })).toBe(1);

    const failing = vi.spyOn(pushSender, 'send').mockRejectedValue(new Error('FCM is down'));
    await expect(devicesService.notifyNewLead(lead)).resolves.toBeUndefined();

    const [slot] = await openSlots();
    const booked = await request(app)
      .post('/api/bookings')
      .send({ ...bookingDetails, phone: '01736660002', startsAt: slot });
    expect(booked.status).toBe(201);
    await vi.waitFor(() => expect(failing).toHaveBeenCalled());
  });
});
