import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { WebmailAddress } from '@muvance/shared';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "9:41 AM" today, "Yesterday", "Mon" this week, "Nov 21" this year, "Nov 21, 2025" before. */
export function shortDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const t = date.getTime();
  if (t >= startOfDay) return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (t >= startOfDay - 86_400_000) return 'Yesterday';
  if (t >= startOfDay - 6 * 86_400_000) return date.toLocaleDateString([], { weekday: 'short' });
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
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

export function displayName(a: WebmailAddress | null | undefined) {
  if (!a) return 'Unknown sender';
  return a.name || a.address.split('@')[0] || a.address;
}

export function formatAddress(a: WebmailAddress) {
  return a.name ? `${a.name} <${a.address}>` : a.address;
}

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

export function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Plain text email to safe HTML, with links. */
export function textToHtml(text: string) {
  return escapeHtml(text)
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
    .replace(/\n/g, '<br>');
}

export function fileToBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
