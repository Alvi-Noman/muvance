import { AccessToken, RoomServiceClient, TokenVerifier, TrackSource } from 'livekit-server-sdk';
import {
  MEET_MAX_PARTICIPANTS,
  screenOwnerOf,
  type MeetParticipantMetadata,
} from '@muvance/shared';
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

/** A phone's screen presentation joins as its own participant (see screenToken). */
const screenIdentity = (identity: string) => `${identity}.screen`;

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
        // Seats beyond the people: the call recorder, and a screen presented from the Android app.
        maxParticipants: MEET_MAX_PARTICIPANTS + 2,
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
      // People only: not the call recorder (LiveKit Egress), which joins as a hidden participant,
      // nor a screen presented from the Android app.
      return list
        .filter((p) => p.kind !== EGRESS_KIND && !screenOwnerOf(p.metadata))
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

  /** Who a call token was issued to, if it's genuine and current; null otherwise. */
  async verify(jwt: string) {
    try {
      const claims = await new TokenVerifier(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET).verify(
        jwt,
      );
      if (!claims.sub || !claims.video?.room) return null;
      return { identity: claims.sub, room: claims.video.room, metadata: claims.metadata ?? '' };
    } catch {
      return null;
    }
  },

  /**
   * A token for presenting a phone's screen: it may only share a screen, and its metadata says
   * whose it is, so the call shows it as that person's presentation, not as another person.
   */
  async screenToken(code: string, ownerIdentity: string, name: string) {
    const metadata: MeetParticipantMetadata = { role: 'guest', screenOf: ownerIdentity };
    const token = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
      identity: screenIdentity(ownerIdentity),
      name,
      metadata: JSON.stringify(metadata),
      ttl: '6h',
    });
    token.addGrant({
      room: code,
      roomJoin: true,
      canPublish: true,
      canPublishSources: [TrackSource.SCREEN_SHARE, TrackSource.SCREEN_SHARE_AUDIO],
      canSubscribe: false,
      canPublishData: false,
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
    // Their phone's screen presentation goes with them (usually there isn't one).
    await rooms()
      .removeParticipant(code, screenIdentity(identity))
      .catch(() => {});
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
