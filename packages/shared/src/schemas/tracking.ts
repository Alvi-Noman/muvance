import { z } from 'zod';

/**
 * Meta events the website may report through the API (the server copy of a Pixel event).
 * Lead and Schedule are not here: the API sends those itself when a booking is really made,
 * so nobody can fake a lead by calling this endpoint.
 */
export const BROWSER_META_EVENTS = ['PageView', 'ViewContent', 'StartBooking'] as const;
export type BrowserMetaEvent = (typeof BROWSER_META_EVENTS)[number];

/** A unique id shared by the Pixel and server copies of one event, so Meta counts it once. */
export const metaEventIdSchema = z
  .string()
  .trim()
  .regex(/^[\w-]{8,64}$/);

export const metaBrowserEventSchema = z.object({
  eventName: z.enum(BROWSER_META_EVENTS),
  eventId: metaEventIdSchema,
  /** The page the event happened on. */
  url: z.url().max(2000),
});

export type MetaBrowserEvent = z.infer<typeof metaBrowserEventSchema>;
