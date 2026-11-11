import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { normalizePhone } from '@/modules/meta/meta.service';
import { app, bookingDetails, openSlots } from './helpers';

describe('Meta tracking', () => {
  it('writes Bangladeshi phones with the 880 country code', () => {
    expect(normalizePhone('01712-345678')).toBe('8801712345678');
    expect(normalizePhone('+880 1712 345678')).toBe('8801712345678');
    expect(normalizePhone('1712345678')).toBe('8801712345678');
    expect(normalizePhone('+44 20 7946 0958')).toBe('442079460958');
  });

  it('accepts page events from the website', async () => {
    const res = await request(app)
      .post('/api/meta/events')
      .send({ eventName: 'PageView', eventId: 'abc12345-xyz', url: 'https://muvance.com/' });
    expect(res.status).toBe(204);
  });

  it('refuses lead events, which only a real booking can send', async () => {
    const res = await request(app)
      .post('/api/meta/events')
      .send({ eventName: 'Lead', eventId: 'abc12345-xyz', url: 'https://muvance.com/book' });
    expect(res.status).toBe(400);
  });

  it('accepts a booking that carries a Pixel event id', async () => {
    const [slot] = await openSlots();
    const res = await request(app)
      .post('/api/bookings')
      .send({
        ...bookingDetails,
        phone: '01733-333333',
        startsAt: slot,
        eventId: '0f8b3c1e-2d4a-4b6c-9e7f-123456789abc',
      });
    expect(res.status).toBe(201);
  });
});
