import { randomBytes } from 'node:crypto';
import { Router, type Request } from 'express';
import type { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';
import MailComposer from 'nodemailer/lib/mail-composer';
import {
  mailAvatarSchema,
  webmailComposeSchema,
  webmailDeleteSchema,
  webmailFlagsSchema,
  webmailLoginSchema,
  webmailMoveSchema,
  webmailPasswordSchema,
  webmailSettingsSchema,
  type WebmailComposeInput,
  type WebmailContact,
  type WebmailMeDto,
  type WebmailMessage,
  type WebmailMessageList,
  type WebmailMessageSummary,
  type WebmailTeamAvatars,
} from '@muvance/shared';
import { env } from '@/config/env';
import { collections } from '@/db/client';
import { loginLimiter } from '@/middlewares/rate-limit';
import { validateBody } from '@/middlewares/validate';
import { verifySha512Crypt } from '@/lib/sha512-crypt';
import { mailService, webmailAvatarUrl } from '@/modules/mail/mail.service';
import { sendAvatar } from '@/modules/mail/send-avatar';
import { HttpError } from '@/utils/http-error';
import {
  decodePreview,
  folderFor,
  hasAttachments,
  listFolders,
  previewPart,
  toAddress,
  toAddresses,
  withImap,
} from './imap';
import { mailSession, requireMailSession, webmailSessions, type MailSession } from './session';

/** Muvance Mail, the webmail at mail.muvance.com. */
export const webmailRouter = Router();

const PAGE_SIZE = 50;

// Previews of message bodies, so the list doesn't re-read them on every refresh.
const previews = new Map<string, string>();
function rememberPreview(key: string, text: string) {
  if (previews.size > 20_000) previews.delete(previews.keys().next().value!);
  previews.set(key, text);
}

async function profileFor(address: string) {
  const doc = await collections.webmailProfiles().findOne({ _id: address });
  const account = await collections
    .mailAccounts()
    .findOne({ address }, { projection: { 'avatar.data': 0 } });
  return {
    avatarUrl: account ? webmailAvatarUrl(account) : null,
    displayName: doc?.displayName || account?.name || address.split('@')[0]!,
    signature: doc?.signature ?? '',
    name: account?.name ?? '',
    mustChangePassword: account?.mustChangePassword ?? false,
    contacts: doc?.contacts ?? [],
  };
}

const folderParam = (req: Request) => {
  const folder = String(req.query.folder ?? 'INBOX');
  if (!folder || folder.length > 500) throw HttpError.badRequest('Invalid folder');
  return folder;
};

// --- Sign-in ------------------------------------------------------------------------------

webmailRouter.post('/login', loginLimiter, validateBody(webmailLoginSchema), async (req, res) => {
  let { email } = req.body as { email: string; password: string };
  const { password } = req.body as { password: string };
  if (!email.includes('@')) email = `${email}@${env.MAIL_DOMAIN}`;
  const account = await collections.mailAccounts().findOne({ address: email });
  if (!account || !verifySha512Crypt(password, account.passwordHash)) {
    throw HttpError.unauthorized('Wrong email or password.');
  }
  await webmailSessions.create(account.address, password, res);
  res.json({ address: account.address });
});

webmailRouter.post('/logout', async (req, res) => {
  await webmailSessions.destroy(req, res);
  res.status(204).end();
});

webmailRouter.use(requireMailSession);

webmailRouter.get('/me', async (req, res) => {
  const { address } = mailSession(req);
  const profile = await profileFor(address);
  const me: WebmailMeDto = {
    address,
    name: profile.name,
    displayName: profile.displayName,
    signature: profile.signature,
    mustChangePassword: profile.mustChangePassword,
    avatarUrl: profile.avatarUrl,
  };
  res.json(me);
});

webmailRouter.put('/settings', validateBody(webmailSettingsSchema), async (req, res) => {
  const { address } = mailSession(req);
  await collections
    .webmailProfiles()
    .updateOne(
      { _id: address },
      { $set: req.body, $setOnInsert: { contacts: [] } },
      { upsert: true },
    );
  res.status(204).end();
});

webmailRouter.put('/avatar', validateBody(mailAvatarSchema), async (req, res) => {
  await mailService.setAvatar({ address: mailSession(req).address }, req.body.image as string);
  res.status(204).end();
});

webmailRouter.delete('/avatar', async (req, res) => {
  await mailService.setAvatar({ address: mailSession(req).address }, null);
  res.status(204).end();
});

/** Teammates' pictures, shown next to their mail. */
webmailRouter.get('/team-avatars', async (_req, res) => {
  const accounts = await collections
    .mailAccounts()
    .find({ avatar: { $type: 'object' } }, { projection: { address: 1, 'avatar.updatedAt': 1 } })
    .toArray();
  const map: WebmailTeamAvatars = {};
  for (const a of accounts) {
    const url = webmailAvatarUrl(a);
    if (url) map[a.address] = url;
  }
  res.json(map);
});

webmailRouter.get('/avatars/:address', async (req, res) => {
  sendAvatar(res, await mailService.avatar({ address: String(req.params.address).toLowerCase() }));
});

webmailRouter.post('/password', validateBody(webmailPasswordSchema), async (req, res) => {
  const session = mailSession(req);
  const { current, next } = req.body as { current?: string; next: string };
  const account = await collections.mailAccounts().findOne({ address: session.address });
  // Right after signing in with an admin-set password, this session already proves it.
  const proof = current || (account?.mustChangePassword ? session.password : '');
  if (next === proof)
    throw HttpError.badRequest('Choose a password different from the current one.');
  const changed = await mailService.changeOwnPassword(session.address, proof, next);
  if (!changed) throw HttpError.forbidden('Your current password is wrong.');
  // Every webmail sign-in ended with the change; keep this one signed in with the new password.
  await webmailSessions.create(session.address, next, res);
  res.status(204).end();
});

// --- Folders and messages -----------------------------------------------------------------

webmailRouter.get('/folders', async (req, res) => {
  res.json(await withImap(mailSession(req), (client) => listFolders(client)));
});

async function summaries(client: ImapFlow, session: MailSession, folder: string, uids: number[]) {
  if (!uids.length) return [];
  const mailbox = client.mailbox && client.mailbox.uidValidity;
  const rows = await client.fetchAll(
    uids,
    { uid: true, flags: true, envelope: true, bodyStructure: true, internalDate: true },
    { uid: true },
  );

  // Fetch the first bytes of each message's text, grouped by MIME part number.
  const wanted = new Map<string, number[]>();
  for (const row of rows) {
    const key = `${session.address}:${folder}:${mailbox}:${row.uid}`;
    if (previews.has(key)) continue;
    const part = previewPart(row.bodyStructure);
    if (!part) continue;
    const id = part.part ?? '1';
    wanted.set(id, [...(wanted.get(id) ?? []), row.uid]);
  }
  for (const [part, partUids] of wanted) {
    const parts = await client.fetchAll(
      partUids,
      { uid: true, bodyParts: [{ key: part, start: 0, maxLength: 1500 }] },
      { uid: true },
    );
    for (const p of parts) {
      const row = rows.find((r) => r.uid === p.uid);
      const node = previewPart(row?.bodyStructure);
      const raw = p.bodyParts && [...p.bodyParts.values()][0];
      if (node && raw) {
        rememberPreview(
          `${session.address}:${folder}:${mailbox}:${p.uid}`,
          decodePreview(raw, node),
        );
      }
    }
  }

  return rows
    .map<WebmailMessageSummary>((row) => {
      const flags = row.flags ?? new Set<string>();
      return {
        uid: row.uid,
        from: toAddress(row.envelope?.from?.[0]),
        to: toAddresses(row.envelope?.to),
        subject: row.envelope?.subject ?? '',
        date: new Date(row.envelope?.date ?? row.internalDate ?? Date.now()).toISOString(),
        seen: flags.has('\\Seen'),
        flagged: flags.has('\\Flagged'),
        answered: flags.has('\\Answered'),
        hasAttachments: hasAttachments(row.bodyStructure),
        snippet: previews.get(`${session.address}:${folder}:${mailbox}:${row.uid}`) ?? '',
      };
    })
    .sort((a, b) => b.uid - a.uid);
}

webmailRouter.get('/messages', async (req, res) => {
  const session = mailSession(req);
  const folder = folderParam(req);
  const page = Math.max(0, Number(req.query.page ?? 0) || 0);
  const q = String(req.query.q ?? '').trim();

  const list = await withImap(session, async (client) => {
    const lock = await client.getMailboxLock(folder);
    try {
      let all: number[];
      if (q) {
        const found = await client.search(
          { or: [{ subject: q }, { from: q }, { to: q }, { body: q }] },
          { uid: true },
        );
        all = Array.isArray(found) ? found : [];
      } else {
        const found = await client.search({ all: true }, { uid: true });
        all = Array.isArray(found) ? found : [];
      }
      all.sort((a, b) => b - a);
      const slice = all.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
      const result: WebmailMessageList = {
        folder,
        total: all.length,
        messages: await summaries(client, session, folder, slice),
        nextPage: (page + 1) * PAGE_SIZE < all.length ? page + 1 : null,
      };
      return result;
    } finally {
      lock.release();
    }
  });
  res.json(list);
});

async function readMessage(client: ImapFlow, uid: number) {
  const row = await client.fetchOne(
    String(uid),
    { uid: true, source: true, flags: true },
    { uid: true },
  );
  if (!row || !row.source) throw HttpError.notFound('This message no longer exists.');
  return { row, parsed: await simpleParser(row.source) };
}

webmailRouter.get('/messages/:uid', async (req, res) => {
  const session = mailSession(req);
  const folder = folderParam(req);
  const uid = Number(req.params.uid);
  if (!Number.isInteger(uid) || uid < 1) throw HttpError.notFound('Message not found');

  const message = await withImap(session, async (client) => {
    const lock = await client.getMailboxLock(folder);
    try {
      const { row, parsed } = await readMessage(client, uid);
      const flags = row.flags ?? new Set<string>();
      if (!flags.has('\\Seen')) {
        await client.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true });
      }
      const attachments = parsed.attachments
        .map((a, index) => ({ a, index }))
        .filter(({ a }) => !a.related)
        .map(({ a, index }) => ({
          index,
          filename: a.filename ?? `attachment-${index + 1}`,
          contentType: a.contentType,
          size: a.size,
        }));
      const refs = parsed.references;
      const result: WebmailMessage = {
        uid,
        folder,
        from: toAddress(parsed.from?.value[0]),
        to: toAddresses(
          (Array.isArray(parsed.to) ? parsed.to : parsed.to ? [parsed.to] : []).flatMap(
            (t) => t.value,
          ),
        ),
        cc: toAddresses(
          (Array.isArray(parsed.cc) ? parsed.cc : parsed.cc ? [parsed.cc] : []).flatMap(
            (t) => t.value,
          ),
        ),
        replyTo: toAddresses(parsed.replyTo?.value),
        subject: parsed.subject ?? '',
        date: (parsed.date ?? new Date()).toISOString(),
        seen: true,
        flagged: flags.has('\\Flagged'),
        answered: flags.has('\\Answered'),
        hasAttachments: attachments.length > 0,
        snippet: '',
        // Inline images arrive as data: URLs (mailparser), so the frame needs no network access.
        html: parsed.html || null,
        text: parsed.text ?? null,
        attachments,
        messageId: parsed.messageId ?? null,
        references: Array.isArray(refs) ? refs : refs ? [refs] : [],
      };
      return result;
    } finally {
      lock.release();
    }
  });
  res.json(message);
});

