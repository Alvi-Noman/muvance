import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "2:30 PM". */
export function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** "9:41 AM" today, "Yesterday", "Mon" this week, "Nov 21" this year, "Nov 21, 2025" before. */
export function shortDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const today = startOfDay(now);
  const t = date.getTime();
  if (t >= today) return timeOf(iso);
  if (t >= today - 86_400_000) return 'Yesterday';
  if (t >= today - 6 * 86_400_000) return date.toLocaleDateString([], { weekday: 'short' });
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Day separators: "Today", "Yesterday", "Monday, November 24". */
export function dayLabel(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diff = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' }),
  });
}

export function longDate(iso: string) {
  return new Date(iso).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const sameDay = (a: string, b: string) =>
  startOfDay(new Date(a)) === startOfDay(new Date(b));

export function fileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

const tones = [
  'bg-[#e8eefc] text-[#2a4fd6]',
  'bg-[#e7f5ee] text-[#18794e]',
  'bg-[#fdf0e6] text-[#b4530f]',
  'bg-[#f3ecfd] text-[#6e3ad1]',
  'bg-[#fdebee] text-[#c0283c]',
  'bg-[#e6f5f7] text-[#0e7480]',
  'bg-[#f4f1e6] text-[#7a6413]',
];

export function avatarTone(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return tones[Math.abs(h) % tones.length]!;
}

export function initials(name: string) {
  const parts = name
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return '?';
  return (
    (parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '')
  ).toUpperCase();
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;
