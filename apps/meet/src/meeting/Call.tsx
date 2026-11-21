import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import {
  RoomAudioRenderer,
  RoomContext,
  useAudioPlayback,
  useChat,
  useConnectionState,
  useRoomContext,
} from '@livekit/components-react';
import {
  ConnectionState,
  DisconnectReason,
  type LocalVideoTrack,
  type Participant,
  type RemoteParticipant,
  Room,
  RoomEvent,
  ScreenSharePresets,
  Track,
  type TrackPublication,
  VideoPresets,
} from 'livekit-client';
import { WifiOff } from 'lucide-react';
import type { MeetParticipantRole } from '@muvance/shared';
import { Button, Spinner } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';
import { applyBlur } from '@/lib/blur';
import type { MeetPrefs } from '@/lib/prefs';
import { sounds } from '@/lib/sounds';
import {
  CallContext,
  roleOf,
  type CallState,
  type Panel,
  type Reaction,
  type Signal,
  type Toast,
} from './call-context';
import { ControlBar } from './ControlBar';
import { JoinRequests } from './JoinRequests';
import type { LeaveReason } from './LeftScreen';
import { ChatPanel } from './panels/ChatPanel';
import { InfoPanel } from './panels/InfoPanel';
import { PeoplePanel } from './panels/PeoplePanel';
import { Reactions } from './Reactions';
import { SettingsDialog } from './SettingsDialog';
import { Stage } from './Stage';
import { Toasts } from './Toasts';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function leaveReason(reason: DisconnectReason | undefined): LeaveReason {
  switch (reason) {
    case DisconnectReason.CLIENT_INITIATED:
      return 'left';
    case DisconnectReason.DUPLICATE_IDENTITY:
      return 'elsewhere';
    case DisconnectReason.PARTICIPANT_REMOVED:
      return 'removed';
    case DisconnectReason.ROOM_DELETED:
    case DisconnectReason.ROOM_CLOSED:
      return 'ended';
    default:
      return 'error';
  }
}

/** Connects to the call and keeps the connection for as long as this screen is open. */
export function Call({
  code,
  token,
  role,
  prefs,
  updatePrefs,
  onLeft,
}: {
  code: string;
  token: string;
  role: MeetParticipantRole;
  identity: string;
  prefs: MeetPrefs;
  updatePrefs: (patch: Partial<MeetPrefs>) => void;
  onLeft: (reason: LeaveReason) => void;
}) {
  const [room, setRoom] = useState<Room | null>(null);
  const [failed, setFailed] = useState('');
  // Read the latest values inside the connect effect without reconnecting when they change.
  const currentPrefs = useEffectEvent(() => prefs);
  const left = useEffectEvent((reason: LeaveReason) => onLeft(reason));

  useEffect(() => {
    const p = currentPrefs();
    const r = new Room({
      adaptiveStream: true,
      dynacast: true,
      disconnectOnPageLeave: true,
      audioCaptureDefaults: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      videoCaptureDefaults: { resolution: VideoPresets.h720.resolution },
      publishDefaults: {
        simulcast: true,
        videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360],
        screenShareEncoding: ScreenSharePresets.h1080fps15.encoding,
        dtx: true,
        red: true,
      },
      audioOutput: p.audioOutputId ? { deviceId: p.audioOutputId } : undefined,
    });
    let active = true;

    const onDisconnected = (reason?: DisconnectReason) => {
      if (!active) return;
      sounds.leave();
      left(leaveReason(reason));
    };
    r.on(RoomEvent.Disconnected, onDisconnected);

    // The server address is this same site: Caddy (or Vite in development) passes /rtc to LiveKit.
    const url = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;
    r.connect(url, token)
      .then(async () => {
        if (!active) return;
        setRoom(r);
        sounds.join();
        const local = r.localParticipant;
        if (p.audioEnabled) {
          await local
            .setMicrophoneEnabled(true, { deviceId: p.audioDeviceId || undefined })
            .catch(() => {});
        }
        if (p.videoEnabled) {
          const pub = await local
            .setCameraEnabled(true, { deviceId: p.videoDeviceId || undefined })
            .catch(() => undefined);
          const track = pub?.track as LocalVideoTrack | undefined;
          if (track && p.blur !== 'off') void applyBlur(track, p.blur).catch(() => {});
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = errorMessage(error);
        if (/full|max.*participant/i.test(message)) left('full');
        else setFailed(message);
      });

    return () => {
      active = false;
      r.off(RoomEvent.Disconnected, onDisconnected);
      void r.disconnect();
    };
  }, [token]);

  if (failed) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-call px-6 text-center text-white">
        <WifiOff className="size-10 text-white/60" />
        <h1 className="font-serif text-3xl">Couldn't connect to the call</h1>
        <p className="max-w-md text-white/70">
          Check your internet connection. If you're on an office or school network, it may block
          video calls.
        </p>
        <Button variant="light" onClick={() => onLeft('error')}>
          Back
        </Button>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-call text-white/80">
        <Spinner className="size-8" />
        <p>Joining…</p>
      </div>
    );
  }

  return (
    <RoomContext.Provider value={room}>
      <CallScreen code={code} role={role} prefs={prefs} updatePrefs={updatePrefs} />
      <RoomAudioRenderer />
    </RoomContext.Provider>
  );
}

