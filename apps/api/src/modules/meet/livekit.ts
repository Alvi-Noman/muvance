import { AccessToken, RoomServiceClient, TrackSource } from 'livekit-server-sdk';
import { MEET_MAX_PARTICIPANTS, type MeetParticipantMetadata } from '@muvance/shared';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { HttpError } from '@/utils/http-error';

/** Talks to LiveKit, the media server that carries the meetings' audio and video. */
let client: RoomServiceClient | undefined;
function rooms() {
  client ??= new RoomServiceClient(env.LIVEKIT_URL, env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET);
  return client;
}

async function call<T>(what: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    logger.error({ err: error, what }, 'LiveKit request failed');
    throw new HttpError(503, 'Video calls are unavailable right now. Please try again shortly.');
  }
}

/** ParticipantInfo.Kind.EGRESS (not exported by the SDK). */
const EGRESS_KIND = 2;

export interface LiveParticipant {
  identity: string;
  name: string;
  tracks: {
    sid: string;
    source: 'microphone' | 'camera' | 'screen_share' | 'other';
    muted: boolean;
  }[];
}

const sources: Record<number, LiveParticipant['tracks'][number]['source']> = {
  [TrackSource.MICROPHONE]: 'microphone',
  [TrackSource.CAMERA]: 'camera',
  [TrackSource.SCREEN_SHARE]: 'screen_share',
};

export const livekit = {
  /** Makes sure the room exists with the 5-person cap (creating an existing room is a no-op). */
  async ensureRoom(code: string) {
    await call('createRoom', () =>
      rooms().createRoom({
        name: code,
        // One seat more than people may take: the call recorder joins as a hidden participant.
        maxParticipants: MEET_MAX_PARTICIPANTS + 1,
        // Close the call a few minutes after the last person leaves. There's no time limit.
        emptyTimeout: 5 * 60,
        departureTimeout: 60,
      }),
    );
  },

  /** Who is in the call now. An empty list if the call hasn't started. */
  async participants(code: string): Promise<LiveParticipant[]> {
    try {
      const list = await rooms().listParticipants(code);
      // People only: not the call recorder (LiveKit Egress), which joins as a hidden participant.
      return list
        .filter((p) => p.kind !== EGRESS_KIND)
        .map((p) => ({
          identity: p.identity,
          name: p.name || 'Guest',
          tracks: p.tracks.map((t) => ({
            sid: t.sid,
            source: sources[t.source] ?? 'other',
            muted: t.muted,
          })),
        }));
    } catch (error) {
      // A room that doesn't exist yet (nobody has joined) is reported as an error: it's empty.
      const status = (error as { status?: number }).status;
      if (status === 404) return [];
      logger.warn({ err: error, code }, 'Could not list meeting participants');
      return [];
    }
  },

  async token(code: string, identity: string, name: string, metadata: MeetParticipantMetadata) {
    const token = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
      identity,
      name,
      metadata: JSON.stringify(metadata),
      // Only needed to connect; LiveKit keeps a connected person's access fresh for as long as the
      // call runs, so calls have no time limit.
      ttl: '6h',
    });
    token.addGrant({
      room: code,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canUpdateOwnMetadata: true,
    });
    return token.toJwt();
  },

  async mute(code: string, identity: string, trackSid: string) {
    await call('mutePublishedTrack', () =>
      rooms().mutePublishedTrack(code, identity, trackSid, true),
    );
  },

  async remove(code: string, identity: string) {
    await call('removeParticipant', () => rooms().removeParticipant(code, identity));
  },

  /** Ends the call for everyone. */
  async end(code: string) {
    try {
      await rooms().deleteRoom(code);
    } catch (error) {
      if ((error as { status?: number }).status === 404) return;
      throw error;
    }
  },
};
