import type { Response } from 'express';
import type { MailAccountDoc } from '@/db/types';

/** Sends a profile picture. Its URL changes when the picture does, so it can be cached. */
export function sendAvatar(res: Response, avatar: NonNullable<MailAccountDoc['avatar']>) {
  res.setHeader('Cache-Control', 'private, max-age=86400');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.type(avatar.contentType).send(Buffer.from(avatar.data.buffer));
}
