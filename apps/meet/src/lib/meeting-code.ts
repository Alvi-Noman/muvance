import { meetCodePattern } from '@muvance/shared';

/**
 * Turns what someone typed or pasted (a code, "abcdefghij", or a full link) into a meeting code
 * like "abc-defg-hij". Returns null if it isn't one.
 */
export function parseMeetingCode(input: string): string | null {
  let text = input.trim().toLowerCase();
  if (!text) return null;
  try {
    if (/^https?:\/\//.test(text)) text = new URL(text).pathname;
  } catch {
    return null;
  }
  const last = text.split('/').filter(Boolean).pop() ?? '';
  const letters = last.replace(/[^a-z]/g, '');
  if (letters.length !== 10) return null;
  const code = `${letters.slice(0, 3)}-${letters.slice(3, 7)}-${letters.slice(7)}`;
  return meetCodePattern.test(code) ? code : null;
}

export function meetingLink(code: string) {
  return `${window.location.origin}/${code}`;
}

/** "meet.muvance.com/abc-defg-hij", for showing a link without the https:// noise. */
export function shortLink(code: string) {
  return `${window.location.host}/${code}`;
}
