import { describe, expect, it } from 'vitest';
import { calculateRoas } from '@muvance/shared';
import { signedIn } from './helpers';

const inHours = (hours: number) => new Date(Date.now() + hours * 60 * 60_000).toISOString();

describe('leads', () => {
  it('creates, searches, filters and paginates leads', async () => {
    const { agent } = await signedIn('member');
    for (const name of ['Alpha Foods', 'Beta Fashion', 'Gamma Tech']) {
      const res = await agent
        .post('/api/leads')
        .send({ name, phone: `01${Math.floor(1e8 + Math.random() * 9e8)}`, tags: ['vip'] });
      expect(res.status).toBe(201);
      expect(res.body.stage).toBe('discovery_booked');
    }

    const search = await agent.get('/api/leads').query({ q: 'fash' });
    expect(search.body.items.map((l: { name: string }) => l.name)).toEqual(['Beta Fashion']);

    const page = await agent.get('/api/leads').query({ tag: 'vip', pageSize: 2, sort: 'name' });
    expect(page.body.total).toBeGreaterThanOrEqual(3);
    expect(page.body.items).toHaveLength(2);
    expect(page.body.items[0].name).toBe('Alpha Foods');
  });

  it('runs the full process: discovery -> team review -> proposal -> won', async () => {
    const { agent, user } = await signedIn('member');
    const id = (await agent.post('/api/leads').send({ name: 'Delta', phone: '01755555555' })).body
      .id;

    // Discovery call (scheduled by you for a manual lead), then marked completed.
    const discovery = await agent
      .post(`/api/leads/${id}/meetings`)
      .send({ type: 'discovery', startsAt: inHours(50) });
    expect(discovery.status).toBe(201);
    await agent.patch(`/api/meetings/${discovery.body.id}`).send({ status: 'completed' });
    let lead = (await agent.get(`/api/leads/${id}`)).body.lead;
    expect(lead.stage).toBe('discovery_done');
    expect(lead.discoveryDoneAt).not.toBeNull();

    // Discovery form, partially, then more fields later (merged, not replaced).
    await agent.patch(`/api/leads/${id}`).send({
      discovery: {
        businessType: 'Fashion',
        monthlyRevenue: 5_000_000,
        channels: ['facebook'],
        targetMonths: 6,
        adsRunBy: 'A freelancer',
        partnerStatus: 'partner',
        monthlyAdSpend: 300_000,
        deliveredSales: 1_200_000,
        returnsPerTen: 2,
        whyAgency: 'Wants to stop running ads alone',
      },
    });
    await agent.patch(`/api/leads/${id}`).send({
      stage: 'team_review',
      discovery: {
        targetRevenue: 15_000_000,
        products: [
          { name: 'Kurti', purchasePrice: 500, sellingPrice: 1200 },
          { name: 'Three-piece', purchasePrice: 1500, sellingPrice: null },
        ],
      },
      assigneeId: user._id.toHexString(),
    });
    lead = (await agent.get(`/api/leads/${id}`)).body.lead;
    expect(lead.stage).toBe('team_review');
    expect(lead.discovery).toMatchObject({
      businessType: 'Fashion',
      monthlyRevenue: 5_000_000,
      targetRevenue: 15_000_000,
      products: [
        { name: 'Kurti', purchasePrice: 500, sellingPrice: 1200 },
        { name: 'Three-piece', purchasePrice: 1500, sellingPrice: null },
      ],
      channels: ['facebook'],
      targetMonths: 6,
      adsRunBy: 'A freelancer',
      partnerStatus: 'partner',
      deliveredSales: 1_200_000,
      returnsPerTen: 2,
    });

    // The team's offer, then the proposal meeting moves it to "Proposal booked".
    await agent
      .patch(`/api/leads/${id}`)
      .send({ offer: { salesTarget: 8_000_000, commissionPercent: 10, notes: 'Start with Meta' } });
    const proposal = await agent
      .post(`/api/leads/${id}/meetings`)
      .send({ type: 'proposal', startsAt: inHours(75), durationMinutes: 45 });
    expect(proposal.status).toBe(201);
    lead = (await agent.get(`/api/leads/${id}`)).body;
    expect(lead.lead.stage).toBe('proposal_booked');
    expect(lead.lead.nextMeetingType).toBe('proposal'); // the discovery call is already done
    expect(lead.meetings.map((m: { type: string }) => m.type).sort()).toEqual([
      'discovery',
      'proposal',
    ]);

    // They say yes.
    const won = await agent.patch(`/api/leads/${id}`).send({ stage: 'won' });
    expect(won.body).toMatchObject({
      stage: 'won',
      offer: { salesTarget: 8_000_000, commissionPercent: 10 },
    });
    expect(won.body.decidedAt).not.toBeNull();

    const types = (await agent.get(`/api/leads/${id}`)).body.activities.map(
      (a: { type: string }) => a.type,
    );
    expect(types).toEqual(
      expect.arrayContaining(['created', 'stage_changed', 'assigned', 'updated', 'meeting_booked']),
    );
  });

  it('calculates ROAS only when both figures are known, and limits returns to 10', async () => {
    expect(calculateRoas(300_000, 1_200_000)).toBe(4);
    expect(calculateRoas(0, 1_200_000)).toBeNull();
    expect(calculateRoas(null, 1_200_000)).toBeNull();
    expect(calculateRoas(300_000, null)).toBeNull();

    const { agent } = await signedIn('member');
    const id = (await agent.post('/api/leads').send({ name: 'Roas', phone: '01744440099' })).body
      .id;
    const tooMany = await agent
      .patch(`/api/leads/${id}`)
      .send({ discovery: { returnsPerTen: 11 } });
    expect(tooMany.status).toBe(400);
  });

  it('requires a reason to mark a lead lost, and lost is shown on the lead', async () => {
    const { agent } = await signedIn('member');
    const id = (await agent.post('/api/leads').send({ name: 'Echo', phone: '01744444444' })).body
      .id;

    const meeting = await agent
      .post(`/api/leads/${id}/meetings`)
      .send({ type: 'discovery', startsAt: inHours(120) });
    expect(meeting.status).toBe(201);

    expect((await agent.patch(`/api/leads/${id}`).send({ stage: 'lost' })).status).toBe(400);
    const lost = await agent
      .patch(`/api/leads/${id}`)
      .send({ stage: 'lost', lostReason: 'declined_offer', lostNote: 'Too expensive' });
    // Its upcoming meeting is cancelled, freeing the time.
    expect(lost.body.nextMeetingAt).toBeNull();
    const detail = await agent.get(`/api/leads/${id}`);
    expect(detail.body.meetings[0].status).toBe('cancelled');
    expect(lost.body).toMatchObject({
      stage: 'lost',
      lostReason: 'declined_offer',
      lostNote: 'Too expensive',
    });
  });

  it('refuses a meeting that clashes with another one', async () => {
    const { agent } = await signedIn('member');
    const a = (await agent.post('/api/leads').send({ name: 'F1', phone: '01733330001' })).body.id;
    const b = (await agent.post('/api/leads').send({ name: 'F2', phone: '01733330002' })).body.id;
    const start = new Date(Date.now() + 100 * 60 * 60_000);
    start.setUTCMinutes(0, 0, 0);
    const first = await agent
      .post(`/api/leads/${a}/meetings`)
      .send({ type: 'proposal', startsAt: start.toISOString(), durationMinutes: 60 });
    expect(first.status).toBe(201);
    const overlapping = await agent.post(`/api/leads/${b}/meetings`).send({
      type: 'proposal',
      startsAt: new Date(start.getTime() + 30 * 60_000).toISOString(),
    });
    expect(overlapping.status).toBe(409);
  });

  it('lets admins export CSV (with formula injection neutralised) and delete leads', async () => {
    const { agent } = await signedIn('admin');
    const created = await agent
      .post('/api/leads')
      .send({ name: '=HYPERLINK("evil")', phone: '01766666666' });

    const csv = await agent.get('/api/leads/export.csv');
    expect(csv.status).toBe(200);
    expect(csv.headers['content-type']).toMatch(/text\/csv/);
    expect(csv.text).toContain(`"'=HYPERLINK(""evil"")"`);
    expect(csv.text).toContain('Target revenue');
    expect(csv.text).toContain('Returns out of 10');
    expect(csv.text).not.toContain('Margin');

    expect((await agent.delete(`/api/leads/${created.body.id}`)).status).toBe(204);
    expect((await agent.get(`/api/leads/${created.body.id}`)).status).toBe(404);
  });

  it('shows dashboard totals and conversion rates', async () => {
    const { agent } = await signedIn('viewer');
    const res = await agent.get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.totals.leads).toBeGreaterThan(0);
    expect(res.body.totals.clients).toBeGreaterThanOrEqual(1);
    expect(res.body.totals.closeRate).toBeGreaterThan(0);
    expect(res.body.totals.avgCommission).toBe(10);
    expect(Object.keys(res.body.byStage)).toEqual([
      'discovery_booked',
      'discovery_done',
      'team_review',
      'proposal_booked',
      'won',
      'lost',
    ]);
    expect(res.body.lostReasons.declined_offer).toBeGreaterThanOrEqual(1);
  });
});
