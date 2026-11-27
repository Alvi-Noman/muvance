import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ObjectId } from 'mongodb';
import { env } from '@/config/env';

/** Files shared in chat live on the server's disk, one file per upload, named by its id. */
export const chatFiles = {
  pathOf(id: ObjectId) {
    return path.resolve(env.CHAT_FILES_DIR, id.toHexString());
  },

  async save(id: ObjectId, data: Buffer) {
    await mkdir(path.resolve(env.CHAT_FILES_DIR), { recursive: true });
    await writeFile(this.pathOf(id), data, { mode: 0o640 });
  },

  async remove(ids: ObjectId[]) {
    await Promise.all(ids.map((id) => rm(this.pathOf(id), { force: true })));
  },
};

/** Types shown in the browser itself; anything else is always downloaded (never run as a page). */
export const INLINE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/mp4',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
]);
