import { z } from 'zod';
import { metaEventIdSchema } from './tracking';

/**
 * A web address as people type it: optional http(s)://, a domain with a real top-level part
 * (letters, or punycode), optional port, then an optional path. Non-Latin domains are fine,
 * including Bangla ones, whose vowel signs are combining marks (\p{M}) rather than letters.
 */
const WEBSITE_PATTERN =
  /^(?:https?:\/\/)?(?:[\p{L}\p{N}](?:[\p{L}\p{M}\p{N}-]{0,61}[\p{L}\p{M}\p{N}])?\.)+(?:\p{L}[\p{L}\p{M}]{1,62}|xn--[a-z\d-]{1,59})(?::\d{1,5})?(?:[/?#]\S*)?$/iu;

/**
 * True for "brand.com", "www.brand.com", "https://brand.com/shop" or a page link like
 * "facebook.com/brand". False for "my shop", "n/a", "brand" or non-web links.
 */
export function isWebsite(value: string) {
  const v = value.trim();
  return v.length <= 200 && WEBSITE_PATTERN.test(v);
}

/**
 * Monthly sales are always in taka (the form shows "Taka" fixed in the field), so add it
 * unless they already wrote a currency: "50 lac" -> "50 lac Taka", "50,00,000 tk" unchanged.
 */
export function withTaka(value: string) {
  const v = value.trim();
  if (!v || /taka|\btk\b|৳|\bbdt\b|টাকা/i.test(v)) return v;
  return `${v} Taka`;
}

export const WEBSITE_ERROR =
  'Please enter a valid website, e.g. yourbrand.com or facebook.com/yourpage';

/** Contact details collected after a time slot is chosen. */
export const bookingDetailsSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s\-().]{7,20}$/, 'Please enter a valid phone number'),
  businessName: z.string().trim().min(1, 'Please enter your business name').max(150),
  website: z
    .string()
    .trim()
    .min(1, 'Please enter your website')
    .max(200)
    .refine(isWebsite, WEBSITE_ERROR),
  // Free text so people can answer in their own terms, e.g. "50 lac" (saved as "50 lac Taka").
  monthlySales: z
    .string()
    .trim()
    .min(1, 'Please enter your average monthly sales')
    .max(100)
    .transform(withTaka),
  message: z.string().trim().max(2000).optional(),
});

export const createBookingSchema = bookingDetailsSchema.extend({
  /** Slot start as an ISO 8601 UTC timestamp, exactly as returned by the availability API. */
  startsAt: z.iso.datetime(),
  /** The visitor's IANA time zone, e.g. "Asia/Dhaka", used for confirmations. */
  timeZone: z.string().trim().min(1).max(64),
  /** Shared with the website's Pixel "Lead" event, so Meta counts the booking once. */
  eventId: metaEventIdSchema.optional(),
  /** The visitor's id from the website's session recorder, to link their recorded visits. */
  visitorId: z.uuid().optional(),
  /** The recorded visit in which they booked. */
  recordingId: z.uuid().optional(),
});

export const bookingSchema = createBookingSchema.extend({
  id: z.string(),
  endsAt: z.string(),
  createdAt: z.string(),
});

export const availabilitySchema = z.object({
  durationMinutes: z.number(),
  hostTimeZone: z.string(),
  /** Bookable slot start times as ISO 8601 UTC timestamps, sorted ascending. */
  slots: z.array(z.string()),
  /** Times already taken, shown greyed out. Times only: nothing about who booked them. */
  bookedSlots: z.array(z.string()),
});

export type BookingDetails = z.infer<typeof bookingDetailsSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type Booking = z.infer<typeof bookingSchema>;
export type Availability = z.infer<typeof availabilitySchema>;
