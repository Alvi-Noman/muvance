import { z } from 'zod';

/** What the booking form sends while someone fills it in, before (or without) booking. */
export const unfinishedBookingInputSchema = z.object({
  /** Made by the browser for this filling-in of the form, so updates replace each other. */
  id: z.uuid(),
  visitorId: z.uuid().optional(),
  recordingId: z.uuid().optional(),
  name: z.string().trim().max(100).default(''),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s\-().]{7,20}$/),
  businessName: z.string().trim().max(150).default(''),
  website: z.string().trim().max(200).default(''),
  monthlySales: z.string().trim().max(100).default(''),
  message: z.string().trim().max(2000).default(''),
  /** The call time they had picked. */
  startsAt: z.iso.datetime().optional(),
  timeZone: z.string().trim().max(64).optional(),
});

export interface UnfinishedBookingDto {
  id: string;
  name: string;
  phone: string;
  businessName: string;
  website: string;
  monthlySales: string;
  message: string;
  startsAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Their recorded visit, to watch what they did. */
  recordingId: string | null;
  /** Someone already in the CRM with this phone number. */
  existingLead: { id: string; name: string } | null;
}

export type UnfinishedBookingInput = z.input<typeof unfinishedBookingInputSchema>;
