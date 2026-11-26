import { createContext, useContext } from 'react';
import type { Participant } from 'livekit-client';
import { screenOwnerOf, type MeetParticipantRole } from '@muvance/shared';
import type { MeetPrefs } from '@/lib/prefs';
import type { useRecording } from './use-recording';

export type Panel = 'info' | 'people' | 'chat' | null;

export interface Toast {
  id: number;
  text: string;
  /** Optional action button, e.g. "Open chat". */
  action?: { label: string; run: () => void };
}

export interface Reaction {
  id: number;
  emoji: string;
  name: string;
  /** Horizontal start position, % of the screen width. */
  left: number;
}

/** Messages people in the call send each other (besides chat). */
export type Signal =
  { type: 'reaction'; emoji: string } | { type: 'lower-hand'; identity: string | null };

export interface CallState {
  code: string;
  role: MeetParticipantRole;
  isHost: boolean;
  prefs: MeetPrefs;
  updatePrefs: (patch: Partial<MeetPrefs>) => void;
  /** Track key ("identity:source") shown large, or null for automatic. */
  pinned: string | null;
  setPinned: (key: string | null) => void;
  panel: Panel;
  setPanel: (panel: Panel) => void;
  unreadChat: number;
  toast: (text: string, action?: Toast['action']) => void;
  signal: (message: Signal) => void;
  reactions: Reaction[];
  showReaction: (emoji: string, name: string) => void;
  recording: ReturnType<typeof useRecording>;
  /** Hosts confirm before recording starts. */
  confirmRecordingOpen: boolean;
  setConfirmRecordingOpen: (open: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  /** Called when this person mutes themselves, to tell a host's mute apart from their own. */
  markSelfMuted: () => void;
  leave: () => void;
  endForAll: () => Promise<void>;
  /** Whether the row of other people under a presentation is hidden; null = automatic. */
  stripHidden: boolean | null;
  setStripHidden: (hidden: boolean | null) => void;
  /** Presenting the phone's screen, in the Android app only. */
  phoneScreen: { active: boolean; toggle: () => Promise<void> } | null;
}

export const CallContext = createContext<CallState | null>(null);

export function useCall() {
  const state = useContext(CallContext);
  if (!state) throw new Error('useCall must be used inside a call');
  return state;
}

/** You, or a screen you're presenting from the Android app (which joins as its own participant). */
export function isMine(participant: Participant, localIdentity: string) {
  return participant.isLocal || screenOwnerOf(participant.metadata) === localIdentity;
}

export function trackKey(identity: string, source: string) {
  return `${identity}:${source}`;
}

/** A participant's role, from the metadata the API put in their access token. */
export function roleOf(metadata: string | undefined): MeetParticipantRole {
  try {
    return (JSON.parse(metadata ?? '{}') as { role?: MeetParticipantRole }).role === 'host'
      ? 'host'
      : 'guest';
  } catch {
    return 'guest';
  }
}
