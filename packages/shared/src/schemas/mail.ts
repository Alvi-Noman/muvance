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
  quotaGb: z.coerce.number().int().min(1).max(100).default(10),
  /** Other addresses that deliver to this inbox, e.g. "sales" for sales@. */
  aliases: z.array(mailLocalPartSchema).max(20).default([]),
});
export type CreateMailAccountInput = z.infer<typeof createMailAccountSchema>;

export const updateMailAccountSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  quotaGb: z.coerce.number().int().min(1).max(100).optional(),
  aliases: z.array(mailLocalPartSchema).max(20).optional(),
});
export type UpdateMailAccountInput = z.infer<typeof updateMailAccountSchema>;

export const setMailPasswordSchema = z.object({ password: mailPasswordSchema });

export interface MailAccountDto {
  id: string;
  address: string;
  localPart: string;
  name: string;
  quotaGb: number;
  aliases: string[];
  createdAt: string;
  createdByName: string;
}

export interface MailAccountsDto {
  domain: string;
  webmailUrl: string;
  /** Settings for phone and desktop mail apps. */
  clientSettings: { imapHost: string; imapPort: number; smtpHost: string; smtpPort: number };
  accounts: MailAccountDto[];
}
