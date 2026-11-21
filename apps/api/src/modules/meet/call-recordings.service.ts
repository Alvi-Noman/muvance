import { statfs, unlink, rm, readdir } from 'node:fs/promises';
import path from 'node:path';
import { ObjectId } from 'mongodb';
import type { CallRecordingDto, MeetRecordingStateDto } from '@muvance/shared';
import { env } from '@/config/env';
import { collections } from '@/db/client';
import type { CallRecordingDoc, UserDoc } from '@/db/types';
import { logger } from '@/lib/logger';
import { HttpError } from '@/utils/http-error';
import { recorder } from './egress';

const root = () => path.resolve(env.CALL_RECORDINGS_DIR);

/** The file on disk for a recording, refusing anything that would point outside the folder. */
export function recordingPath(doc: Pick<CallRecordingDoc, 'file'>) {
  const full = path.resolve(root(), doc.file);
  if (!full.startsWith(root() + path.sep)) throw HttpError.notFound('Recording not found');
  return full;
}

export function toCallRecordingDto(doc: CallRecordingDoc): CallRecordingDto {
  return {
    id: doc._id.toHexString(),
    code: doc.code,
    title: doc.title,
    startedByName: doc.startedByName,
    startedAt: doc.startedAt.toISOString(),
    endedAt: doc.endedAt?.toISOString() ?? null,
    status: doc.status,
    durationSec: doc.durationSec,
    sizeBytes: doc.sizeBytes,
    error: doc.error,
  };
}

async function freeGb() {
  try {
    const stats = await statfs(root());
    return (stats.bavail * stats.bsize) / 1024 ** 3;
  } catch {
    // The folder doesn't exist (e.g. in development): don't block on it.
    return Infinity;
  }
}

/** Brings one unfinished recording up to date with what LiveKit reports. */
async function sync(doc: CallRecordingDoc): Promise<CallRecordingDoc> {
  if (doc.status === 'ready' || doc.status === 'failed') return doc;
  const state = await recorder.state(doc.egressId);
  let update: Partial<CallRecordingDoc>;
  if (state) {
    update = {
      status: state.status,
      durationSec: state.durationSec ?? doc.durationSec,
      sizeBytes: state.sizeBytes ?? doc.sizeBytes,
      error: state.error,
      endedAt: state.status === 'recording' ? null : (doc.endedAt ?? new Date()),
    };
  } else if (Date.now() - doc.startedAt.getTime() > 60 * 60_000 * 12) {
    // LiveKit forgets finished jobs after a while; by then the file either exists or never will.
    update = { status: 'failed', error: 'The recorder lost track of this recording.' };
  } else {
    return doc;
  }
  await collections.callRecordings().updateOne({ _id: doc._id }, { $set: update });
  return { ...doc, ...update };
}

export const callRecordingsService = {
  /** Is this call being recorded? Checked by everyone in the call. */
  async stateFor(code: string): Promise<MeetRecordingStateDto> {
    const active = await collections
      .callRecordings()
      .find({ code, status: 'recording' })
      .sort({ startedAt: -1 })
      .toArray();
    for (const doc of active) {
      const fresh = await sync(doc);
      if (fresh.status === 'recording') {
        return {
          active: true,
          startedByName: fresh.startedByName,
          startedAt: fresh.startedAt.toISOString(),
        };
      }
    }
    return { active: false, startedByName: null, startedAt: null };
  },

  async start(code: string, title: string | null, user: UserDoc) {
    const state = await this.stateFor(code);
    if (state.active) throw HttpError.conflict('This call is already being recorded.');
    if ((await freeGb()) < env.CALL_RECORDINGS_MIN_FREE_GB) {
      throw new HttpError(
        507,
        'The server is almost out of space. Delete some old recordings in the admin first.',
      );
    }

    const startedAt = new Date();
    const file = `${code}/${startedAt.toISOString().replace(/[:.]/g, '-')}.mp4`;
    const egress = await recorder.start(code, file);
    const doc: CallRecordingDoc = {
      _id: new ObjectId(),
      egressId: egress.egressId,
      code,
      title,
      startedBy: user._id,
      startedByName: user.name,
      startedAt,
      endedAt: null,
      status: 'recording',
      file,
      durationSec: null,
      sizeBytes: null,
      error: null,
    };
    await collections.callRecordings().insertOne(doc);
    logger.info({ code, egressId: egress.egressId }, 'Call recording started');
    return doc;
  },

  async stop(code: string) {
    const active = await collections.callRecordings().find({ code, status: 'recording' }).toArray();
    for (const doc of active) {
      await recorder.stop(doc.egressId);
      await collections
        .callRecordings()
        .updateOne(
          { _id: doc._id, status: 'recording' },
          { $set: { status: 'processing', endedAt: new Date() } },
        );
    }
  },

  async list() {
    const docs = await collections
      .callRecordings()
      .find()
      .sort({ startedAt: -1 })
      .limit(500)
      .toArray();
    return Promise.all(docs.map(sync));
  },

  async get(id: ObjectId) {
    const doc = await collections.callRecordings().findOne({ _id: id });
    if (!doc) throw HttpError.notFound('Recording not found');
    return sync(doc);
  },

  async remove(doc: CallRecordingDoc) {
    if (doc.status === 'recording') await recorder.stop(doc.egressId);
    await unlink(recordingPath(doc)).catch(() => {});
    await collections.callRecordings().deleteOne({ _id: doc._id });
  },

  /** Deletes recordings past the retention period, and empty folders. Runs daily. */
  async cleanUp() {
    const cutoff = new Date(Date.now() - env.CALL_RECORDINGS_RETENTION_DAYS * 86_400_000);
    const old = await collections
      .callRecordings()
      .find({ startedAt: { $lt: cutoff } })
      .toArray();
    for (const doc of old) await this.remove(doc);
    if (old.length) logger.info({ count: old.length }, 'Deleted old call recordings');

    const folders = await readdir(root(), { withFileTypes: true }).catch(() => []);
    for (const folder of folders.filter((f) => f.isDirectory())) {
      const full = path.join(root(), folder.name);
      if ((await readdir(full).catch(() => ['x'])).length === 0) {
        await rm(full, { recursive: true }).catch(() => {});
      }
    }
  },
};
