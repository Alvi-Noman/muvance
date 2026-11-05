import { ObjectId } from 'mongodb';
import type { Availability, AvailabilitySettings, CreateBookingInput } from '@muvance/shared';
import { hostTimeZone } from '@/config/booking';
import { collections, isDuplicateKeyError } from '@/db/client';
import type { MeetingDoc } from '@/db/types';
import { logger } from '@/lib/logger';
import { devicesService } from '@/modules/devices/devices.service';
import {
  changeStage,
  logActivity,
  newLead,
  overlapsScheduledMeeting,
  phoneKey,
  refreshNextMeeting,
} from '@/modules/leads/leads.helpers';
import { settingsService } from '@/modules/settings/settings.service';
import { HttpError } from '@/utils/http-error';

const MINUTE = 60_000;

/** Every slot start (UTC ISO) allowed by the rules, from now until `daysAhead`. */
function candidateSlots(rules: AvailabilitySettings, now = new Date()) {
  const offset = hostTimeZone.utcOffsetMinutes * MINUTE;
  const earliest = now.getTime() + rules.minNoticeHours * 60 * MINUTE;
  // "Today" in the host time zone, as a UTC-midnight date we can step through by day.
  const hostToday = new Date(now.getTime() + offset);
  const first = rules.firstStartHour * 60;
  const last = rules.lastStartHour * 60;
  const slots: string[] = [];

  for (let day = 0; day <= rules.daysAhead; day++) {
    const date = new Date(
      Date.UTC(hostToday.getUTCFullYear(), hostToday.getUTCMonth(), hostToday.getUTCDate() + day),
    );
    if (!rules.workingDays.includes(date.getUTCDay())) continue;
    for (let m = first; m <= last; m += rules.slotIntervalMinutes) {
      // Host wall-clock time -> UTC instant.
      const start = date.getTime() + m * MINUTE - offset;
      if (start >= earliest) slots.push(new Date(start).toISOString());
    }
  }
  return slots;
}

/** Splits candidate slots by whether they overlap a scheduled meeting (including ones you set). */
async function slotsByStatus(rules: AvailabilitySettings) {
  const candidates = candidateSlots(rules);
  if (!candidates.length) return { slots: [], bookedSlots: [] };
  const windowStart = new Date(candidates[0]!);
  const windowEnd = new Date(Date.parse(candidates.at(-1)!) + rules.durationMinutes * MINUTE);
  const busy = await collections
    .meetings()
    .find(
      { status: 'scheduled', startsAt: { $lt: windowEnd }, endsAt: { $gt: windowStart } },
      { projection: { startsAt: 1, endsAt: 1 } },
    )
    .toArray();
  const isBooked = (slot: string) => {
    const start = Date.parse(slot);
    const end = start + rules.durationMinutes * MINUTE;
    return busy.some((m) => m.startsAt.getTime() < end && m.endsAt.getTime() > start);
  };
  return {
    slots: candidates.filter((slot) => !isBooked(slot)),
    bookedSlots: candidates.filter(isBooked),
  };
}

export const bookingsService = {
  async getAvailability(): Promise<Availability> {
    const rules = await settingsService.getAvailability();
    return {
      durationMinutes: rules.durationMinutes,
      hostTimeZone: hostTimeZone.name,
      ...(await slotsByStatus(rules)),
    };
  },

  /**
   * Books a discovery call from the public website. A new phone number creates a lead in
   * "Discovery booked". A repeat booking joins the existing lead; if that lead was lost (for
   * example after a no-show), it's re-opened so they can try again.
   */
  async create(input: CreateBookingInput) {
    const rules = await settingsService.getAvailability();
    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(startsAt.getTime() + rules.durationMinutes * MINUTE);
    if (
      !candidateSlots(rules).includes(startsAt.toISOString()) ||
      (await overlapsScheduledMeeting(startsAt, endsAt))
    ) {
      throw HttpError.conflict('Sorry, that time is no longer available. Please pick another.');
    }

    const now = new Date();
    const existing = await collections.leads().findOne({ phoneKey: phoneKey(input.phone) });
    const leadId = existing?._id ?? new ObjectId();

    const meeting: MeetingDoc = {
      _id: new ObjectId(),
      leadId,
      type: 'discovery',
      startsAt,
      endsAt,
      status: 'scheduled',
      timeZone: input.timeZone,
      createdAt: now,
      updatedAt: now,
    };
    try {
      // The unique index on scheduled start times makes this the atomic "is it free?" check.
      await collections.meetings().insertOne(meeting);
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw HttpError.conflict('Sorry, that time was just taken. Please pick another.');
      }
      throw error;
    }

    const details = {
      name: input.name,
      phone: input.phone,
      phoneKey: phoneKey(input.phone),
      businessName: input.businessName,
      website: input.website,
      monthlySales: input.monthlySales,
    };

    if (existing) {
      await collections.leads().updateOne(
        { _id: leadId },
        {
          $set: { ...details, ...(input.message && { message: input.message }), updatedAt: now },
        },
      );
      if (existing.stage === 'lost') {
        await changeStage(existing, 'discovery_booked', null);
      }
    } else {
      await collections
        .leads()
        .insertOne(
          newLead(
            { ...details, _id: leadId, source: 'website', message: input.message ?? '' },
            now,
          ),
        );
      await logActivity(leadId, 'created', 'Booked a discovery call from the website', null);
    }

    await logActivity(
      leadId,
      'meeting_booked',
      input.message
        ? `Booked a discovery call. Their note: “${input.message}”`
        : 'Booked a discovery call',
      null,
      { meetingId: meeting._id.toHexString(), startsAt: startsAt.toISOString(), type: 'discovery' },
    );
    await refreshNextMeeting(leadId);

    logger.info(
      { leadId: leadId.toHexString(), startsAt, business: input.businessName },
      'New call booked',
    );
    // Not awaited: the visitor shouldn't wait on, or be affected by, the phone alert.
    void devicesService.notifyNewLead({
      id: leadId.toHexString(),
      name: input.name,
      businessName: input.businessName,
      startsAt,
    });
    return {
      id: meeting._id.toHexString(),
      startsAt: meeting.startsAt.toISOString(),
      endsAt: meeting.endsAt.toISOString(),
    };
  },
};
