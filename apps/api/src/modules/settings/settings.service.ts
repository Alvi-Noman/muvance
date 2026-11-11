import { ObjectId } from 'mongodb';
import type { AvailabilitySettings, BlockedTime, BlockedTimeInput } from '@muvance/shared';
import { defaultAvailability, hostTimeZone } from '@/config/booking';
import { collections } from '@/db/client';
import type { BlockedTimeDoc, UserDoc } from '@/db/types';
import { HttpError } from '@/utils/http-error';

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const offset = hostTimeZone.utcOffsetMinutes * MINUTE;

/** Today's date in host time, as "YYYY-MM-DD". */
export const hostToday = (now = new Date()) =>
  new Date(now.getTime() + offset).toISOString().slice(0, 10);

/** The UTC instant of midnight, host time, on a "YYYY-MM-DD" date. */
const hostMidnight = (date: string) => Date.parse(`${date}T00:00:00Z`) - offset;

/** A blocked stretch of time as UTC milliseconds: [start, end). */
export type Window = { start: number; end: number };

/** Every blocked window of a block, one per day it covers. */
function windowsOf(block: Pick<BlockedTimeDoc, 'startDate' | 'endDate' | 'from' | 'to'>) {
  const windows: Window[] = [];
  const last = hostMidnight(block.endDate);
  for (let day = hostMidnight(block.startDate); day <= last; day += DAY) {
    windows.push(
      block.from === null || block.to === null
        ? { start: day, end: day + DAY }
        : { start: day + block.from * MINUTE, end: day + block.to * MINUTE },
    );
  }
  return windows;
}

export const overlapsAny = (start: number, end: number, windows: Window[]) =>
  windows.some((w) => w.start < end && w.end > start);

const toBlockedTime = (doc: BlockedTimeDoc): BlockedTime => ({
  id: doc._id.toHexString(),
  startDate: doc.startDate,
  endDate: doc.endDate,
  from: doc.from,
  to: doc.to,
  note: doc.note,
  createdAt: doc.createdAt.toISOString(),
});

/** Blocks that haven't fully passed yet, soonest first. */
const upcomingBlocks = () =>
  collections
    .blockedTimes()
    .find({ endDate: { $gte: hostToday() } })
    .sort({ startDate: 1, from: 1 })
    .toArray();

export const settingsService = {
  async getAvailability(): Promise<AvailabilitySettings> {
    const doc = await collections.settings().findOne({ _id: 'booking' });
    return doc?.availability?.weekly ? doc.availability : defaultAvailability;
  },

  async updateAvailability(availability: AvailabilitySettings, actor: UserDoc) {
    await collections
      .settings()
      .updateOne(
        { _id: 'booking' },
        { $set: { availability, updatedAt: new Date(), updatedBy: actor._id } },
        { upsert: true },
      );
    return availability;
  },

  async listBlockedTimes(): Promise<BlockedTime[]> {
    return (await upcomingBlocks()).map(toBlockedTime);
  },

  /** Every upcoming blocked window, for working out which slots can be booked. */
  async blockedWindows(): Promise<Window[]> {
    return (await upcomingBlocks()).flatMap(windowsOf);
  },

  /**
   * Blocks the time and reports how many calls were already booked in it. Those are kept
   * (blocking never cancels anyone), so the team can move them if needed.
   */
  async addBlockedTime(input: BlockedTimeInput, actor: UserDoc) {
    const doc: BlockedTimeDoc = {
      _id: new ObjectId(),
      startDate: input.startDate,
      endDate: input.endDate,
      from: input.from,
      to: input.to,
      note: input.note ?? '',
      createdAt: new Date(),
      createdBy: actor._id,
    };
    await collections.blockedTimes().insertOne(doc);

    const windows = windowsOf(doc);
    const booked = await collections
      .meetings()
      .find(
        {
          status: 'scheduled',
          startsAt: { $lt: new Date(windows.at(-1)!.end) },
          endsAt: { $gt: new Date(Math.max(windows[0]!.start, Date.now())) },
        },
        { projection: { startsAt: 1, endsAt: 1 } },
      )
      .toArray();
    const alreadyBooked = booked.filter((m) =>
      overlapsAny(m.startsAt.getTime(), m.endsAt.getTime(), windows),
    ).length;

    return { blockedTime: toBlockedTime(doc), alreadyBooked };
  },

  async removeBlockedTime(id: ObjectId) {
    const { deletedCount } = await collections.blockedTimes().deleteOne({ _id: id });
    if (!deletedCount) throw HttpError.notFound('That blocked time was already removed');
  },
};
