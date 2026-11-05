import { ObjectId, type Filter, type Sort } from 'mongodb';
import {
  leadStageLabels,
  lostReasonLabels,
  meetingTypeLabels,
  salesChannelLabels,
  type BulkUpdateLeadsInput,
  type CreateActivityInput,
  type LeadDetailDto,
  type LeadListDto,
  type LeadStage,
  calculateRoas,
  partnerStatusLabels,
  type ProductDto,
  type UpdateLeadInput,
  createLeadSchema,
  leadListQuerySchema,
  scheduleMeetingSchema,
} from '@muvance/shared';
import type { z } from 'zod';
import { hostTimeZone } from '@/config/booking';
import { collections, isDuplicateKeyError } from '@/db/client';
import type { LeadDoc, MeetingDoc, UserDoc } from '@/db/types';
import { toObjectId } from '@/lib/object-id';
import { HttpError } from '@/utils/http-error';
import {
  changeStage,
  logActivity,
  newLead,
  overlapsScheduledMeeting,
  phoneKey,
  refreshNextMeeting,
  toActivityDto,
  toActivityDtos,
  toLeadDto,
  toLeadDtos,
  toMeetingDto,
  toMeetingDtos,
  userRefs,
} from './leads.helpers';

type ListQuery = z.output<typeof leadListQuerySchema>;
type CreateInput = z.output<typeof createLeadSchema>;
type ScheduleInput = z.output<typeof scheduleMeetingSchema>;

const sorts: Record<ListQuery['sort'], Sort> = {
  '-createdAt': { createdAt: -1 },
  createdAt: { createdAt: 1 },
  '-lastActivityAt': { lastActivityAt: -1 },
  name: { name: 1 },
  '-revenue': { 'discovery.monthlyRevenue': -1, createdAt: -1 },
  '-decidedAt': { decidedAt: -1, createdAt: -1 },
};

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function buildFilter(query: Omit<ListQuery, 'page' | 'pageSize' | 'sort'>, actor: UserDoc) {
  const filter: Filter<LeadDoc> = {};
  if (query.stage) filter.stage = query.stage;
  else if (query.excludeLost) filter.stage = { $ne: 'lost' };
  if (query.tag) filter.tags = query.tag;
  if (query.assignee === 'me') filter.assigneeId = actor._id;
  else if (query.assignee === 'unassigned') filter.assigneeId = null;
  else if (query.assignee && ObjectId.isValid(query.assignee)) {
    filter.assigneeId = new ObjectId(query.assignee);
  }
  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q), 'i');
    const digits = query.q.replace(/\D/g, '');
    filter.$or = [
      { name: rx },
      { businessName: rx },
      { phone: rx },
      { website: rx },
      { 'discovery.businessType': rx },
      { 'discovery.products.name': rx },
      ...(digits.length >= 4 ? [{ phoneKey: new RegExp(escapeRegex(digits)) }] : []),
    ];
  }
  return filter;
}

/** Checks that an assignee id points at an active teammate who can work leads. */
async function resolveAssignee(id: string | null | undefined) {
  if (id === undefined) return undefined;
  if (id === null) return null;
  const user = await collections.users().findOne({ _id: toObjectId(id, 'Teammate') });
  if (!user || user.status !== 'active' || user.role === 'viewer') {
    throw HttpError.badRequest('Leads can only be assigned to active teammates.');
  }
  return user;
}

async function findLead(id: string) {
  const lead = await collections.leads().findOne({ _id: toObjectId(id, 'Lead') });
  if (!lead) throw HttpError.notFound('Lead not found');
  return lead;
}

const CONTACT_LABELS = {
  name: 'name',
  phone: 'phone',
  businessName: 'business name',
  website: 'website',
  monthlySales: 'monthly sales',
  message: 'booking note',
  tags: 'tags',
} as const;