webmailRouter.get('/messages/:uid/attachments/:index', async (req, res) => {
  const session = mailSession(req);
  const folder = folderParam(req);
  const uid = Number(req.params.uid);
  const index = Number(req.params.index);
  const attachment = await withImap(session, async (client) => {
    const lock = await client.getMailboxLock(folder);
    try {
      const { parsed } = await readMessage(client, uid);
      return parsed.attachments[index];
    } finally {
      lock.release();
    }
  });
  if (!attachment) throw HttpError.notFound('Attachment not found');
  const filename = (attachment.filename ?? 'attachment').replace(/["\r\n]/g, '');
  res.setHeader('Content-Type', attachment.contentType || 'application/octet-stream');
  res.setHeader(
    'Content-Disposition',
    `${req.query.inline ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(filename)}`,
  );
  // Never let an attachment run as a page on mail.muvance.com.
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox",
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.send(attachment.content);
});

webmailRouter.post('/messages/flags', validateBody(webmailFlagsSchema), async (req, res) => {
  const { folder, uids, seen, flagged } = req.body as {
    folder: string;
    uids: number[];
    seen?: boolean;
    flagged?: boolean;
  };
  await withImap(mailSession(req), async (client) => {
    const lock = await client.getMailboxLock(folder);
    try {
      const range = uids.join(',');
      if (seen !== undefined) {
        await (seen ? client.messageFlagsAdd : client.messageFlagsRemove).call(
          client,
          range,
          ['\\Seen'],
          { uid: true },
        );
      }
      if (flagged !== undefined) {
        await (flagged ? client.messageFlagsAdd : client.messageFlagsRemove).call(
          client,
          range,
          ['\\Flagged'],
          { uid: true },
        );
      }
    } finally {
      lock.release();
    }
  });
  res.status(204).end();
});

webmailRouter.post('/messages/move', validateBody(webmailMoveSchema), async (req, res) => {
  const { folder, uids, to } = req.body as { folder: string; uids: number[]; to: string };
  await withImap(mailSession(req), async (client) => {
    const target = to.toLowerCase() === 'inbox' ? 'INBOX' : await folderFor(client, to);
    const lock = await client.getMailboxLock(folder);
    try {
      await client.messageMove(uids.join(','), target, { uid: true });
    } finally {
      lock.release();
    }
  });
  res.status(204).end();
});

/** Moves to Trash; deleting from Trash (or Junk) removes for good. */
webmailRouter.post('/messages/delete', validateBody(webmailDeleteSchema), async (req, res) => {
  const { folder, uids } = req.body as { folder: string; uids: number[] };
  await withImap(mailSession(req), async (client) => {
    const trash = await folderFor(client, 'trash');
    const junk = await folderFor(client, 'junk');
    const lock = await client.getMailboxLock(folder);
    try {
      if (folder === trash || folder === junk) {
        await client.messageDelete(uids.join(','), { uid: true });
      } else {
        await client.messageMove(uids.join(','), trash, { uid: true });
      }
    } finally {
      lock.release();
    }
  });
  res.status(204).end();
});

// --- Writing ------------------------------------------------------------------------------

async function buildMessage(session: MailSession, input: WebmailComposeInput, keepBcc: boolean) {
  const profile = await profileFor(session.address);
  const composer = new MailComposer({
    from: { name: profile.displayName, address: session.address },
    to: input.to,
    cc: input.cc,
    bcc: input.bcc,
    subject: input.subject,
    html: input.html || undefined,
    text: input.text || undefined,
    inReplyTo: input.inReplyTo,
    references: input.references,
    messageId: `<${randomBytes(12).toString('hex')}@${env.MAIL_DOMAIN}>`,
    date: new Date(),
    attachments: input.attachments.map((a) => ({
      filename: a.filename,
      contentType: a.contentType,
      content: Buffer.from(a.content, 'base64'),
    })),
  });
  const node = composer.compile();
  // The Sent copy and drafts keep Bcc so you can see who you copied; the sent message doesn't.
  node.keepBcc = keepBcc;
  return node.build();
}

async function rememberContacts(address: string, recipients: string[]) {
  if (!recipients.length) return;
  const profile = await collections.webmailProfiles().findOne({ _id: address });
  const contacts = profile?.contacts ?? [];
  const now = new Date();
  for (const r of recipients.map((x) => x.toLowerCase())) {
    const existing = contacts.find((c) => c.address === r);
    if (existing) {
      existing.count += 1;
      existing.lastUsed = now;
    } else {
      contacts.push({ name: '', address: r, lastUsed: now, count: 1 });
    }
  }
  contacts.sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime());
  await collections
    .webmailProfiles()
    .updateOne({ _id: address }, { $set: { contacts: contacts.slice(0, 500) } }, { upsert: true });
}

webmailRouter.post('/send', validateBody(webmailComposeSchema), async (req, res) => {
  const session = mailSession(req);
  const input = req.body as WebmailComposeInput;
  const recipients = [...input.to, ...input.cc, ...input.bcc];
  if (!recipients.length) throw HttpError.badRequest('Add at least one recipient.');

  const raw = await buildMessage(session, input, false);
  // Sent through the mail server (signed with muvance.com's DKIM key, relayed via Brevo).
  const transport = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: { user: session.address, pass: session.password },
    tls: { servername: env.MAIL_HOST },
  });
  try {
    await transport.sendMail({ envelope: { from: session.address, to: recipients }, raw });
  } catch (error) {
    const code = (error as { responseCode?: number }).responseCode;
    if (code === 535) throw HttpError.unauthorized('Your password changed. Please sign in again.');
    throw new HttpError(502, `Couldn't send: ${(error as Error).message}`);
  } finally {
    transport.close();
  }

  await withImap(session, async (client) => {
    const sent = await folderFor(client, 'sent');
    await client.append(sent, await buildMessage(session, input, true), ['\\Seen']);
    if (input.draftUid) {
      const drafts = await folderFor(client, 'drafts');
      const lock = await client.getMailboxLock(drafts);
      try {
        await client.messageDelete(String(input.draftUid), { uid: true });
      } finally {
        lock.release();
      }
    }
    if (input.replyTo) {
      const lock = await client.getMailboxLock(input.replyTo.folder);
      try {
        await client.messageFlagsAdd(String(input.replyTo.uid), ['\\Answered'], { uid: true });
      } finally {
        lock.release();
      }
    }
  });
  await rememberContacts(session.address, recipients);
  res.status(204).end();
});

