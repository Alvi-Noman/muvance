import { z } from 'zod';

/** Muvance Mail (mail.muvance.com): what the webmail app and the API exchange. */

export const webmailLoginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Enter your email address').max(200),
  password: z.string().min(1, 'Enter your password').max(200),
});

export type WebmailFolderRole = 'inbox' | 'sent' | 'drafts' | 'archive' | 'junk' | 'trash' | null;

export interface WebmailFolderDto {
  path: string;
  name: string;
  role: WebmailFolderRole;
  unread: number;
  total: number;
}

export interface WebmailAddress {
  name: string;
  address: string;
}

export interface WebmailMessageSummary {
  uid: number;
  from: WebmailAddress | null;
  to: WebmailAddress[];
  subject: string;
  date: string;
  seen: boolean;
  flagged: boolean;
  answered: boolean;
  hasAttachments: boolean;
  snippet: string;
}

export interface WebmailMessageList {
  folder: string;
  total: number;
  messages: WebmailMessageSummary[];
  /** Pass back as `page` for the next (older) page; null at the end. */
  nextPage: number | null;
}

export interface WebmailAttachment {
  index: number;
  filename: string;
  contentType: string;
  size: number;
}

export interface WebmailMessage extends WebmailMessageSummary {
  folder: string;
  cc: WebmailAddress[];
  replyTo: WebmailAddress[];
  /** Raw HTML from the sender. The app sanitizes it and shows it in a sandboxed frame. */
  html: string | null;
  text: string | null;
  attachments: WebmailAttachment[];
  messageId: string | null;
  references: string[];
}

export const webmailFlagsSchema = z.object({
  folder: z.string().min(1).max(500),
  uids: z.array(z.number().int().positive()).min(1).max(500),
  seen: z.boolean().optional(),
  flagged: z.boolean().optional(),
});

export const webmailMoveSchema = z.object({
  folder: z.string().min(1).max(500),
  uids: z.array(z.number().int().positive()).min(1).max(500),
  /** A folder path, or a role ("archive", "trash", "junk", "inbox"). */
  to: z.string().min(1).max(500),
});

export const webmailDeleteSchema = z.object({
  folder: z.string().min(1).max(500),
  uids: z.array(z.number().int().positive()).min(1).max(500),
});

const recipient = z.string().trim().email('Check this address').max(254);

export const webmailComposeSchema = z.object({
  to: z.array(recipient).max(100).default([]),
  cc: z.array(recipient).max(100).default([]),
  bcc: z.array(recipient).max(100).default([]),
  subject: z.string().max(500).default(''),
  html: z.string().max(2_000_000).default(''),
  text: z.string().max(1_000_000).default(''),
  inReplyTo: z.string().max(1000).optional(),
  references: z.array(z.string().max(1000)).max(100).optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string().min(1).max(255),
        contentType: z.string().max(255).default('application/octet-stream'),
        /** Base64. */
        content: z.string(),
      }),
    )
    .max(20)
    .default([]),
  /** The draft this replaces (deleted after saving or sending). */
  draftUid: z.number().int().positive().optional(),
  /** The message being replied to, marked as answered after sending. */
  replyTo: z.object({ folder: z.string(), uid: z.number().int().positive() }).optional(),
});
export type WebmailComposeInput = z.infer<typeof webmailComposeSchema>;

export const webmailSettingsSchema = z.object({
  displayName: z.string().trim().max(80),
  signature: z.string().max(20_000),
});
export type WebmailSettings = z.infer<typeof webmailSettingsSchema>;

export const webmailPasswordSchema = z.object({
  current: z.string().min(1),
  next: z.string().min(10, 'At least 10 characters').max(128),
});

export interface WebmailMeDto extends WebmailSettings {
  address: string;
  name: string;
}

export interface WebmailContact {
  name: string;
  address: string;
}
