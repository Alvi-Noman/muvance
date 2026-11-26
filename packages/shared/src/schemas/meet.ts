import { z } from 'zod';

/** Video meetings at meet.muvance.com: at most this many people in one meeting. */
export const MEET_MAX_PARTICIPANTS = 5;

/** Meeting codes look like "abc-defg-hij". */
export const meetCodePattern = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
export const meetCodeSchema = z.string().regex(meetCodePattern, 'Invalid meeting code');

export const createMeetRoomSchema = z.object({
  title: z.string().trim().max(120).optional(),
});
export type CreateMeetRoomInput = z.infer<typeof createMeetRoomSchema>;

export const updateMeetRoomSchema = z.object({
  title: z.string().trim().max(120).optional(),
  /** Let anyone with the link join without asking. */
  quickAccess: z.boolean().optional(),
});
export type UpdateMeetRoomInput = z.infer<typeof updateMeetRoomSchema>;

export const joinMeetRoomSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name').max(60),
});
export type JoinMeetRoomInput = z.infer<typeof joinMeetRoomSchema>;

export const meetDecisionSchema = z.object({ admit: z.boolean() });

export const meetMuteSchema = z.object({
  source: z.enum(['microphone', 'camera', 'screen_share']).default('microphone'),
});

/** What a participant's LiveKit metadata holds. */
export type MeetParticipantRole = 'host' | 'guest';
export interface MeetParticipantMetadata {
  role: MeetParticipantRole;
  /**
   * Set on a phone's screen presentation, which joins the call separately from the person: the
   * identity of the person it belongs to. It isn't a person, so it's left out of people and counts.
   */
  screenOf?: string;
}

/** Who a participant's screen presentation belongs to, from their metadata; null for people. */
export function screenOwnerOf(metadata: string | undefined | null): string | null {
  try {
    const owner = (JSON.parse(metadata || '{}') as MeetParticipantMetadata).screenOf;
    return typeof owner === 'string' && owner ? owner : null;
  } catch {
    return null;
  }
}

/** The app asks for a token for presenting its screen with the token it joined the call with. */
export const meetScreenTokenSchema = z.object({ token: z.string().min(1).max(4096) });

export interface MeetScreenTokenDto {
  token: string;
}

export interface MeetRoomDto {
  code: string;
  title: string | null;
  hostName: string;
  quickAccess: boolean;
  createdAt: string;
}

export interface MeetRoomInfoDto extends MeetRoomDto {
  /** Names of the people in the call right now. */
  participants: string[];
  full: boolean;
  maxParticipants: number;
}

export type MeetJoinResultDto =
  | { status: 'admitted'; token: string; role: MeetParticipantRole; identity: string }
  | { status: 'pending'; requestId: string }
  | { status: 'denied' };

export interface MeetJoinRequestDto {
  id: string;
  name: string;
  createdAt: string;
}

/* Call recordings ----------------------------------------------------------------------- */

export type CallRecordingStatus = 'recording' | 'processing' | 'ready' | 'failed';

export const callRecordingStatusLabels: Record<CallRecordingStatus, string> = {
  recording: 'Recording',
  processing: 'Saving',
  ready: 'Ready',
  failed: 'Failed',
};

export interface CallRecordingDto {
  id: string;
  code: string;
  title: string | null;
  startedByName: string;
  startedAt: string;
  endedAt: string | null;
  status: CallRecordingStatus;
  durationSec: number | null;
  sizeBytes: number | null;
  /** Why it failed, when it did. */
  error: string | null;
  /** Why it stopped on its own (inactivity, length limit), if it did. */
  stopReason: string | null;
}

/** Whether the call is being recorded right now (everyone in the call can ask). */
export interface MeetRecordingStateDto {
  active: boolean;
  startedByName: string | null;
  startedAt: string | null;
}
