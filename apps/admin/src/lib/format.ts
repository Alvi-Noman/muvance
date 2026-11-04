const fmt = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-US', options);

const dateTime = fmt({
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});
const date = fmt({ month: 'short', day: 'numeric', year: 'numeric' });
const time = fmt({ hour: 'numeric', minute: '2-digit' });
const dayHeading = fmt({ weekday: 'long', month: 'long', day: 'numeric' });
const shortDay = fmt({ weekday: 'short', month: 'short', day: 'numeric' });
const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const number = new Intl.NumberFormat('en-US');

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
export const formatDate = (iso: string) => date.format(new Date(iso));
export const formatTime = (iso: string) => time.format(new Date(iso));
export const formatDayHeading = (iso: string) => dayHeading.format(new Date(iso));
export const formatNumber = (n: number) => number.format(n);

// Bangladeshi grouping (lakh/crore): 50,00,000 rather than 5,000,000.
const taka = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** Taka amounts, e.g. "৳50,00,000". */
export const formatMoney = (n: number) => `৳${taka.format(n)}`;

/** Short spoken form: "50 lakh", "1.2 crore", "8,000". */
export function formatTakaShort(n: number) {
  const trim = (x: number) => String(Number(x.toFixed(2)));
  if (Math.abs(n) >= 1e7) return `${trim(n / 1e7)} crore`;
  if (Math.abs(n) >= 1e5) return `${trim(n / 1e5)} lakh`;
  return taka.format(n);
}

/** "42%" from 0.42, or "–" when there's no data yet. */
export const formatRate = (rate: number | null) =>
  rate == null ? '–' : `${Math.round(rate * 100)}%`;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Today", "Tomorrow", "Yesterday" or "Mon, Oct 12". */
export function formatDay(iso: string) {
  const d = new Date(iso);
  const diff = Math.round((startOfDay(d) - startOfDay(new Date())) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return shortDay.format(d);
}

/** "3 minutes ago", "in 2 days". */
export function formatRelative(iso: string) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');

/** Formats an hour (0–23) as "11:00 AM". */
export const formatHour = (hour: number) => time.format(new Date(2000, 0, 1, hour, 0));

/** For use mid-sentence: "today", "tomorrow" or "on Mon, Oct 12". */
export function formatWhen(iso: string) {
  const day = formatDay(iso);
  return ['Today', 'Tomorrow', 'Yesterday'].includes(day) ? day.toLowerCase() : `on ${day}`;
}

/** Clickable URL for a website typed by a lead ("brand.com" -> "https://brand.com"). */
export function websiteUrl(website: string) {
  const trimmed = website.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** "brand.com" for display, without the protocol, "www." or a trailing slash. */
export function websiteLabel(website: string) {
  return website
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/$/, '');
}
