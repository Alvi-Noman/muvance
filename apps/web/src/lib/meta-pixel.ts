import type { BrowserMetaEvent } from '@muvance/shared';
import { env } from '@/config/env';
import { siteConfig } from '@/config/site';

/**
 * Meta Pixel. Every event also goes to the API, which sends Meta a server copy (Conversions
 * API) with the same event id, so it still counts when an ad blocker stops the Pixel, and
 * Meta counts it once when both arrive.
 *
 * Only runs on the live site, so local testing never adds fake data to the ad account.
 */

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  loaded: boolean;
  version: string;
  push: Fbq;
  disablePushState?: boolean;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const isLiveSite =
  import.meta.env.PROD &&
  typeof window !== 'undefined' &&
  !['localhost', '127.0.0.1'].includes(window.location.hostname);

let started = false;

/** Meta's standard loader, written out so it needs no inline script. */
function loadPixel() {
  if (window.fbq) return;
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as Fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
  // The site is a single-page app: page views are sent by hand on each route change.
  fbq.disablePushState = true;
  window.fbq = fbq;
  window._fbq = fbq;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
}

function start() {
  if (started || !isLiveSite) return started;
  loadPixel();
  window.fbq!('init', siteConfig.metaPixelId);
  started = true;
  return true;
}

export const newEventId = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

const STANDARD_EVENTS = new Set(['PageView', 'ViewContent', 'Lead', 'Schedule']);
const BOOKING_DATA = { content_name: 'Discovery call', content_category: 'Booking' };

function fire(name: string, eventId: string, data?: Record<string, unknown>) {
  window.fbq!(STANDARD_EVENTS.has(name) ? 'track' : 'trackCustom', name, data ?? {}, {
    eventID: eventId,
  });
}

/** Pixel event plus its server copy. */
export function trackEvent(name: BrowserMetaEvent) {
  if (!start()) return;
  const eventId = newEventId();
  fire(name, eventId, name === 'PageView' ? undefined : BOOKING_DATA);
  void fetch(`${env.API_URL}/meta/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    // Still delivered if the visitor navigates away straight after.
    keepalive: true,
    body: JSON.stringify({ eventName: name, eventId, url: window.location.href }),
  }).catch(() => {});
}

/**
 * A booked call. The API already sent the server copies of these two events (using the
 * same id, sent with the booking), so only the Pixel copies are sent here.
 */
export function trackBooking(eventId: string) {
  if (!start()) return;
  fire('Lead', `lead-${eventId}`, BOOKING_DATA);
  fire('Schedule', `schedule-${eventId}`, BOOKING_DATA);
}
