import type { eventWithTime } from 'rrweb';
import { env } from '@/config/env';

/**
 * Records visits (clicks, scrolling, page changes, mouse movement) so the team can replay
 * them in the admin, including what's typed into the form. A visit is only uploaded once the visitor
 * interacts or stays a while; quick bounces are only counted, never uploaded.
 *
 * Runs on the live site, or locally with VITE_RECORD_SESSIONS=true.
 */

const enabled =
  typeof window !== 'undefined' &&
  ((import.meta.env.PROD && !['localhost', '127.0.0.1'].includes(window.location.hostname)) ||
    import.meta.env.VITE_RECORD_SESSIONS === 'true');

const SESSION_KEY = 'mv-recording';
const VISITOR_KEY = 'mv-visitor';
/** A visit ends after this long without activity; coming back later starts a new one. */
const IDLE_MS = 30 * 60_000;
const ENGAGED_AFTER_MS = 12_000;
const FLUSH_EVERY_MS = 8_000;
/** Browsers drop "keepalive" requests (sent while leaving) above 64 KB. */
const KEEPALIVE_MAX = 60_000;

// rrweb's event and source numbers (from @rrweb/types), kept here so the library loads lazily.
const INCREMENTAL = 3;
const INTERACTION_SOURCES = new Set([2, 3, 5, 6]); // click/tap, scroll, typing, touch

type Session = { id: string; seq: number; lastActive: number; registered: boolean };

function read<T>(storage: Storage, key: string): T | null {
  try {
    return JSON.parse(storage.getItem(key) ?? 'null') as T | null;
  } catch {
    return null;
  }
}
function write(storage: Storage, key: string, value: unknown) {
  try {
    storage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch {
    // Private mode or storage full: recording still works for this page.
  }
}

let session: Session | null = null;
let visitorId = '';
let buffer: eventWithTime[] = [];
let engaged = false;
let stopped = false;
let stopRecording: (() => void) | undefined;
let addCustomEvent: ((tag: string, payload: unknown) => void) | undefined;
let registering: Promise<boolean> | null = null;
let sending: Promise<void> = Promise.resolve();

const save = () => session && write(sessionStorage, SESSION_KEY, session);

function register() {
  registering ??= fetch(`${env.API_URL}/visits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: session!.id,
      visitorId,
      landingUrl: window.location.href,
      referrer: document.referrer,
      width: window.innerWidth,
      height: window.innerHeight,
    }),
  })
    .then((res) => {
      if (!res.ok) return false;
      session!.registered = true;
      save();
      return true;
    })
    .catch(() => false);
  return registering;
}

async function compress(json: string): Promise<{ body: BodyInit; encoding: 'gzip' | 'json' }> {
  if (typeof CompressionStream === 'undefined') return { body: json, encoding: 'json' };
  const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
  return { body: await new Response(stream).blob(), encoding: 'gzip' };
}

/** Sends everything recorded so far. `leaving`: the page is closing, send it immediately. */
function flush(leaving = false) {
  if (!session || !engaged || stopped || !buffer.length) return;
  const events = buffer;
  buffer = [];
  const seq = session.seq++;
  save();

  const send = async () => {
    if (!session!.registered && !(await register())) return;
    const json = JSON.stringify(events);
    // While leaving there's no time to compress; plain JSON goes straight out.
    const { body, encoding } = leaving
      ? { body: json, encoding: 'json' as const }
      : await compress(json);
    const size = typeof body === 'string' ? body.length : (body as Blob).size;
    const query = new URLSearchParams({
      seq: String(seq),
      start: String(events[0]!.timestamp),
      end: String(events.at(-1)!.timestamp),
      path: window.location.pathname,
      encoding,
    });
    const res = await fetch(`${env.API_URL}/visits/${session!.id}/chunks?${query}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body,
      keepalive: size < KEEPALIVE_MAX,
    }).catch(() => null);
    if (res?.headers.get('X-Recording') === 'stop' || res?.status === 404) stop();
  };
  // One upload at a time, in order.
  sending = leaving ? (void send(), sending) : sending.then(send, send);
}

function stop() {
  stopped = true;
  stopRecording?.();
  buffer = [];
}

function becomeEngaged() {
  if (engaged) return;
  engaged = true;
  void register();
  flush();
}

/** Starts recording this tab's visit (once). */
export async function startRecording() {
  // randomUUID only exists on https (and localhost), which the live site always is.
  if (!enabled || session || navigator.webdriver || typeof crypto.randomUUID !== 'function') return;

  const now = Date.now();
  const saved = read<Session>(sessionStorage, SESSION_KEY);
  session =
    saved && now - saved.lastActive < IDLE_MS
      ? saved
      : { id: crypto.randomUUID(), seq: 0, lastActive: now, registered: false };
  visitorId = read<string>(localStorage, VISITOR_KEY) ?? '';
  if (!/^[\da-f-]{36}$/.test(visitorId)) {
    visitorId = crypto.randomUUID();
    write(localStorage, VISITOR_KEY, JSON.stringify(visitorId));
  }
  // A reload carries on an already-uploaded visit.
  engaged = session.registered;
  save();

  const rrweb = await import('rrweb');
  addCustomEvent = rrweb.record.addCustomEvent;
  stopRecording = rrweb.record({
    emit(event) {
      if (stopped) return;
      buffer.push(event);
      if (event.type === INCREMENTAL) {
        const source = (event.data as { source?: number }).source;
        if (source !== undefined && INTERACTION_SOURCES.has(source)) {
          session!.lastActive = Date.now();
          becomeEngaged();
        }
      }
    },
    // The team wants to see exactly what's typed (password fields stay hidden regardless).
    maskAllInputs: false,
    slimDOMOptions: 'all',
    inlineStylesheet: true,
    recordCanvas: false,
    collectFonts: false,
    sampling: { mousemove: 50, scroll: 150, media: 800, input: 'last' },
  });

  // Count the visit straight away (for the dashboard's visitor chart). The recording
  // itself is only uploaded once they interact or stay a while.
  void register();

  // The page they're on now; later page changes are marked as they happen.
  markRecording('page', { path: window.location.pathname });

  setTimeout(becomeEngaged, ENGAGED_AFTER_MS);
  setInterval(() => {
    save();
    flush();
  }, FLUSH_EVERY_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('pagehide', () => flush(true));
}

/** Adds a labelled moment to the recording, e.g. a page change or a booking. */
export function markRecording(tag: string, payload: Record<string, unknown> = {}) {
  if (!stopped) addCustomEvent?.(tag, payload);
}

/** The visitor's ids right now, without waiting (for saving unfinished bookings). */
export function currentRecordingIds(): { visitorId?: string; recordingId?: string } {
  if (!session || !visitorId) return {};
  return session.registered ? { visitorId, recordingId: session.id } : { visitorId };
}

/**
 * Ids sent with a booking so its lead links to the visitor's recorded visits. Waits (briefly)
 * until the visit is registered, so the link is never missed.
 */
export async function recordingIds(): Promise<{ visitorId?: string; recordingId?: string }> {
  if (!session || !visitorId || stopped) return {};
  becomeEngaged();
  const registered = await Promise.race([
    register(),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000)),
  ]);
  return registered ? { visitorId, recordingId: session.id } : { visitorId };
}
