import { z } from 'zod';

/** Random ids made in the visitor's browser (crypto.randomUUID). */
export const clientIdSchema = z.uuid();

/** Sent once when a recorded visit starts. */
export const startRecordingSchema = z.object({
  id: clientIdSchema,
  /** Stays the same across a visitor's visits (kept in their browser). */
  visitorId: clientIdSchema,
  landingUrl: z.url().max(2000),
  referrer: z.string().max(2000).default(''),
  width: z.number().int().min(0).max(10_000),
  height: z.number().int().min(0).max(10_000),
});

/** Query string of each uploaded piece of a recording (the body is the events). */
export const recordingChunkQuerySchema = z.object({
  seq: z.coerce.number().int().min(0).max(5000),
  /** Timestamps (ms) of the first and last event in the piece. */
  start: z.coerce.number().int().positive(),
  end: z.coerce.number().int().positive(),
  path: z.string().max(500).default('/'),
  /** "gzip" when the browser compressed the body, "json" otherwise. */
  encoding: z.enum(['gzip', 'json']).default('gzip'),
});

export const recordingListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),
  filter: z.enum(['all', 'booked', 'ads']).default('all'),
  /** Leave out visits shorter than this many seconds. */
  minSeconds: z.coerce.number().int().min(0).max(3600).default(0),
  leadId: z.string().optional(),
});

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface RecordingSource {
  /** e.g. "Meta ad", "Facebook", "Google", "Direct", or the referring site. */
  label: string;
  fromAd: boolean;
  campaign: string | null;
}

export interface RecordingDto {
  id: string;
  startedAt: string;
  durationMs: number;
  pages: string[];
  landingUrl: string;
  source: RecordingSource;
  device: { type: DeviceType; browser: string; os: string; width: number; height: number };
  booked: boolean;
  lead: { id: string; name: string } | null;
  /** Earlier or later visits by the same person. */
  visitNumber: number;
}

export type StartRecordingInput = z.input<typeof startRecordingSchema>;
export type RecordingChunkQuery = z.infer<typeof recordingChunkQuerySchema>;
/** Recordings list filters as sent by the admin (all optional; the API fills defaults). */
export type RecordingListQuery = Partial<{
  page: number;
  pageSize: number;
  filter: 'all' | 'booked' | 'ads';
  minSeconds: number;
  leadId: string;
}>;

/** Website visits by hour of the day (host time), for the dashboard. */
export interface VisitorsByHourDto {
  days: number;
  timeZone: string;
  total: number;
  /** 24 counts: index 0 = midnight–1 AM … 23 = 11 PM–midnight. */
  byHour: number[];
  /** The 3-hour stretch with the most visits (start hour, may wrap past midnight). */
  busiest: { startHour: number; count: number } | null;
}

export const visitorsQuerySchema = z.object({
  days: z.coerce
    .number()
    .pipe(z.union([z.literal(7), z.literal(30)]))
    .default(7),
});