webmailRouter.post('/drafts', validateBody(webmailComposeSchema), async (req, res) => {
  const session = mailSession(req);
  const input = req.body as WebmailComposeInput;
  const uid = await withImap(session, async (client) => {
    const drafts = await folderFor(client, 'drafts');
    const saved = await client.append(drafts, await buildMessage(session, input, true), [
      '\\Draft',
      '\\Seen',
    ]);
    if (input.draftUid) {
      const lock = await client.getMailboxLock(drafts);
      try {
        await client.messageDelete(String(input.draftUid), { uid: true });
      } finally {
        lock.release();
      }
    }
    return saved ? (saved.uid ?? null) : null;
  });
  res.json({ draftUid: uid });
});

webmailRouter.get('/contacts', async (req, res) => {
  const { address } = mailSession(req);
  const q = String(req.query.q ?? '')
    .trim()
    .toLowerCase();
  const profile = await profileFor(address);
  const team = await collections
    .mailAccounts()
    .find({ address: { $ne: address } })
    .project<{ address: string; name: string }>({ address: 1, name: 1 })
    .toArray();
  const all: WebmailContact[] = [
    ...profile.contacts.map((c) => ({ name: c.name, address: c.address })),
    ...team.map((t) => ({ name: t.name, address: t.address })),
  ];
  const seen = new Set<string>();
  const matches = all.filter((c) => {
    if (seen.has(c.address)) return false;
    seen.add(c.address);
    return !q || c.address.includes(q) || c.name.toLowerCase().includes(q);
  });
  res.json(matches.slice(0, 8));
});
