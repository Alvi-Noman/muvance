import { createHash, randomUUID } from 'node:crypto';
import type { Request } from 'express';
import type { CreateBookingInput, MetaBrowserEvent } from '@muvance/shared';
import { env, isTest } from '@/config/env';
import { logger } from '@/lib/logger';
import { phoneKey } from '@/modules/leads/leads.helpers';

/**
 * Meta Conversions API: server copies of the website's Pixel events. They still count when a
 * browser blocks the Pixel, and they carry hashed contact details for better ad matching.
 * Each one shares its event_id with the Pixel copy, so Meta counts it once.
 */

const enabled = Boolean(env.META_PIXEL_ID && env.META_CAPI_TOKEN) && !isTest;

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

/**
 * Phone in Meta's format: digits with country code. Bangladeshi numbers are often typed
 * without it ("01712-345678"), so those get 880 added.
 */
export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('880')) return digits;
  if (/^01\d{9}$/.test(digits)) return `88${digits}`;
  if (/^1\d{9}$/.test(digits)) return `880${digits}`;
  return digits;
}

/** First and last name, lower-cased, as Meta expects before hashing. */
function splitName(name: string) {
  const [first = '', ...rest] = name.trim().toLowerCase().split(/\s+/);
  return { fn: first, ln: rest.join(' ') };
}

/** What every event knows about the visitor: their IP, browser and Meta cookies. */
function visitorData(req: Request) {
  const cookies = (req.cookies ?? {}) as Record<string, string | undefined>;
  return {
    client_ip_address: req.ip,
    client_user_agent: req.get('user-agent'),
    fbp: cookies._fbp,
    fbc: cookies._fbc,
  };
}

/** The page the request came from, or the site itself. */
const pageUrl = (req: Request) => req.get('referer') ?? env.SITE_URL;

type ServerEvent = {
  event_name: string;
  event_id: string;
  event_source_url: string;
  user_data: Record<string, unknown>;
  custom_data?: Record<string, unknown>;
};

async function send(events: ServerEvent[]) {
  if (!enabled) return;
  const time = Math.floor(Date.now() / 1000);
  const body = {
    data: events.map((e) => ({ ...e, event_time: time, action_source: 'website' })),
    ...(env.META_TEST_EVENT_CODE && { test_event_code: env.META_TEST_EVENT_CODE }),
  };
  try {
    const res = await fetch(
      `https://graph.facebook.com/${env.META_GRAPH_VERSION}/${env.META_PIXEL_ID}/events?access_token=${encodeURIComponent(env.META_CAPI_TOKEN!)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!res.ok) {
      logger.warn(
        {
          status: res.status,
          body: await res.text().catch(() => ''),
          events: events.map((e) => e.event_name),
        },
        'Meta Conversions API rejected events',
      );
    }
  } catch (error) {
    logger.warn({ err: error }, 'Could not reach the Meta Conversions API');
  }
}

export const metaService = {
  /** Server copy of a Pixel event from the browser (page views and booking steps). */
  trackBrowserEvent(req: Request, event: MetaBrowserEvent) {
    return send([
      {
        event_name: event.eventName,
        event_id: event.eventId,
        event_source_url: event.url,
        user_data: visitorData(req),
        ...(event.eventName !== 'PageView' && {
          custom_data: { content_name: 'Discovery call', content_category: 'Booking' },
        }),
      },
    ]);
  },

  /**
   * A booked call is a "Lead" (what the lead campaigns optimise for) and a "Schedule".
   * The Pixel sends the same two events with the same ids.
   */
  trackBooking(req: Request, input: CreateBookingInput) {
    const eventId = input.eventId ?? randomUUID();
    const { fn, ln } = splitName(input.name);
    const user_data = {
      ...visitorData(req),
      ph: [sha256(normalizePhone(input.phone))],
      fn: fn ? [sha256(fn)] : undefined,
      ln: ln ? [sha256(ln)] : undefined,
      country: [sha256('bd')],
      // The CRM matches people by phone, so the same person keeps the same id across bookings.
      external_id: [sha256(phoneKey(input.phone))],
    };
    const shared = {
      event_source_url: pageUrl(req),
      user_data,
      custom_data: { content_name: 'Discovery call', content_category: 'Booking' },
    };
    return send([
      { ...shared, event_name: 'Lead', event_id: `lead-${eventId}` },
      { ...shared, event_name: 'Schedule', event_id: `schedule-${eventId}` },
    ]);
  },
};
