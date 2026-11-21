import {
  EgressClient,
  EgressStatus,
  EncodedFileOutput,
  EncodedFileType,
  EncodingOptionsPreset,
  type EgressInfo,
} from 'livekit-server-sdk';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { HttpError } from '@/utils/http-error';

/**
 * LiveKit Egress: records a call the way people see it (the speaker or the shared screen large,
 * everyone else small) into an MP4 file on the server.
 */
let client: EgressClient | undefined;
function egress() {
  client ??= new EgressClient(env.LIVEKIT_URL, env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET);
  return client;
}

export interface EgressState {
  egressId: string;
  status: 'recording' | 'processing' | 'ready' | 'failed';
  durationSec: number | null;
  sizeBytes: number | null;
  error: string | null;
}

function toState(info: EgressInfo): EgressState {
  const file = info.fileResults[0];
  const status =
    info.status === EgressStatus.EGRESS_STARTING || info.status === EgressStatus.EGRESS_ACTIVE
      ? 'recording'
      : info.status === EgressStatus.EGRESS_ENDING
        ? 'processing'
        : info.status === EgressStatus.EGRESS_COMPLETE ||
            info.status === EgressStatus.EGRESS_LIMIT_REACHED
          ? 'ready'
          : 'failed';
  return {
    egressId: info.egressId,
    status,
    // LiveKit reports nanoseconds.
    durationSec:
      file && file.duration > 0n ? Math.round(Number(file.duration / 1_000_000_000n)) : null,
    sizeBytes: file && file.size > 0n ? Number(file.size) : null,
    error: info.error || null,
  };
}

export const recorder = {
  /** Starts recording a call into `<EGRESS_OUTPUT_DIR>/<relativeFile>`. */
  async start(code: string, relativeFile: string): Promise<EgressState> {
    try {
      const info = await egress().startRoomCompositeEgress(
        code,
        new EncodedFileOutput({
          fileType: EncodedFileType.MP4,
          filepath: `${env.EGRESS_OUTPUT_DIR}/${relativeFile}`,
          // No summary .json next to each video; the database keeps those details.
          disableManifest: true,
        }),
        { layout: 'speaker', encodingOptions: EncodingOptionsPreset.H264_720P_30 },
      );
      return toState(info);
    } catch (error) {
      logger.error({ err: error, code }, 'Could not start a call recording');
      const message = error instanceof Error ? error.message : '';
      if (/cpu|resource|no response|not available|unavailable/i.test(message)) {
        throw new HttpError(
          503,
          'The recorder is busy or not running. Try again in a minute, or stop another recording.',
        );
      }
      throw new HttpError(503, "Couldn't start recording. Please try again.");
    }
  },

  async stop(egressId: string) {
    try {
      await egress().stopEgress(egressId);
    } catch (error) {
      // Already finished (e.g. everyone left): nothing to stop.
      logger.warn({ err: error, egressId }, 'Stopping a call recording failed');
    }
  },

  /** The current state of one recording, or null if LiveKit no longer knows it. */
  async state(egressId: string): Promise<EgressState | null> {
    try {
      const [info] = await egress().listEgress({ egressId });
      return info ? toState(info) : null;
    } catch (error) {
      logger.warn({ err: error, egressId }, 'Could not read a call recording state');
      return null;
    }
  },
};