const formatHostTime = new Intl.DateTimeFormat('en-US', {
  timeZone: hostTimeZone.name,
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const roasCell = (adSpend: number | null, delivered: number | null) => {
  const roas = calculateRoas(adSpend, delivered);
  return roas == null ? '' : Number(roas.toFixed(2));
};

/** "Kurti (buy 500, sell 1200)" for the CSV export. */
function describeProduct(p: ProductDto) {
  const prices = [
    p.purchasePrice != null && `buy ${p.purchasePrice}`,
    p.sellingPrice != null && `sell ${p.sellingPrice}`,
  ].filter(Boolean);
  return `${p.name || 'Product'}${prices.length ? ` (${prices.join(', ')})` : ''}`;
}

export const leadsService = {
  async list(query: ListQuery, actor: UserDoc): Promise<LeadListDto> {
    const filter = buildFilter(query, actor);
    const [docs, total] = await Promise.all([
      collections
        .leads()
        .find(filter)
        .sort(sorts[query.sort])
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .toArray(),
      collections.leads().countDocuments(filter),
    ]);
    return { items: await toLeadDtos(docs), total, page: query.page, pageSize: query.pageSize };
  },

  async detail(id: string): Promise<LeadDetailDto> {
    const lead = await findLead(id);
    const [meetings, activities] = await Promise.all([
      collections.meetings().find({ leadId: lead._id }).sort({ startsAt: -1 }).toArray(),
      collections
        .activities()
        .find({ leadId: lead._id })
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray(),
    ]);
    const users = await userRefs([lead.assigneeId, ...activities.map((a) => a.actorId)]);
    return {
      lead: toLeadDto(lead, users),
      meetings: meetings.map((m) => toMeetingDto(m, lead)),
      activities: activities.map((a) => toActivityDto(a, users)),
    };
  },

  /** A lead that didn't come through the website (e.g. a referral). Schedule its discovery call next. */
  async create(input: CreateInput, actor: UserDoc) {
    const assignee = await resolveAssignee(input.assigneeId);
    const lead = newLead({
      name: input.name,
      phone: input.phone,
      source: 'manual',
      businessName: input.businessName ?? '',
      website: input.website ?? '',
      monthlySales: input.monthlySales ?? '',
      message: input.message ?? '',
      tags: [...new Set(input.tags)],
      assigneeId: assignee?._id ?? null,
    });
    await collections.leads().insertOne(lead);
    await logActivity(lead._id, 'created', `Added by ${actor.name}`, actor._id);
    return (await toLeadDtos([lead]))[0]!;
  },

  async update(id: string, input: UpdateLeadInput, actor: UserDoc) {
    let lead = await findLead(id);
    const assignee = await resolveAssignee(input.assigneeId);

    // Plain fields, plus discovery/offer merged field by field (dotted paths).
    const set: Record<string, unknown> = {};
    for (const key of Object.keys(CONTACT_LABELS) as (keyof typeof CONTACT_LABELS)[]) {
      if (input[key] !== undefined)
        set[key] = key === 'tags' ? [...new Set(input.tags)] : input[key];
    }
    if (input.phone !== undefined) set.phoneKey = phoneKey(input.phone);
    for (const [key, value] of Object.entries(input.discovery ?? {}))
      set[`discovery.${key}`] = value;
    for (const [key, value] of Object.entries(input.offer ?? {})) set[`offer.${key}`] = value;
    if (assignee !== undefined) set.assigneeId = assignee?._id ?? null;
    if (lead.stage === 'lost' && input.lostNote !== undefined && !input.stage)
      set.lostNote = input.lostNote;

    if (Object.keys(set).length) {
      const updated = await collections
        .leads()
        .findOneAndUpdate(
          { _id: lead._id },
          { $set: { ...set, updatedAt: new Date() } },
          { returnDocument: 'after' },
        );
      if (!updated) throw HttpError.notFound('Lead not found');

      // Timeline entries for what changed.
      const edited: string[] = (Object.keys(CONTACT_LABELS) as (keyof typeof CONTACT_LABELS)[])
        .filter(
          (key) =>
            input[key] !== undefined && JSON.stringify(input[key]) !== JSON.stringify(lead[key]),
        )
        .map((key) => CONTACT_LABELS[key]);
      if (input.discovery && Object.keys(input.discovery).length) edited.push('the discovery form');
      if (input.offer && Object.keys(input.offer).length) edited.push('the offer');
      if (edited.length)
        await logActivity(lead._id, 'updated', `Updated ${edited.join(', ')}`, actor._id);

      if (assignee !== undefined && !lead.assigneeId?.equals(assignee?._id ?? null)) {
        await logActivity(
          lead._id,
          'assigned',
          assignee ? `Assigned to ${assignee.name}` : 'Unassigned',
          actor._id,
          { to: assignee?._id.toHexString() ?? null },
        );
      }
      lead = updated;
    }

    if (input.stage) {
      lead = await changeStage(lead, input.stage, actor._id, {
        lostReason: input.lostReason,
        lostNote: input.lostNote,
      });
    }
    return (await toLeadDtos([lead]))[0]!;
  },

  async bulkUpdate(input: BulkUpdateLeadsInput, actor: UserDoc) {
    if (input.stage === 'lost' && !input.lostReason) {
      throw HttpError.badRequest('Pick a reason for marking these leads as lost.');
    }
    for (const id of input.ids) {
      await this.update(
        id,
        {
          ...(input.stage && { stage: input.stage, lostReason: input.lostReason }),
          ...(input.assigneeId !== undefined && { assigneeId: input.assigneeId }),
        },
        actor,
      );
    }
    return { updated: input.ids.length };
  },

  async remove(id: string) {
    const lead = await findLead(id);
    await Promise.all([
      collections.leads().deleteOne({ _id: lead._id }),
      collections.meetings().deleteMany({ leadId: lead._id }),
      collections.activities().deleteMany({ leadId: lead._id }),
    ]);
  },

  async addActivity(id: string, input: CreateActivityInput, actor: UserDoc) {
    const lead = await findLead(id);
    const activity = await logActivity(lead._id, input.type, input.body, actor._id);
    return (await toActivityDtos([activity]))[0]!;
  },

  /**
   * Schedules a meeting at a time you choose (the proposal meeting, or a discovery call for a
   * lead that didn't book online). Moves the lead forward to match.
   */
  async scheduleMeeting(id: string, input: ScheduleInput, actor: UserDoc) {
    const lead = await findLead(id);
    if (lead.stage === 'won') throw HttpError.badRequest('This lead is already a client.');

    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(startsAt.getTime() + input.durationMinutes * 60_000);
    if (startsAt.getTime() < Date.now() - 5 * 60_000) {
      throw HttpError.badRequest('Pick a time in the future.');
    }
    if (await overlapsScheduledMeeting(startsAt, endsAt)) {
      throw HttpError.conflict('You already have a meeting at that time.');
    }

    const now = new Date();
    const meeting: MeetingDoc = {
      _id: new ObjectId(),
      leadId: lead._id,
      type: input.type,
      startsAt,
      endsAt,
      status: 'scheduled',
      timeZone: hostTimeZone.name,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await collections.meetings().insertOne(meeting);
    } catch (error) {
      if (isDuplicateKeyError(error))
        throw HttpError.conflict('You already have a meeting at that time.');
      throw error;
    }

    await logActivity(
      lead._id,
      'meeting_booked',
      `Scheduled a ${meetingTypeLabels[input.type].toLowerCase()} for ${formatHostTime.format(startsAt)}`,
      actor._id,
      { meetingId: meeting._id.toHexString(), startsAt: startsAt.toISOString(), type: input.type },
    );
    await refreshNextMeeting(lead._id);

    const next: LeadStage | null =
      input.type === 'proposal' &&
      ['discovery_booked', 'discovery_done', 'team_review', 'lost'].includes(lead.stage)
        ? 'proposal_booked'
        : input.type === 'discovery' && lead.stage === 'lost'
          ? 'discovery_booked'
          : null;
    if (next) await changeStage(lead, next, actor._id);

    return (await toMeetingDtos([meeting]))[0]!;
  },

  async tags() {
    const tags = await collections.leads().distinct('tags');
    return (tags as string[]).sort((a, b) => a.localeCompare(b));
  },

  async exportCsv(query: ListQuery, actor: UserDoc) {
    const docs = await collections
      .leads()
      .find(buildFilter(query, actor))
      .sort(sorts[query.sort])
      .limit(10_000)
      .toArray();
    const leads = await toLeadDtos(docs);
    const header = [
      'Name',
      'Phone',
      'Business',
      'Website',
      'Stage',
      'Lost reason',
      'Business type',
      'Products',
      'Monthly revenue',
      'Target revenue',
      'Target months',
      'Who runs ads',
      'Partner',
      'Ad spend (last 30 days)',
      'Delivered sales (last 30 days)',
      'ROAS',
      'Returns out of 10',
      'Why an agency',
      'Product notes',
      'Average order value',
      'Sales channels',
      'Sales target (offer)',
      'Commission %',
      'Source',
      'Next meeting',
      'Created',
      'Booking note',
    ];
    const rows = leads.map((l) => [
      l.name,
      l.phone,
      l.businessName,
      l.website,
      leadStageLabels[l.stage],
      l.lostReason ? lostReasonLabels[l.lostReason] : '',
      l.discovery.businessType,
      l.discovery.products.map(describeProduct).join('; '),
      l.discovery.monthlyRevenue ?? '',
      l.discovery.targetRevenue ?? '',
      l.discovery.targetMonths ?? '',
      l.discovery.adsRunBy,
      l.discovery.partnerStatus ? partnerStatusLabels[l.discovery.partnerStatus] : '',
      l.discovery.monthlyAdSpend ?? '',
      l.discovery.deliveredSales ?? '',
      roasCell(l.discovery.monthlyAdSpend, l.discovery.deliveredSales),
      l.discovery.returnsPerTen ?? '',
      l.discovery.whyAgency,
      l.discovery.productNotes,
      l.discovery.averageOrderValue ?? '',
      l.discovery.channels.map((c) => salesChannelLabels[c]).join('; '),
      l.offer.salesTarget ?? '',
      l.offer.commissionPercent ?? '',
      l.source,
      l.nextMeetingAt ?? '',
      l.createdAt,
      l.message,
    ]);
    return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
  },
};

/** Quotes a CSV cell and neutralises spreadsheet formulas (CSV injection). */
function csvCell(value: string | number) {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
