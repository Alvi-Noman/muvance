import nodemailer from 'nodemailer';
import { env } from '@/config/env';
import { collections } from '@/db/client';
import { senderNameOf } from '@/modules/mail/mail.service';

/**
 * Emails from Muvance Chat (guest invites and unread-message alerts) are sent from the teammate's
 * own @muvance.com address, through the team mail server, so clients see who wrote to them.
 */
export const chatMailer = {
  async send(
    from: { email: string; password: string },
    message: { to: string; subject: string; html: string; text: string },
  ) {
    const account = await collections
      .mailAccounts()
      .findOne({ address: from.email }, { projection: { 'avatar.data': 0 } });
    const name = account ? senderNameOf(account) : from.email;
    const transport = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: 465,
      secure: true,
      auth: { user: from.email, pass: from.password },
      tls: { servername: env.MAIL_HOST },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
    });
    try {
      await transport.sendMail({ from: { name, address: from.email }, ...message });
    } finally {
      transport.close();
    }
  },
};

/** Whether Muvance can send email itself (the relay's login is set), not only as a teammate. */
export const canSendAsMuvance = () => Boolean(env.RELAY_USER && env.RELAY_PASSWORD);

/** Emails from Muvance Chat itself (clients' sign-in codes), through the outgoing relay. */
export const systemMailer = {
  async send(message: { to: string; subject: string; html: string; text: string }) {
    const transport = nodemailer.createTransport({
      host: env.RELAY_HOST,
      port: env.RELAY_PORT,
      secure: env.RELAY_PORT === 465,
      auth: { user: env.RELAY_USER!, pass: env.RELAY_PASSWORD! },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
    });
    try {
      await transport.sendMail({
        from: { name: 'Muvance Chat', address: `no-reply@${env.MAIL_DOMAIN}` },
        ...message,
      });
    } finally {
      transport.close();
    }
  },
};

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A simple, readable email with one button (and a sign-in code, shown large, when given). */
export function chatEmail(opts: {
  heading: string;
  lines: string[];
  button: string;
  url: string;
  code?: string;
}) {
  const code = opts.code
    ? `<p style="font-size:34px;font-weight:600;letter-spacing:8px;font-family:Consolas,Menlo,monospace;margin:20px 0 4px;color:#121212">${escape(opts.code)}</p>`
    : '';
  const html = `<!doctype html><html><body style="margin:0;background:#f4f4f2;font-family:Inter,Segoe UI,Arial,sans-serif;color:#121212">
<div style="max-width:520px;margin:0 auto;padding:32px 20px">
<p style="font-weight:600;font-size:15px;margin:0 0 24px">Muvance Chat</p>
<div style="background:#fff;border:1px solid #e7e6e2;border-radius:16px;padding:28px">
<h1 style="font-size:20px;line-height:1.3;margin:0 0 12px">${escape(opts.heading)}</h1>
${opts.lines.map((l) => `<p style="font-size:15px;line-height:1.6;margin:0 0 12px;color:#3a3a38;white-space:pre-wrap">${escape(l)}</p>`).join('')}${code}
<p style="margin:24px 0 0"><a href="${escape(opts.url)}" style="display:inline-block;background:#121212;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:500;font-size:15px">${escape(opts.button)}</a></p>
</div>
<p style="font-size:12px;color:#6b6b68;margin:16px 4px 0">If the button doesn't work, open this link: ${escape(opts.url)}</p>
</div></body></html>`;
  const text = [
    opts.heading,
    '',
    ...opts.lines,
    ...(opts.code ? ['', opts.code] : []),
    '',
    `${opts.button}: ${opts.url}`,
  ].join('\n');
  return { html, text };
}
