import { ObjectId } from 'mongodb';
import type { UnfinishedBookingDto, UnfinishedBookingInput } from '@muvance/shared';
import { collections } from '@/db/client';
import type { UnfinishedBookingDoc, UserDoc } from '@/db/types';
import { logActivity, newLead, phoneKey } from '@/modules/leads/leads.helpers';
import { recordingsService } from '@/modules/recordings/recordings.service';
import { HttpError } from '@/utils/http-error';

async function findOpen(id: string) {
  const doc = await collections.unfinishedBookings().findOne({ _id: id, status: 'open' });
  if (!doc) throw HttpError.notFound('That unfinished booking is no longer on the list');
  return doc;
}

export const unfinishedService = {
  /** Saves (or updates) what someone has typed so far. Ignored once they've booked. */
  async save(input: UnfinishedBookingInput) {
    const now = new Date();
    // A save that arrives just after they booked (or from someone with a call already
    // booked) isn't unfinished.
    const booked = await collections
      .leads()
      .findOne({ phoneKey: phoneKey(input.phone), nextMeetingAt: { $gt: now } });
    if (booked) return;
    const fields = {
      phoneKey: phoneKey(input.phone),
      name: input.name ?? '',
      phone: input.phone,
      businessName: input.businessName ?? '',
      website: input.website ?? '',
      monthlySales: input.monthlySales ?? '',
      message: input.message ?? '',
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      timeZone: input.timeZone ?? null,
      visitorId: input.visitorId ?? null,
      recordingId: input.recordingId ?? null,
      updatedAt: now,
    };
    // Typing a new number into the same form replaces the earlier one.
    await collections
      .unfinishedBookings()
      .updateOne(
        { _id: input.id, status: 'open' },
        { $set: fields, $setOnInsert: { status: 'open', leadId: null, createdAt: now } },
        { upsert: true },
      )
      .catch((error: unknown) => {
        // Already booked or added (status changed): nothing more to save.
        if ((error as { code?: number }).code !== 11000) throw error;
      });
  },

  /** After a real booking: that person is no longer unfinished. */
  async markBooked(leadId: ObjectId, phone: string, visitorId?: string) {
    await collections.unfinishedBookings().updateMany(
      {
        status: 'open',
        $or: [{ phoneKey: phoneKey(phone) }, ...(visitorId ? [{ visitorId }] : [])],
      },
      { $set: { status: 'booked', leadId, updatedAt: new Date() } },
    );
  },

  async list(): Promise<{ items: UnfinishedBookingDto[]; total: number }> {
    const docs = await collections
      .unfinishedBookings()
      .find({ status: 'open' })
      .sort({ updatedAt: -1 })
      .limit(500)
      .toArray();
    const leads = await collections
      .leads()
      .find(
        { phoneKey: { $in: [...new Set(docs.map((d) => d.phoneKey))] } },
        { projection: { name: 1, phoneKey: 1 } },
      )
      .toArray();
    const byPhone = new Map(leads.map((l) => [l.phoneKey, l]));
    const items = docs.map((d) => {
      const lead = byPhone.get(d.phoneKey);
      return {
        id: d._id,
        name: d.name,
        phone: d.phone,
        businessName: d.businessName,
        website: d.website,
        monthlySales: d.monthlySales,
        message: d.message,
        startsAt: d.startsAt?.toISOString() ?? null,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
        recordingId: d.recordingId,
        existingLead: lead ? { id: lead._id.toHexString(), name: lead.name } : null,
      };
    });
    return { items, total: items.length };
  },

  /** Turns it into a lead (or uses the lead that already has this phone number). */
  async addToLeads(id: string, actor: UserDoc) {
    const doc: UnfinishedBookingDoc = await findOpen(id);
    let lead = await collections.leads().findOne({ phoneKey: doc.phoneKey });
    if (!lead) {
      lead = newLead({
        name: doc.name || 'Unknown (unfinished booking)',
        phone: doc.phone,
        source: 'website',
        businessName: doc.businessName,
        website: doc.website,
        monthlySales: doc.monthlySales,
        message: doc.message,
        tags: ['unfinished booking'],
      });
      await collections.leads().insertOne(lead);
      await logActivity(
        lead._id,
        'created',
        `Started booking a call on the website but didn't finish. Added by ${actor.name}`,
        actor._id,
      );
    }
    await collections
      .unfinishedBookings()
      .updateOne(
        { _id: doc._id },
        { $set: { status: 'added', leadId: lead._id, updatedAt: new Date() } },
      );
    await recordingsService.linkToLead(lead._id, doc.visitorId ?? undefined);
    return { leadId: lead._id.toHexString() };
  },

  async remove(id: string) {
    const { deletedCount } = await collections
      .unfinishedBookings()
      .deleteOne({ _id: id, status: 'open' });
    if (!deletedCount) throw HttpError.notFound('That unfinished booking is no longer on the list');
  },
};
