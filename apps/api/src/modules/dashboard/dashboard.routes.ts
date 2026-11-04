import { Router } from 'express';
import {
  leadStages,
  lostReasons,
  type DashboardDto,
  type LeadStage,
  type LostReason,
} from '@muvance/shared';
import { collections } from '@/db/client';
import { requirePermission } from '@/middlewares/auth';
import { toActivityDtos, toMeetingDtos } from '@/modules/leads/leads.helpers';

/** Mounted behind `requireAuth`. */
export const dashboardRouter = Router();

const ratio = (part: number, whole: number) => (whole ? part / whole : null);

dashboardRouter.get('/', requirePermission('leads:read'), async (_req, res) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60_000);
  const leads = collections.leads();
  const meetings = collections.meetings();

  const [
    total,
    newThisWeek,
    stageCounts,
    lostCounts,
    upcomingCount,
    upcoming,
    discoveriesHeld,
    discoveriesMissed,
    reachedDiscoveryDone,
    reachedProposal,
    decidedAfterProposal,
    commission,
    recent,
  ] = await Promise.all([
    leads.countDocuments(),
    leads.countDocuments({ createdAt: { $gte: weekAgo } }),
    leads
      .aggregate<{ _id: LeadStage; count: number }>([
        { $group: { _id: '$stage', count: { $sum: 1 } } },
      ])
      .toArray(),
    leads
      .aggregate<{ _id: LostReason; count: number }>([
        { $match: { stage: 'lost' } },
        { $group: { _id: '$lostReason', count: { $sum: 1 } } },
      ])
      .toArray(),
    meetings.countDocuments({ status: 'scheduled', endsAt: { $gte: now } }),
    meetings
      .find({ status: 'scheduled', endsAt: { $gte: now } })
      .sort({ startsAt: 1 })
      .limit(6)
      .toArray(),
    meetings.countDocuments({ type: 'discovery', status: 'completed' }),
    meetings.countDocuments({ type: 'discovery', status: 'no_show' }),
    leads.countDocuments({ discoveryDoneAt: { $ne: null } }),
    leads.countDocuments({ proposalAt: { $ne: null } }),
    leads.countDocuments({ proposalAt: { $ne: null }, stage: { $in: ['won', 'lost'] } }),
    leads
      .aggregate<{ avg: number | null }>([
        { $match: { stage: 'won', 'offer.commissionPercent': { $type: 'number' } } },
        { $group: { _id: null, avg: { $avg: '$offer.commissionPercent' } } },
      ])
      .toArray(),
    collections.activities().find().sort({ createdAt: -1 }).limit(10).toArray(),
  ]);

  const byStage = Object.fromEntries(leadStages.map((s) => [s, 0])) as Record<LeadStage, number>;
  for (const row of stageCounts) byStage[row._id] = row.count;
  const lostByReason = Object.fromEntries(lostReasons.map((r) => [r, 0])) as Record<
    LostReason,
    number
  >;
  for (const row of lostCounts) if (row._id) lostByReason[row._id] = row.count;

  const recentLeads = await leads
    .find({ _id: { $in: recent.map((a) => a.leadId) } }, { projection: { name: 1 } })
    .toArray();
  const leadNames = new Map(recentLeads.map((l) => [l._id.toHexString(), l.name]));
  const recentDtos = await toActivityDtos(recent);

  const body: DashboardDto = {
    totals: {
      leads: total,
      newThisWeek,
      upcomingMeetings: upcomingCount,
      inReview: byStage.discovery_done + byStage.team_review,
      clients: byStage.won,
      showUpRate: ratio(discoveriesHeld, discoveriesHeld + discoveriesMissed),
      proposalRate: ratio(reachedProposal, reachedDiscoveryDone),
      // Of proposals that got an answer, how many said yes.
      closeRate: ratio(byStage.won, decidedAfterProposal),
      avgCommission: commission[0]?.avg ?? null,
    },
    byStage,
    lostReasons: lostByReason,
    upcoming: await toMeetingDtos(upcoming),
    recentActivity: recentDtos.map((a) => ({
      ...a,
      leadName: leadNames.get(a.leadId) ?? 'Deleted lead',
    })),
  };
  res.json(body);
});
