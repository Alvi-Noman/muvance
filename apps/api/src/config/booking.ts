import type { AvailabilitySettings } from '@muvance/shared';

/** The host's time zone. Bookable hours below are in this zone. */
export const hostTimeZone = {
  name: 'Asia/Dhaka',
  /** UTC offset in minutes. Asia/Dhaka is UTC+6 all year (no daylight saving). */
  utcOffsetMinutes: 6 * 60,
} as const;

/**
 * Default booking rules, used until an admin changes them in Settings
 * (they're then stored in the database).
 */
export const defaultAvailability: AvailabilitySettings = {
  // Sunday–Thursday, first call 11:00 AM, last call 7:00 PM (it runs 7:00–7:30 PM).
  weekly: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    open: day <= 4,
    firstStart: 11 * 60,
    lastStart: 19 * 60,
  })),
  slotIntervalMinutes: 60, // on the hour only
  durationMinutes: 30,
  daysAhead: 30,
  minNoticeHours: 3,
};
