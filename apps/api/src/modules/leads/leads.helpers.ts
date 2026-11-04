import { ObjectId } from 'mongodb';
import {
  leadStageLabels,
  lostReasonLabels,
  type ActivityDto,
  type ActivityType,
  type DiscoveryDto,
  type LeadDto,
  type LeadStage,
  type LostReason,
  type MeetingDto,
  type UserRefDto,
} from '@muvance/shared';
import { collections } from '@/db/client';
import type { ActivityDoc, LeadDoc, MeetingDoc } from '@/db/types';
import { iso } from '@/lib/object-id';
import { HttpError } from '@/utils/http-error';

/**
 * Matching key for phone numbers: the last 10 digits, so "+880 1712-345678" and
 * "01712345678" count as the same person.
 */
export const phoneKey = (phone: string) => phone.replace(/\D/g, '').slice(-10);

/** A new lead with every field set, so documents always have the same shape. */
export function newLead(
  fields: Pick<LeadDoc, 'name' | 'phone' | 'source'> & Partial<LeadDoc>,
  now = new Date(),
): LeadDoc {
  return {
    _id: new ObjectId(),
    phoneKey: phoneKey(fields.phone),
    businessName: '',
    website: '',
    monthlySales: '',
    message: '',
    stage: 'discovery_booked',
    lostReason: null,
    lostNote: '',
    tags: [],
    assigneeId: null,
    discovery: {},
    offer: {},
    nextMeetingAt: null,
    nextMeetingType: null,
    discoveryDoneAt: null,
    proposalAt: null,
    decidedAt: null,
    createdAt: now,
    updatedAt: now,
    lastActivityAt: now,
    ...fields,
  };
}

/** Records an event on a lead's timeline and bumps the lead's last-activity time. */
export async function logActivity(
  leadId: ObjectId,
  type: ActivityType,
  body: string,
  actorId: ObjectId | null,
  meta: Record<string, string | null> = {},
) {
  const now = new Date();
  const doc: ActivityDoc = {
    _id: new ObjectId(),
    leadId,
    type,
    body,
    meta,
    actorId,
    createdAt: now,
  };
  await Promise.all([
    collections.activities().insertOne(doc),
    collections.leads().updateOne({ _id: leadId }, { $set: { lastActivityAt: now } }),
  ]);
  return doc;
}

/** Position in the process, used to set milestones when a lead moves forward (Lost is outside it). */
const stageStep: Record<LeadStage, number> = {
  discovery_booked: 0,
  discovery_done: 1,
  team_review: 2,
  proposal_booked: 3,
  won: 4,
  lost: -1,
};

/**
 * Moves a lead to another stage, keeping milestones and the lost reason consistent, and logs it.
 * Every stage change in the API goes through here (manual, automatic and bulk).
 */
export async function changeStage(
  lead: LeadDoc,
  to: LeadStage,
  actorId: ObjectId | null,
  extra: { lostReason?: LostReason; lostNote?: string } = {},
): Promise<LeadDoc> {
  if (lead.stage === to && to !== 'lost') return lead;
  if (to === 'lost' && !extra.lostReason) {
    throw HttpError.badRequest('Pick a reason for marking this lead as lost.');
  }

  const now = new Date();
  const set: Partial<LeadDoc> = { stage: to, updatedAt: now };
  if (to === 'lost') {
    set.lostReason = extra.lostReason!;
    set.lostNote = extra.lostNote ?? '';
    set.decidedAt = now;
  } else {
    set.lostReason = null;
    set.lostNote = '';
    set.decidedAt = to === 'won' ? now : null;
  }
  if (stageStep[to] >= 1 && !lead.discoveryDoneAt) set.discoveryDoneAt = now;
  if (stageStep[to] >= 3 && !lead.proposalAt) set.proposalAt = now;

  const updated = await collections
    .leads()
    .findOneAndUpdate({ _id: lead._id }, { $set: set }, { returnDocument: 'after' });
  if (!updated) throw HttpError.notFound('Lead not found');

  const body =
    to === 'lost'
      ? `Marked as lost: ${lostReasonLabels[extra.lostReason!]}${extra.lostNote ? ` (“${extra.lostNote}”)` : ''}`
      : to === 'won'
        ? 'Won! They said yes to the offer'
        : `Moved from ${leadStageLabels[lead.stage]} to ${leadStageLabels[to]}`;
  await logActivity(lead._id, 'stage_changed', body, actorId, {
    from: lead.stage,
    to,
    reason: extra.lostReason ?? null,
  });

  // A lost lead's upcoming meetings are cancelled, which also frees those times on the website.
  if (to === 'lost') {
    const { modifiedCount } = await collections
      .meetings()
      .updateMany(
        { leadId: lead._id, status: 'scheduled' },
        { $set: { status: 'cancelled', updatedAt: now } },
      );
    if (modifiedCount) {
      await logActivity(
        lead._id,
        'meeting_updated',
        `Cancelled ${modifiedCount === 1 ? 'the upcoming meeting' : `${modifiedCount} upcoming meetings`}`,
        actorId,
      );
      await refreshNextMeeting(lead._id);
      return (await collections.leads().findOne({ _id: lead._id })) ?? updated;
    }
  }
  return updated;
}

