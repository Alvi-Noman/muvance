import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { env } from '@/config/env';

/**
 * AES-256-GCM with the server's WEBMAIL_SECRET: for passwords a session must keep (the mail server
 * needs a person's password to open their mailbox). Never sent to the browser.
 */
const key = () => createHash('sha256').update(env.WEBMAIL_SECRET).digest();

export function encrypt(text: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((b) => b.toString('base64url')).join('.');
}

export function decrypt(value: string) {
  const [iv, tag, data] = value.split('.').map((p) => Buffer.from(p, 'base64url'));
  const decipher = createDecipheriv('aes-256-gcm', key(), iv!);
  decipher.setAuthTag(tag!);
  return Buffer.concat([decipher.update(data!), decipher.final()]).toString('utf8');
}
