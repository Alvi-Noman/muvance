import { useQuery } from '@tanstack/react-query';
import type { AvailabilitySettings, BlockedTime } from '@muvance/shared';
import { api } from '@/lib/api-client';

export type AvailabilityResponse = { availability: AvailabilitySettings; hostTimeZone: string };

export const availabilityKey = ['settings', 'availability'] as const;
export const blockedTimesKey = ['settings', 'blocked-times'] as const;

export const useAvailabilitySettings = () =>
  useQuery({
    queryKey: availabilityKey,
    queryFn: () => api.get<AvailabilityResponse>('/settings/availability'),
  });

export const useBlockedTimes = () =>
  useQuery({
    queryKey: blockedTimesKey,
    queryFn: () => api.get<{ blockedTimes: BlockedTime[] }>('/settings/blocked-times'),
    select: (res) => res.blockedTimes,
  });

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

/** 690 -> "11:30 AM", 1440 -> "Midnight". */
export const formatMinutes = (minutes: number) =>
  minutes >= 1440 ? 'Midnight' : timeFormat.format(new Date(2000, 0, 1, 0, minutes));

/** Times of day every 30 minutes, as minutes after midnight: 0, 30, … 1410. */
export const TIMES = Array.from({ length: 48 }, (_, i) => i * 30);

const dayFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

/** "2026-11-20" -> "Fri, Nov 20" (the date as written, whatever the browser's time zone). */
export function formatDateKey(key: string) {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  return dayFormat.format(new Date(y, m - 1, d));
}

/** Today's date as "YYYY-MM-DD" in the given time zone. */
export const todayIn = (timeZone: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date());
