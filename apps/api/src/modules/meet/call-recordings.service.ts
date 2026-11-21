import { statfs, unlink } from 'node:fs/promises';
import path from 'node:path';
import { ObjectId } from 'mongodb';
import type { CallRecordingDto, MeetRecordingStateDto } from '@muvance/shared';
import { env } from '@/config/env';
import { collections } from '@/db/client';
import type { CallRecordingDoc, UserDoc } from '@/db/types';
import { logger } from '@/lib/logger';
import { HttpError } from '@/utils/http-error';
import { recorder } from './egress';
import { livekit } from './livekit';

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
    stopReason: doc.stopReason ?? null,
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
      // Reaching the length limit isn't an error: the recording up to then is saved.
      error: state.limitReached ? null : state.error,
      endedAt: state.status === 'recording' ? null : (doc.endedAt ?? new Date()),
      ...(state.limitReached && {
        stopReason: 'Stopped automatically at the 3-hour limit. Start a new recording to continue.',
      }),
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
    // All in one folder: the recorder and the API run as different users, and the API may only
    // delete files in folders it can write to (not ones the recorder creates).
    const file = `${code}_${startedAt.toISOString().replace(/[:.]/g, '-')}.mp4`;
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
    try {
      await unlink(recordingPath(doc));
    } catch (error) {
      // Already gone is fine; anything else would leave the video taking up disk space.
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        logger.error({ err: error, file: doc.file }, 'Could not delete a call recording file');
        throw new HttpError(500, "Couldn't delete the video file. Please try again.");
      }
    }
    await collections.callRecordings().deleteOne({ _id: doc._id });
  },

  /**
   * Stops recordings of calls that have gone quiet, so a forgotten call doesn't record for hours:
   * fewer than two people in it, or nobody's microphone on, for CALL_RECORDINGS_IDLE_MINUTES in a
   * row. Runs every minute.
   */
  async stopIdle(now = new Date()) {
    const active = await collections.callRecordings().find({ status: 'recording' }).toArray();
    for (const doc of active) {
      const fresh = await sync(doc);
      if (fresh.status !== 'recording') continue;

      const people = await livekit.participants(doc.code);
      const someoneTalking = people.some((p) =>
        p.tracks.some((t) => t.source === 'microphone' && !t.muted),
      );
      const inactive = people.length < 2 || !someoneTalking;

      if (!inactive) {
        if (doc.idleSince) {
          await collections
            .callRecordings()
            .updateOne({ _id: doc._id }, { $set: { idleSince: null } });
        }
        continue;
      }
      if (!doc.idleSince) {
        await collections
          .callRecordings()
          .updateOne({ _id: doc._id }, { $set: { idleSince: now } });
        continue;
      }
      const minutes = env.CALL_RECORDINGS_IDLE_MINUTES;
      if (now.getTime() - doc.idleSince.getTime() < minutes * 60_000) continue;

      await recorder.stop(doc.egressId);
      const reason =
        people.length < 2
          ? `Stopped automatically: fewer than two people in the call for ${minutes} minutes.`
          : `Stopped automatically: every microphone was off for ${minutes} minutes.`;
      await collections
        .callRecordings()
        .updateOne(
          { _id: doc._id, status: 'recording' },
          { $set: { status: 'processing', endedAt: now, stopReason: reason, idleSince: null } },
        );
      logger.info({ code: doc.code, egressId: doc.egressId }, 'Stopped an inactive call recording');
    }
  },

  /** Deletes recordings past the retention period. Runs daily. */
  async cleanUp() {
    const cutoff = new Date(Date.now() - env.CALL_RECORDINGS_RETENTION_DAYS * 86_400_000);
    const old = await collections
      .callRecordings()
      .find({ startedAt: { $lt: cutoff } })
      .toArray();
    for (const doc of old) await this.remove(doc);
    if (old.length) logger.info({ count: old.length }, 'Deleted old call recordings');
  },
};