/** id -> { id, name } for the given user ids, in one query. */
export async function userRefs(ids: (ObjectId | null)[]) {
  const unique = [...new Set(ids.filter(Boolean).map((id) => id!.toHexString()))];
  const map = new Map<string, UserRefDto>();
  if (!unique.length) return map;
  const users = await collections
    .users()
    .find({ _id: { $in: unique.map((id) => new ObjectId(id)) } }, { projection: { name: 1 } })
    .toArray();
  for (const u of users) map.set(u._id.toHexString(), { id: u._id.toHexString(), name: u.name });
  return map;
}

const emptyDiscovery: DiscoveryDto = {
  businessType: '',
  products: [],
  productNotes: '',
  monthlyRevenue: null,
  targetRevenue: null,
  targetMonths: null,
  adsRunBy: '',
  partnerStatus: null,
  monthlyAdSpend: null,
  deliveredSales: null,
  returnsPerTen: null,
  whyAgency: '',
  averageOrderValue: null,
  channels: [],
  notes: '',
};

export function toLeadDto(lead: LeadDoc, users: Map<string, UserRefDto>): LeadDto {
  return {
    id: lead._id.toHexString(),
    name: lead.name,
    phone: lead.phone,
    businessName: lead.businessName,
    website: lead.website,
    monthlySales: lead.monthlySales,
    message: lead.message,
    stage: lead.stage,
    lostReason: lead.lostReason ?? null,
    lostNote: lead.lostNote ?? '',
    tags: lead.tags,
    assignee: lead.assigneeId ? (users.get(lead.assigneeId.toHexString()) ?? null) : null,
    source: lead.source,
    discovery: { ...emptyDiscovery, ...lead.discovery },
    offer: { salesTarget: null, commissionPercent: null, notes: '', ...lead.offer },
    nextMeetingAt: iso(lead.nextMeetingAt),
    nextMeetingType: lead.nextMeetingType ?? null,
    discoveryDoneAt: iso(lead.discoveryDoneAt),
    proposalAt: iso(lead.proposalAt),
    decidedAt: iso(lead.decidedAt),
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
    lastActivityAt: lead.lastActivityAt.toISOString(),
  };
}

export async function toLeadDtos(leads: LeadDoc[]) {
  const users = await userRefs(leads.map((l) => l.assigneeId));
  return leads.map((l) => toLeadDto(l, users));
}

export function toActivityDto(activity: ActivityDoc, users: Map<string, UserRefDto>): ActivityDto {
  return {
    id: activity._id.toHexString(),
    leadId: activity.leadId.toHexString(),
    type: activity.type,
    body: activity.body,
    meta: activity.meta,
    actor: activity.actorId ? (users.get(activity.actorId.toHexString()) ?? null) : null,
    createdAt: activity.createdAt.toISOString(),
  };
}

export async function toActivityDtos(activities: ActivityDoc[]) {
  const users = await userRefs(activities.map((a) => a.actorId));
  return activities.map((a) => toActivityDto(a, users));
}

export function toMeetingDto(meeting: MeetingDoc, lead?: LeadDoc | null): MeetingDto {
  return {
    id: meeting._id.toHexString(),
    leadId: meeting.leadId.toHexString(),
    lead: lead
      ? { name: lead.name, phone: lead.phone, businessName: lead.businessName, stage: lead.stage }
      : null,
    type: meeting.type ?? 'discovery',
    startsAt: meeting.startsAt.toISOString(),
    endsAt: meeting.endsAt.toISOString(),
    status: meeting.status,
    timeZone: meeting.timeZone,
    createdAt: meeting.createdAt.toISOString(),
  };
}

/** Meetings with their lead's name and phone attached. */
export async function toMeetingDtos(meetings: MeetingDoc[]) {
  const leadIds = [...new Set(meetings.map((m) => m.leadId.toHexString()))].map(
    (id) => new ObjectId(id),
  );
  const leads = await collections
    .leads()
    .find({ _id: { $in: leadIds } })
    .toArray();
  const byId = new Map(leads.map((l) => [l._id.toHexString(), l]));
  return meetings.map((m) => toMeetingDto(m, byId.get(m.leadId.toHexString())));
}

/** Keeps `lead.nextMeetingAt/Type` in sync with its earliest upcoming scheduled meeting. */
export async function refreshNextMeeting(leadId: ObjectId) {
  const next = await collections
    .meetings()
    .find({ leadId, status: 'scheduled', endsAt: { $gte: new Date() } })
    .sort({ startsAt: 1 })
    .limit(1)
    .next();
  await collections
    .leads()
    .updateOne(
      { _id: leadId },
      { $set: { nextMeetingAt: next?.startsAt ?? null, nextMeetingType: next?.type ?? null } },
    );
}

/** True if [start, end) overlaps any scheduled meeting (optionally ignoring one). */
export async function overlapsScheduledMeeting(start: Date, end: Date, ignoreId?: ObjectId) {
  const clash = await collections.meetings().findOne({
    status: 'scheduled',
    startsAt: { $lt: end },
    endsAt: { $gt: start },
    ...(ignoreId && { _id: { $ne: ignoreId } }),
  });
  return !!clash;
}
