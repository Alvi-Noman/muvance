import { ImapFlow, type ListResponse, type MessageStructureObject } from 'imapflow';
import type { WebmailAddress, WebmailFolderDto, WebmailFolderRole } from '@muvance/shared';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { HttpError } from '@/utils/http-error';
import type { MailSession } from './session';

/** Opens the person's mailbox on the mail server (IMAP over TLS), runs `work`, and closes it. */
export async function withImap<T>(session: MailSession, work: (client: ImapFlow) => Promise<T>) {
  const client = new ImapFlow({
    host: env.MAIL_HOST,
    port: 993,
    secure: true,
    auth: { user: session.address, pass: session.password },
    logger: false,
    // In production MAIL_HOST is a Docker network alias, so the certificate name still matches.
    tls: { servername: env.MAIL_HOST },
    connectionTimeout: 10_000,
  });
  try {
    await client.connect();
  } catch (error) {
    const authFailed = (error as { authenticationFailed?: boolean }).authenticationFailed;
    if (authFailed) throw HttpError.unauthorized('Your password changed. Please sign in again.');
    logger.error({ err: error }, 'Could not reach the mail server');
    throw new HttpError(503, "Couldn't reach the mail server. Please try again.");
  }
  try {
    return await work(client);
  } finally {
    await client.logout().catch(() => client.close());
  }
}

const roleByUse: Record<string, Exclude<WebmailFolderRole, null>> = {
  '\\Inbox': 'inbox',
  '\\Sent': 'sent',
  '\\Drafts': 'drafts',
  '\\Archive': 'archive',
  '\\Junk': 'junk',
  '\\Trash': 'trash',
};
const order: WebmailFolderRole[] = ['inbox', 'drafts', 'sent', 'archive', 'junk', 'trash'];

export function folderRole(folder: ListResponse): WebmailFolderRole {
  if (folder.path.toUpperCase() === 'INBOX') return 'inbox';
  return (folder.specialUse && roleByUse[folder.specialUse]) || null;
}

export async function listFolders(client: ImapFlow): Promise<WebmailFolderDto[]> {
  const folders = await client.list({ statusQuery: { messages: true, unseen: true } });
  const dtos = folders
    .filter((f) => !f.flags.has('\\Noselect'))
    .map((f) => ({
      path: f.path,
      name: f.path.toUpperCase() === 'INBOX' ? 'Inbox' : f.name,
      role: folderRole(f),
      unread: f.status?.unseen ?? 0,
      total: f.status?.messages ?? 0,
    }));
  const rank = (role: WebmailFolderRole) => {
    const i = order.indexOf(role);
    return i === -1 ? order.length : i;
  };
  return dtos.sort((a, b) => rank(a.role) - rank(b.role) || a.name.localeCompare(b.name));
}

/** The folder for a role ("archive", "trash"...), created if it doesn't exist yet. */
export async function folderFor(client: ImapFlow, roleOrPath: string) {
  const folders = await client.list();
  const role = roleOrPath.toLowerCase();
  const byRole = folders.find((f) => folderRole(f) === role);
  if (byRole) return byRole.path;
  const byPath = folders.find((f) => f.path === roleOrPath);
  if (byPath) return byPath.path;
  const names: Record<string, string> = {
    archive: 'Archive',
    trash: 'Trash',
    junk: 'Junk',
    sent: 'Sent',
    drafts: 'Drafts',
  };
  const name = names[role];
  if (!name) throw HttpError.notFound('Folder not found');
  await client.mailboxCreate(name).catch(() => {});
  return name;
}

export function toAddress(a?: { name?: string; address?: string }): WebmailAddress | null {
  if (!a?.address) return null;
  return { name: a.name ?? '', address: a.address.toLowerCase() };
}

export function toAddresses(list?: { name?: string; address?: string }[]) {
  return (list ?? []).map(toAddress).filter((a): a is WebmailAddress => !!a);
}

/** True if the message has a real attachment (not just inline images of an HTML email). */
export function hasAttachments(node?: MessageStructureObject): boolean {
  if (!node) return false;
  if (node.disposition === 'attachment') return true;
  return (node.childNodes ?? []).some(hasAttachments);
}

/** The part to make a preview from: plain text if there is one, otherwise HTML. */
export function previewPart(node?: MessageStructureObject) {
  let html: MessageStructureObject | undefined;
  const walk = (n?: MessageStructureObject): MessageStructureObject | undefined => {
    if (!n) return undefined;
    if (n.disposition === 'attachment') return undefined;
    if (n.type === 'text/plain') return n;
    if (n.type === 'text/html' && !html) html = n;
    for (const child of n.childNodes ?? []) {
      const found = walk(child);
      if (found) return found;
    }
    return undefined;
  };
  return walk(node) ?? html;
}

/** Turns the first bytes of a (possibly encoded) text part into one line of preview text. */
export function decodePreview(raw: Buffer, part: MessageStructureObject) {
  let bytes = raw;
  const encoding = (part.encoding ?? '').toLowerCase();
  if (encoding === 'base64') {
    const text = raw.toString('ascii').replace(/[^A-Za-z0-9+/=]/g, '');
    bytes = Buffer.from(text.slice(0, text.length - (text.length % 4)), 'base64');
  } else if (encoding === 'quoted-printable') {
    const text = raw
      .toString('latin1')
      .replace(/=\r?\n/g, '')
      .replace(/=([0-9A-F]{2})/gi, (_, h: string) => String.fromCharCode(parseInt(h, 16)));
    bytes = Buffer.from(text, 'latin1');
  }
  let text: string;
  try {
    text = new TextDecoder(part.parameters?.charset ?? 'utf-8').decode(bytes);
  } catch {
    text = bytes.toString('utf8');
  }
  if (part.type === 'text/html') {
    text = text
      .replace(/<(style|script|head)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&quot;/g, '"');
  }
  return text.replace(/^>.*$/gm, ' ').replace(/\s+/g, ' ').replace(/�/g, '').trim().slice(0, 180);
}