let nextId = 1;

function CallScreen({
  code,
  role,
  prefs,
  updatePrefs,
}: {
  code: string;
  role: MeetParticipantRole;
  prefs: MeetPrefs;
  updatePrefs: (patch: Partial<MeetPrefs>) => void;
}) {
  const room = useRoomContext();
  const connection = useConnectionState(room);
  const { canPlayAudio, startAudio } = useAudioPlayback(room);
  const { chatMessages } = useChat();

  const [pinned, setPinned] = useState<string | null>(null);
  const [panel, setPanelState] = useState<Panel>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [seenChat, setSeenChat] = useState(0);
  const selfMutedAt = useRef(0);
  const panelRef = useRef<Panel>(null);
  const chatCount = useRef(0);
  useEffect(() => {
    chatCount.current = chatMessages.length;
  });

  // Opening or closing the chat marks everything in it as read.
  const setPanel = useCallback((next: Panel) => {
    if (panelRef.current === 'chat' || next === 'chat') setSeenChat(chatCount.current);
    panelRef.current = next;
    setPanelState(next);
  }, []);

  const markSelfMuted = useCallback(() => {
    selfMutedAt.current = Date.now();
  }, []);

  const toast = useCallback((text: string, action?: Toast['action']) => {
    const id = nextId++;
    setToasts((list) => [...list.slice(-2), { id, text, action }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 5000);
  }, []);

  const showReaction = useCallback((emoji: string, name: string) => {
    const id = nextId++;
    setReactions((list) => [...list.slice(-20), { id, emoji, name, left: 4 + Math.random() * 22 }]);
    setTimeout(() => setReactions((list) => list.filter((r) => r.id !== id)), 3300);
  }, []);

  const signal = useCallback(
    (message: Signal) => {
      void room.localParticipant
        .publishData(encoder.encode(JSON.stringify(message)), { reliable: true, topic: 'meet' })
        .catch(() => {});
    },
    [room],
  );

  // People joining and leaving, raised hands, host mutes, reactions.
  useEffect(() => {
    const onJoin = (p: RemoteParticipant) => {
      sounds.join();
      toast(`${p.name || 'Someone'} joined`);
    };
    const onLeave = (p: RemoteParticipant) => toast(`${p.name || 'Someone'} left`);
    const onAttributes = (changed: Record<string, string>, p: Participant) => {
      if (!('hand' in changed)) return;
      if (changed.hand && p !== room.localParticipant) {
        sounds.hand();
        toast(`${p.name || 'Someone'} raised a hand`, {
          label: 'View',
          run: () => setPanel('people'),
        });
      }
    };
    const onMuted = (pub: TrackPublication, p: Participant) => {
      if (p !== room.localParticipant || pub.source !== Track.Source.Microphone) return;
      if (Date.now() - selfMutedAt.current > 1500) toast('A host muted your microphone');
    };
    const onData = (
      payload: Uint8Array,
      p: RemoteParticipant | undefined,
      _kind: unknown,
      topic?: string,
    ) => {
      if (topic !== 'meet') return;
      let message: Signal;
      try {
        message = JSON.parse(decoder.decode(payload)) as Signal;
      } catch {
        return;
      }
      if (message.type === 'reaction' && typeof message.emoji === 'string') {
        showReaction(message.emoji.slice(0, 8), p?.name || 'Someone');
      }
      // Only hosts may lower other people's hands.
      if (message.type === 'lower-hand' && p && isHostParticipant(p)) {
        if (message.identity === null || message.identity === room.localParticipant.identity) {
          if (room.localParticipant.attributes.hand) {
            void room.localParticipant.setAttributes({ hand: '' });
            toast(`${p.name || 'A host'} lowered your hand`);
          }
        }
      }
    };
    room
      .on(RoomEvent.ParticipantConnected, onJoin)
      .on(RoomEvent.ParticipantDisconnected, onLeave)
      .on(RoomEvent.ParticipantAttributesChanged, onAttributes)
      .on(RoomEvent.TrackMuted, onMuted)
      .on(RoomEvent.DataReceived, onData);
    return () => {
      room
        .off(RoomEvent.ParticipantConnected, onJoin)
        .off(RoomEvent.ParticipantDisconnected, onLeave)
        .off(RoomEvent.ParticipantAttributesChanged, onAttributes)
        .off(RoomEvent.TrackMuted, onMuted)
        .off(RoomEvent.DataReceived, onData);
    };
  }, [room, toast, showReaction, setPanel]);

  // New chat messages: a sound and a preview while the chat is closed.
  const lastMessages = useRef(chatMessages.length);
  useEffect(() => {
    const added = chatMessages.slice(lastMessages.current);
    lastMessages.current = chatMessages.length;
    const fromOthers = added.filter((m) => m.from && m.from !== room.localParticipant);
    if (panelRef.current === 'chat') return;
    const last = fromOthers[fromOthers.length - 1];
    if (last) {
      sounds.message();
      toast(`${last.from?.name || 'Someone'}: ${last.message.slice(0, 120)}`, {
        label: 'Reply',
        run: () => setPanel('chat'),
      });
    }
  }, [chatMessages, room, toast, setPanel]);

  const unreadChat =
    panel === 'chat'
      ? 0
      : chatMessages.slice(seenChat).filter((m) => m.from && m.from !== room.localParticipant)
          .length;

  const leave = useCallback(() => {
    void room.disconnect();
  }, [room]);

  const endForAll = useCallback(async () => {
    try {
      await api.post(`/meet/rooms/${code}/end`);
    } catch (error) {
      toast(errorMessage(error));
    }
  }, [code, toast]);

  const state: CallState = useMemo(
    () => ({
      code,
      role,
      isHost: role === 'host',
      prefs,
      updatePrefs,
      pinned,
      setPinned,
      panel,
      setPanel,
      unreadChat,
      toast,
      signal,
      reactions,
      showReaction,
      settingsOpen,
      setSettingsOpen,
      markSelfMuted,
      leave,
      endForAll,
    }),
    [
      code,
      role,
      prefs,
      updatePrefs,
      pinned,
      panel,
      setPanel,
      unreadChat,
      toast,
      signal,
      reactions,
      showReaction,
      settingsOpen,
      markSelfMuted,
      leave,
      endForAll,
    ],
  );

  return (
    <CallContext.Provider value={state}>
      <div className="flex h-dvh flex-col overflow-hidden bg-call text-white">
        {connection === ConnectionState.Reconnecting && (
          <div className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-neutral-950">
            <Spinner className="size-4" /> Your connection dropped. Reconnecting…
          </div>
        )}
        {!canPlayAudio && (
          <button
            type="button"
            onClick={() => void startAudio()}
            className="bg-sky-600 px-4 py-2 text-sm font-medium"
          >
            Your browser paused the sound. Click here to hear the others.
          </button>
        )}
        <div className="relative flex min-h-0 flex-1 gap-3 p-2 sm:p-3">
          <Stage />
          {panel && (
            <aside className="animate-fade-up fixed inset-0 z-40 flex flex-col bg-white text-neutral-950 md:static md:inset-auto md:z-auto md:w-[360px] md:shrink-0 md:rounded-3xl">
              {panel === 'info' && <InfoPanel />}
              {panel === 'people' && <PeoplePanel />}
              {panel === 'chat' && <ChatPanel />}
            </aside>
          )}
        </div>
        <ControlBar />
        <Reactions />
        <Toasts toasts={toasts} dismiss={(id) => setToasts((l) => l.filter((t) => t.id !== id))} />
        {role === 'host' && <JoinRequests />}
        <SettingsDialog />
      </div>
    </CallContext.Provider>
  );
}

function isHostParticipant(p: Participant) {
  return roleOf(p.metadata) === 'host';
}
