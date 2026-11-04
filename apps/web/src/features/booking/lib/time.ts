/**
 * Date helpers for the booking calendar. Days are identified by a "day key" (YYYY-MM-DD)
 * in the visitor's selected time zone, so a slot always lands on the day they'd expect.
 */

export const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Dhaka';

const pad = (n: number) => String(n).padStart(2, '0');

export function toDayKey(year: number, monthIndex: number, day: number) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

/** The YYYY-MM-DD date of an instant, in a time zone. */
export function dayKeyOf(date: Date, timeZone: string) {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** A Date at noon UTC on that day, safe for formatting the day itself with timeZone: 'UTC'. */
export function dayKeyToDate(key: string) {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d, 12));
}

export function groupSlotsByDay(slots: string[], timeZone: string) {
  const days = new Map<string, string[]>();
  for (const slot of slots) {
    const key = dayKeyOf(new Date(slot), timeZone);
    const list = days.get(key);
    if (list) list.push(slot);
    else days.set(key, [slot]);
  }
  return days;
}

export function formatSlotTime(iso: string, timeZone: string, hour12: boolean) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: hour12 ? 'numeric' : '2-digit',
    minute: '2-digit',
    hour12,
  })
    .format(new Date(iso))
    .replace(' ', '')
    .toLowerCase();
}

const ordinalSuffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };

/** 1 -> "1st", 12 -> "12th", 23 -> "23rd". */
function ordinal(n: number) {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  return `${n}${ordinalSuffixes[n % 10] ?? 'th'}`;
}

/** "Fri" and "9th" for a day key. */
export function formatDayHeading(key: string) {
  const date = dayKeyToDate(key);
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(
    date,
  );
  return { weekday, day: ordinal(date.getUTCDate()) };
}

/** "Friday, October 9, 2026" for a day key. */
export function formatDayLong(key: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(dayKeyToDate(key));
}

/** "Friday, October 9, 2026" for an instant in a time zone. */
export function formatLongDate(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatMonth(year: number, monthIndex: number) {
  const date = new Date(Date.UTC(year, monthIndex, 1, 12));
  return {
    month: new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(date),
    year: String(year),
  };
}

/** "GMT+6" style offset label for a time zone. */
export function timeZoneOffsetLabel(timeZone: string) {
  const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
    .formatToParts(new Date())
    .find((p) => p.type === 'timeZoneName');
  return part?.value ?? '';
}

export function addMinutes(iso: string, minutes: number) {
  return new Date(Date.parse(iso) + minutes * 60_000).toISOString();
}
