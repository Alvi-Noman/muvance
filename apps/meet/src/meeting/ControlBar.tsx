import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react';
import {
  useLocalParticipant,
  useParticipantAttribute,
  useParticipants,
} from '@livekit/components-react';
import {
  ChevronUp,
  EyeOff,
  Hand,
  Info,
  Maximize,
  MessageSquareText,
  Mic,
  MicOff,
  Minimize,
  MonitorUp,
  MoreVertical,
  PhoneOff,
  Settings,
  SmilePlus,
  Users,
  Video,
  VideoOff,
} from 'lucide-react';
import { MEET_MAX_PARTICIPANTS } from '@muvance/shared';
import { applyBlur } from '@/lib/blur';
import { cn } from '@/lib/cn';
import { isMissingDevice, mediaErrorMessage } from '@/lib/media-errors';
import { useCall, type Panel } from './call-context';
import { MenuButton } from './Tile';

const REACTIONS = ['💖', '👍', '🎉', '👏', '😂', '😮', '😢', '🤔', '👎'];

const canShareScreen =
  typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia;

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(id);
  }, []);
  return now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** Closes a popover when clicking anywhere else. */
function useOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, close]);
  return ref;
}

export function ControlBar() {
  const call = useCall();
  const { code, isHost, panel, setPanel, unreadChat, prefs, updatePrefs, signal, showReaction } =
    call;
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled } =
    useLocalParticipant();
  const participants = useParticipants();
  const hand = useParticipantAttribute('hand', { participant: localParticipant });
  const clock = useClock();

  const [reactionsOpen, setReactionsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [busy, setBusy] = useState<'mic' | 'cam' | 'screen' | null>(null);

  const reactionsRef = useOutside(reactionsOpen, () => setReactionsOpen(false));
  const moreRef = useOutside(moreOpen, () => setMoreOpen(false));
  const leaveRef = useOutside(leaveOpen, () => setLeaveOpen(false));

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleMic = async () => {
    if (busy) return;
    setBusy('mic');
    if (isMicrophoneEnabled) call.markSelfMuted();
    try {
      try {
        await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled, {
          deviceId: prefs.audioDeviceId || undefined,
        });
      } catch (error) {
        if (!prefs.audioDeviceId || !isMissingDevice(error)) throw error;
        // The saved microphone is gone: use the default one and forget the old choice.
        updatePrefs({ audioDeviceId: '' });
        await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
      }
      updatePrefs({ audioEnabled: !isMicrophoneEnabled });
    } catch (error) {
      console.error('Microphone failed', error);
      call.toast(mediaErrorMessage(error, 'microphone'));
    } finally {
      setBusy(null);
    }
  };

  const toggleCamera = async () => {
    if (busy) return;
    setBusy('cam');
    try {
      let pub;
      try {
        pub = await localParticipant.setCameraEnabled(!isCameraEnabled, {
          deviceId: prefs.videoDeviceId || undefined,
        });
      } catch (error) {
        if (!prefs.videoDeviceId || !isMissingDevice(error)) throw error;
        updatePrefs({ videoDeviceId: '' });
        pub = await localParticipant.setCameraEnabled(!isCameraEnabled);
      }
      updatePrefs({ videoEnabled: !isCameraEnabled });
      if (!isCameraEnabled && prefs.blur !== 'off' && pub?.videoTrack) {
        void applyBlur(pub.videoTrack, prefs.blur).catch(() => {});
      }
    } catch (error) {
      console.error('Camera failed', error);
      call.toast(mediaErrorMessage(error, 'camera'));
    } finally {
      setBusy(null);
    }
  };

  const toggleScreen = async () => {
    if (busy) return;
    setBusy('screen');
    try {
      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled, {
        audio: true,
        selfBrowserSurface: 'exclude',
        surfaceSwitching: 'include',
        systemAudio: 'include',
        contentHint: 'detail',
      });
    } catch (error) {
      // Closing the browser's "choose what to share" window isn't an error worth reporting.
      if ((error as Error).name !== 'NotAllowedError') {
        call.toast("Couldn't share your screen.");
      }
    } finally {
      setBusy(null);
    }
  };

  const toggleHand = () => {
    void localParticipant.setAttributes({ hand: hand ? '' : String(Date.now()) });
  };

  const react = (emoji: string) => {
    signal({ type: 'reaction', emoji });
    showReaction(emoji, 'You');
  };

  const togglePanel = (p: Exclude<Panel, null>) => setPanel(panel === p ? null : p);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  };

  // Keyboard shortcuts, as in Meet: Ctrl+D microphone, Ctrl+E camera (⌘ on a Mac).
  const onShortcut = useEffectEvent((e: KeyboardEvent) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const key = e.key.toLowerCase();
    if (key === 'd' && !e.altKey) {
      e.preventDefault();
      void toggleMic();
    } else if (key === 'e' && !e.altKey) {
      e.preventDefault();
      void toggleCamera();
    } else if (e.altKey && key === 'h') {
      e.preventDefault();
      toggleHand();
    } else if (e.altKey && key === 'c') {
      e.preventDefault();
      togglePanel('chat');
    } else if (e.altKey && key === 'p') {
      e.preventDefault();
      togglePanel('people');
    }
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => onShortcut(e);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);
  const mod = isMac ? '⌘' : 'Ctrl';

  return (
    <div className="relative flex items-center justify-between gap-2 px-3 pt-1 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
      {/* Left: time and meeting code */}
      <div className="hidden min-w-0 flex-1 items-center gap-2 text-sm text-white/90 lg:flex">
        <span>{clock}</span>
        <span className="text-white/30">|</span>
        <span className="truncate">{code}</span>
      </div>

      {/* Centre: the main controls */}
      <div className="flex flex-1 items-center justify-center gap-2 sm:gap-3 lg:flex-none">
        <CircleButton
          onClick={toggleMic}
          off={!isMicrophoneEnabled}
          label={`${isMicrophoneEnabled ? 'Turn off' : 'Turn on'} microphone (${mod}+D)`}
        >
          {isMicrophoneEnabled ? <Mic /> : <MicOff />}
        </CircleButton>
        <CircleButton
          onClick={toggleCamera}
          off={!isCameraEnabled}
          label={`${isCameraEnabled ? 'Turn off' : 'Turn on'} camera (${mod}+E)`}
        >
          {isCameraEnabled ? <Video /> : <VideoOff />}
        </CircleButton>

        <div className="relative hidden sm:block" ref={reactionsRef}>
          <CircleButton
            onClick={() => setReactionsOpen((o) => !o)}
            active={reactionsOpen}
            label="Send a reaction"
          >
            <SmilePlus />
          </CircleButton>
          {reactionsOpen && (
            <div className="animate-fade-up absolute bottom-16 left-1/2 z-30 flex -translate-x-1/2 gap-1 rounded-full bg-raised p-1.5 shadow-2xl">
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => react(emoji)}
                  className="inline-flex size-11 items-center justify-center rounded-full text-2xl transition hover:scale-125 hover:bg-white/10"
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {canShareScreen && (
          <CircleButton
            onClick={toggleScreen}
            active={isScreenShareEnabled}
            label={isScreenShareEnabled ? 'Stop presenting' : 'Present your screen'}
            className="hidden sm:inline-flex"
          >
            <MonitorUp />
          </CircleButton>
        )}

        <CircleButton
          onClick={toggleHand}
          active={!!hand}
          label={hand ? 'Lower hand' : `Raise hand (${mod}+Alt+H)`}
        >
          <Hand />
        </CircleButton>

        <div className="relative" ref={moreRef}>
          <CircleButton
            onClick={() => setMoreOpen((o) => !o)}
            active={moreOpen}
            label="More options"
          >
            <MoreVertical />
          </CircleButton>
          {moreOpen && (
            <div className="animate-fade-up absolute right-0 bottom-16 z-30 w-64 rounded-2xl bg-white p-1.5 text-sm text-neutral-950 shadow-2xl sm:right-auto sm:left-1/2 sm:-translate-x-1/2">
              {/* On phones the side buttons live here */}
              <div className="lg:hidden">
                <MenuButton
                  onClick={() => {
                    setMoreOpen(false);
                    togglePanel('info');
                  }}
                  icon={<Info />}
                  label="Meeting details"
                />
                <MenuButton
                  onClick={() => {
                    setMoreOpen(false);
                    togglePanel('people');
                  }}
                  icon={<Users />}
                  label={`People (${participants.length})`}
                />
                <MenuButton
                  onClick={() => {
                    setMoreOpen(false);
                    togglePanel('chat');
                  }}
                  icon={<MessageSquareText />}
                  label={unreadChat ? `Chat (${unreadChat} new)` : 'Chat'}
                />
                <div className="sm:hidden">
                  <div className="flex justify-between px-2 py-1.5">
                    {REACTIONS.slice(0, 6).map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setMoreOpen(false);
                          react(emoji);
                        }}
                        className="text-2xl"
                        aria-label={`React with ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="my-1 h-px bg-black/5" />
              </div>
              <MenuButton
                onClick={() => {
                  setMoreOpen(false);
                  toggleFullscreen();
                }}
                icon={isFullscreen ? <Minimize /> : <Maximize />}
                label={isFullscreen ? 'Exit full screen' : 'Full screen'}
              />
              <MenuButton
                onClick={() => {
                  setMoreOpen(false);
                  updatePrefs({ hideSelf: !prefs.hideSelf });
                }}
                icon={<EyeOff />}
                label={prefs.hideSelf ? 'Show my video' : 'Hide my video from me'}
              />
              <MenuButton
                onClick={() => {
                  setMoreOpen(false);
                  call.setSettingsOpen(true);
                }}
                icon={<Settings />}
                label="Settings"
              />
            </div>
          )}
        </div>

        {/* Leave; hosts can also end the call for everyone */}
        <div className="relative flex" ref={leaveRef}>
          <button
            type="button"
            onClick={call.leave}
            aria-label="Leave call"
            title="Leave call"
            className={cn(
              'inline-flex h-12 items-center justify-center bg-red-600 px-5 transition hover:bg-red-500 [&_svg]:size-6',
              isHost ? 'rounded-l-full pr-3' : 'rounded-full',
            )}
          >
            <PhoneOff />
          </button>
          {isHost && (
            <button
              type="button"
              onClick={() => setLeaveOpen((o) => !o)}
              aria-label="More ways to leave"
              className="inline-flex h-12 items-center justify-center rounded-r-full border-l border-red-800/50 bg-red-600 pr-3 pl-2 transition hover:bg-red-500"
            >
              <ChevronUp className="size-4" />
            </button>
          )}
          {leaveOpen && (
            <div className="animate-fade-up absolute right-0 bottom-16 z-30 w-64 rounded-2xl bg-white p-1.5 text-sm text-neutral-950 shadow-2xl">
              <MenuButton onClick={call.leave} icon={<PhoneOff />} label="Just leave the call" />
              <MenuButton
                onClick={() => {
                  setLeaveOpen(false);
                  void call.endForAll();
                }}
                icon={<PhoneOff />}
                label="End the call for everyone"
                danger
              />
            </div>
          )}
        </div>
      </div>

      {/* Right: details, people, chat */}
      <div className="hidden flex-1 items-center justify-end gap-1 lg:flex">
        <IconButton
          onClick={() => togglePanel('info')}
          active={panel === 'info'}
          label="Meeting details"
        >
          <Info />
        </IconButton>
        <IconButton
          onClick={() => togglePanel('people')}
          active={panel === 'people'}
          label={`People (${participants.length} of ${MEET_MAX_PARTICIPANTS})`}
          badge={participants.length}
          badgeMuted
        >
          <Users />
        </IconButton>
        <IconButton
          onClick={() => togglePanel('chat')}
          active={panel === 'chat'}
          label="Chat with everyone"
          badge={unreadChat}
        >
          <MessageSquareText />
        </IconButton>
      </div>
    </div>
  );
}

function CircleButton({
  onClick,
  off,
  active,
  label,
  className,
  children,
}: {
  onClick: () => void;
  off?: boolean;
  active?: boolean;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-12 shrink-0 items-center justify-center rounded-full transition [&_svg]:size-5',
        off
          ? 'bg-red-600 hover:bg-red-500'
          : active
            ? 'bg-sky-200 text-neutral-950 hover:bg-sky-100'
            : 'bg-raised hover:bg-[#3a3a3f]',
        className,
      )}
    >
      {children}
    </button>
  );
}

function IconButton({
  onClick,
  active,
  label,
  badge,
  badgeMuted,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  badge?: number;
  badgeMuted?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex size-12 items-center justify-center rounded-full transition [&_svg]:size-5',
        active ? 'bg-sky-200/15 text-sky-200' : 'hover:bg-white/10',
      )}
    >
      {children}
      {!!badge && (
        <span
          className={cn(
            'absolute top-1 right-1 inline-flex min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold',
            badgeMuted ? 'bg-raised text-white' : 'bg-sky-400 text-neutral-950',
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
