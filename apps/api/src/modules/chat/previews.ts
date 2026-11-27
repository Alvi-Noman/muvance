import { lookup } from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import { isIP, type LookupFunction } from 'node:net';
import type { ChatLinkPreviewDto } from '@muvance/shared';
import { collections } from '@/db/client';
import { logger } from '@/lib/logger';

/**
 * Link previews: the title, description and picture of the first link in a message, read from
 * the page's Open Graph tags (like Slack and Google Chat do). Fetched by the API, never from a
 * private address, so a message can't make the server look inside its own network.
 */

const TIMEOUT_MS = 5000;
const MAX_BYTES = 1024 * 1024;
const MAX_REDIRECTS = 3;

/** The first web link in a message (outside code), or null. */
export function firstLink(text: string) {
  const outside = text.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`\n]*`/g, ' ');
  const match = /\bhttps?:\/\/[^\s<>"']+/i.exec(outside);
  if (!match) return null;
  const url = match[0].replace(/[).,!?;:'"\]]+$/, '');
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes('.') ? parsed.toString() : null;
  } catch {
    return null;
  }
}

/** Loopback, private, link-local, carrier-grade NAT, multicast and other non-public ranges. */
export function isPrivateAddress(address: string) {
  if (isIP(address) === 4) {
    const [a, b] = address.split('.').map(Number) as [number, number];
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  const v6 = address.toLowerCase();
  if (v6.startsWith('::ffff:')) return isPrivateAddress(v6.slice(7));
  return (
    v6 === '::' ||
    v6 === '::1' ||
    v6.startsWith('fc') ||
    v6.startsWith('fd') ||
    v6.startsWith('fe8') ||
    v6.startsWith('fe9') ||
    v6.startsWith('fea') ||
    v6.startsWith('feb') ||
    v6.startsWith('ff')
  );
}

/** Resolves names as usual, but refuses private addresses (checked at connect time). */
const publicLookup: LookupFunction = (hostname, options, callback) => {
  lookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) return callback(error, '', 0);
    const list = (addresses as unknown as { address: string; family: number }[]) ?? [];
    const safe = list.filter((a) => !isPrivateAddress(a.address));
    if (!safe.length || safe.length !== list.length) {
      return callback(new Error('Private address'), '', 0);
    }
    if ((options as { all?: boolean }).all) {
      return (callback as unknown as (e: null, a: typeof safe) => void)(null, safe);
    }
    callback(null, safe[0]!.address, safe[0]!.family);
  });
};

function get(url: URL): Promise<{ status: number; location?: string; type: string; body: string }> {
  return new Promise((resolve, reject) => {
    if (
      isIP(url.hostname.replace(/^\[|\]$/g, '')) &&
      isPrivateAddress(url.hostname.replace(/^\[|\]$/g, ''))
    ) {
      reject(new Error('Private address'));
      return;
    }
    const client = url.protocol === 'https:' ? https : http;
    const req = client.get(
      url,
      {
        lookup: publicLookup,
        timeout: TIMEOUT_MS,
        headers: {
          // Many sites only send their preview tags to link-preview bots.
          'User-Agent':
            'Mozilla/5.0 (compatible; MuvanceChat/1.0; +link-preview) facebookexternalhit/1.1',
          Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
          'Accept-Encoding': 'identity',
          'Accept-Language': 'en',
        },
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const type = String(res.headers['content-type'] ?? '');
        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume();
          resolve({ status, location: res.headers.location, type, body: '' });
          return;
        }
        if (status !== 200 || !/text\/html|application\/xhtml/i.test(type)) {
          res.resume();
          resolve({ status, type, body: '' });
          return;
        }
        let size = 0;
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => {
          size += chunk.length;
          chunks.push(chunk);
          // The tags are in <head>: the start of the page is enough.
          if (size >= MAX_BYTES) res.destroy();
        });
        const done = () => resolve({ status, type, body: Buffer.concat(chunks).toString('utf8') });
        res.on('end', done);
        res.on('close', done);
        res.on('error', reject);
      },
    );
    req.on('timeout', () => req.destroy(new Error('Timed out')));
    req.on('error', reject);
  });
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  '#39': "'",
};
function decode(value: string) {
  return value
    .replace(/&#x([\da-f]+);/gi, (_m, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z\d#]+);/gi, (m, name: string) => ENTITIES[name.toLowerCase()] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

/** Reads a page's preview from its <head>. */
export function parsePreview(html: string, pageUrl: string): ChatLinkPreviewDto | null {
  const head = html.slice(0, 300_000);
  const meta = new Map<string, string>();
  for (const [tag] of head.matchAll(/<meta\b[^>]*>/gi)) {
    const key = /\b(?:property|name)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.toLowerCase();
    const content = /\bcontent\s*=\s*"([^"]*)"|\bcontent\s*=\s*'([^']*)'/i.exec(tag);
    const value = content?.[1] ?? content?.[2];
    if (key && value && !meta.has(key)) meta.set(key, decode(value));
  }
  const titleTag = /<title[^>]*>([^<]{1,500})<\/title>/i.exec(head)?.[1];
  const title = meta.get('og:title') ?? meta.get('twitter:title') ?? (titleTag && decode(titleTag));
  if (!title) return null;
  const description =
    meta.get('og:description') ??
    meta.get('twitter:description') ??
    meta.get('description') ??
    null;
  let image = meta.get('og:image:secure_url') ?? meta.get('og:image') ?? meta.get('twitter:image');
  try {
    image = image ? new URL(image, pageUrl).toString() : undefined;
  } catch {
    image = undefined;
  }
  return {
    url: pageUrl,
    title: title.slice(0, 200),
    description: description ? description.slice(0, 300) : null,
    image: image?.startsWith('https://') ? image.slice(0, 1000) : null,
    siteName: (meta.get('og:site_name') ?? new URL(pageUrl).hostname.replace(/^www\./, '')).slice(
      0,
      80,
    ),
  };
}

async function fetchPreview(link: string): Promise<ChatLinkPreviewDto | null> {
  let url = new URL(link);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (url.port && !['80', '443'].includes(url.port)) return null;
    const res = await get(url);
    if (res.location) {
      url = new URL(res.location, url);
      continue;
    }
    if (!res.body) return null;
    const preview = parsePreview(res.body, link);
    return preview;
  }
  return null;
}

export const linkPreviews = {
  /** A link's preview, from the week-long cache or fetched now. Never throws. Replaced in tests. */
  async get(link: string): Promise<ChatLinkPreviewDto | null> {
    try {
      const cached = await collections.chatLinkPreviews().findOne({ _id: link });
      if (cached) return cached.preview;
      const preview = await fetchPreview(link).catch((error: unknown) => {
        logger.debug({ err: error, link }, 'No link preview');
        return null;
      });
      await collections
        .chatLinkPreviews()
        .updateOne({ _id: link }, { $set: { preview, fetchedAt: new Date() } }, { upsert: true });
      return preview;
    } catch (error) {
      logger.warn({ err: error }, 'Link preview failed');
      return null;
    }
  },
};
