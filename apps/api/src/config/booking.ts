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
  workingDays: [0, 1, 2, 3, 4], // Sunday–Thursday
  firstStartHour: 11, // 11:00 AM
  lastStartHour: 19, // 7:00 PM (the last call runs 7:00–7:30 PM)
  slotIntervalMinutes: 60, // on the hour only
  durationMinutes: 30,
  daysAhead: 30,
  minNoticeHours: 3,
};
