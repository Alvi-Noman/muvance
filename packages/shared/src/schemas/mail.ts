import { z } from 'zod';

/** Team email at <name>@muvance.com, managed in the admin and read at mail.muvance.com. */

const reserved = new Set(['root', 'mailer-daemon', 'nobody', 'www-data']);

export const mailLocalPartSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Enter the part before @')
  .max(64)
  .regex(
    /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/,
    'Use letters, numbers, dots, dashes or underscores (not at the start or end)',
  )
  .refine((v) => !v.includes('..'), 'No two dots in a row')
  .refine((v) => !reserved.has(v), 'That name is reserved');

export const mailPasswordSchema = z
  .string()
  .min(10, 'At least 10 characters')
  .max(128, 'At most 128 characters');

export const createMailAccountSchema = z.object({
  localPart: mailLocalPartSchema,
  name: z.string().trim().min(1, 'Enter their name').max(80),
  password: mailPasswordSchema,
  /** The name recipients see on their mail, e.g. "Alvi from Muvance". Defaults to their name. */
  senderName: z.string().trim().max(80).optional(),
  quotaGb: z.coerce.number().int().min(1).max(100).default(10),
});
export type CreateMailAccountInput = z.infer<typeof createMailAccountSchema>;

export const updateMailAccountSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  senderName: z.string().trim().max(80).optional(),
  quotaGb: z.coerce.number().int().min(1).max(100).optional(),
});
export type UpdateMailAccountInput = z.infer<typeof updateMailAccountSchema>;

export const setMailPasswordSchema = z.object({ password: mailPasswordSchema });

/** A profile picture: a small square image as a data URL (the browser resizes it first). */
export const mailAvatarSchema = z.object({
  image: z
    .string()
    .max(600_000, 'That picture is too large')
    .regex(
      /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/,
      'Use a JPG, PNG or WebP picture',
    ),
});

export interface MailAccountDto {
  id: string;
  address: string;
  localPart: string;
  name: string;
  /** The name recipients see on mail from their own address. */
  senderName: string;
  quotaGb: number;
  /** Shared addresses this person receives and can send as. */
  addresses: string[];
  createdAt: string;
  createdByName: string;
  /** Profile picture URL (admin), or null for initials. */
  avatarUrl: string | null;
}

export interface MailAccountsDto {
  domain: string;
  webmailUrl: string;
  /** Settings for phone and desktop mail apps. */
  clientSettings: { imapHost: string; imapPort: number; smtpHost: string; smtpPort: number };
  accounts: MailAccountDto[];
  addresses: MailAddressDto[];
}

/* Shared addresses ------------------------------------------------------------------------- */

/**
 * An extra address like hr@ or accounts@: its mail goes to the people it belongs to (one or
 * more), and they can send as it, under its own name ("Muvance HR").
 */
export const mailAddressSchema = z.object({
  localPart: mailLocalPartSchema,
  displayName: z.string().trim().min(1, 'Enter the name people will see').max(80),
  ownerIds: z
    .array(z.string().regex(/^[0-9a-f]{24}$/))
    .min(1, 'Choose who uses this address')
    .max(50),
});
export type MailAddressInput = z.infer<typeof mailAddressSchema>;

export const updateMailAddressSchema = mailAddressSchema.omit({ localPart: true }).partial();
export type UpdateMailAddressInput = z.infer<typeof updateMailAddressSchema>;

export interface MailAddressDto {
  id: string;
  address: string;
  localPart: string;
  displayName: string;
  owners: { id: string; address: string; name: string }[];
}

/** "hr" -> "Muvance HR", "accounts" -> "Muvance Accounts": a starting name for a new address. */
export function suggestAddressName(localPart: string, company = 'Muvance') {
  // General inboxes are just the company.
  if (['hello', 'info', 'contact', 'team', 'office'].includes(localPart.toLowerCase())) {
    return company;
  }
  const words = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((w) => (w.length <= 3 ? w.toUpperCase() : w[0]!.toUpperCase() + w.slice(1)));
  return `${company} ${words.join(' ')}`;
}
