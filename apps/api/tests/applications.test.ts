import request from 'supertest';
import { describe, expect, it } from 'vitest';
import type { ApplicationDto } from '@muvance/shared';
import { app, signedIn } from './helpers';

const BROWSER = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36';

const investment = {
  type: 'investment',
  name: 'Nadia Karim',
  phone: '01712345678',
  businessName: 'Gaach Organics',
  website: 'facebook.com/gaach',
  category: 'Organic food',
  product: 'Cold-pressed mustard oil from our own farm. Customers reorder every month.',
  monthlySales: '3 lac',
  sellingSince: '2024',
  needs: ['inventory', 'ads'],
};

const training = {
  type: 'training',
  name: 'Rafi Ahmed',
  phone: '+880 1811-223344',
  role: 'media-buyer',
  level: 'some',
  goal: 'Scaling past 50k a day',
};

describe('applications', () => {
  it('saves investment and training applications from the website', async () => {
    expect(
      (await request(app).post('/api/applications').set('User-Agent', BROWSER).send(investment))
        .status,
    ).toBe(201);
    expect(
      (await request(app).post('/api/applications').set('User-Agent', BROWSER).send(training))
        .status,
    ).toBe(201);

    const { agent } = await signedIn('viewer');
    const list = await agent.get('/api/admin/applications');
    expect(list.status).toBe(200);
    const items = list.body.items as ApplicationDto[];
    const inv = items.find((i) => i.name === 'Nadia Karim')!;
    expect(inv.type).toBe('investment');
    expect(inv.status).toBe('new');
    expect(inv.details).toContainEqual({ label: 'Monthly sales', value: '3 lac Taka' });
    expect(inv.details).toContainEqual({
      label: 'Needs help with',
      value: 'Stock and production, Ad spend',
    });
    const tr = items.find((i) => i.name === 'Rafi Ahmed')!;
    expect(tr.details).toContainEqual({ label: 'Who they are', value: 'I run ads for clients' });
  });

  it('rejects incomplete forms with field messages', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('User-Agent', BROWSER)
      .send({ ...investment, product: 'Oil', needs: [] });
    expect(res.status).toBe(400);
  });

  it('lets the team update status, and only admins delete', async () => {
    await request(app)
      .post('/api/applications')
      .set('User-Agent', BROWSER)
      .send({ ...training, name: 'Status Test' });
    const { agent: member } = await signedIn('member');
    const items = (await member.get('/api/admin/applications')).body.items as ApplicationDto[];
    const id = items.find((i) => i.name === 'Status Test')!.id;

    const updated = await member
      .patch(`/api/admin/applications/${id}`)
      .send({ status: 'contacted' });
    expect(updated.body.status).toBe('contacted');
    expect((await member.delete(`/api/admin/applications/${id}`)).status).toBe(403);

    const { agent: admin } = await signedIn('admin');
    expect((await admin.delete(`/api/admin/applications/${id}`)).status).toBe(204);
  });

  it('keeps the list private', async () => {
    expect((await request(app).get('/api/admin/applications')).status).toBe(401);
  });
});
