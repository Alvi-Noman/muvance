import { useRef, useState, type CSSProperties } from 'react';
import {
  isTrackReference,
  useConnectionQualityIndicator,
  useIsMuted,
  useIsSpeaking,
  useLocalParticipant,
  useParticipantAttribute,
  VideoTrack,
  type TrackReferenceOrPlaceholder,
} from '@livekit/components-react';
import { ConnectionQuality, LocalParticipant, Track } from 'livekit-client';
import {
  Expand,
  Hand,
  MicOff,
  MonitorUp,
  MoreVertical,
  Pin,
  PinOff,
  SignalLow,
  UserMinus,
} from 'lucide-react';
import { Avatar } from '@/components/ui';
import { api, errorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';
import { enterFullscreen } from '@/lib/fullscreen';
import { isMine, roleOf, trackKey, useCall } from './call-context';

export function Tile({
  trackRef,
  large,
  small,
  className,
  style,
}: {
  trackRef: TrackReferenceOrPlaceholder;
  large?: boolean;
  small?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const { prefs, pinned, setPinned, isHost, code, toast, phoneScreen } = useCall();
  const { localParticipant } = useLocalParticipant();
  const participant = trackRef.participant;
  const isScreen = trackRef.source === Track.Source.ScreenShare;
  const isLocal = participant.isLocal;
  const name = participant.name || participant.identity;
  const key = trackKey(participant.identity, trackRef.source);
  const tileRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const speaking = useIsSpeaking(participant);
  const micMuted = useIsMuted({ participant, source: Track.Source.Microphone });
  const videoMuted = useIsMuted(trackRef);
  const hand = useParticipantAttribute('hand', { participant });
  const { quality } = useConnectionQualityIndicator({ participant });

  const hasVideo = isTrackReference(trackRef) && !videoMuted;
  const poor = quality === ConnectionQuality.Poor || quality === ConnectionQuality.Lost;
  const guestTarget = !isLocal && roleOf(participant.metadata) !== 'host';

  const fullscreen = () => {
    setMenuOpen(false);
    enterFullscreen(tileRef.current);
  };

  const hostAction = async (action: 'mute' | 'remove') => {
    setMenuOpen(false);
    try {
      if (action === 'mute') {
        await api.post(`/meet/rooms/${code}/participants/${participant.identity}/mute`, {
          source: 'microphone',
        });
      } else {
        await api.delete(`/meet/rooms/${code}/participants/${participant.identity}`);
        toast(`${name} was removed from the call`);
      }
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  // Your own presentation isn't shown back to you (it would repeat itself endlessly).
  if (isScreen && isMine(participant, localParticipant.identity)) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-tile p-4 text-center',
          className,
        )}
        style={style}
      >
        <MonitorUp className={cn('text-white/70', small ? 'size-6' : 'size-10')} />
        {!small && <p className="text-lg">You're presenting to everyone</p>}
        <button
          type="button"
          onClick={() => {
            if (participant instanceof LocalParticipant)
              void participant.setScreenShareEnabled(false);
            else if (phoneScreen?.active) void phoneScreen.toggle();
          }}
          className={cn(
            'rounded-full bg-sky-200 font-medium text-neutral-950 hover:bg-sky-100',
            small ? 'px-3 py-1 text-xs' : 'px-5 py-2.5 text-sm',
          )}
        >
          Stop presenting
        </button>
      </div>
    );
  }

  return (
    <div
      ref={tileRef}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-tile',
        speaking && !isScreen && 'outline-[3px] outline-offset-0 outline-sky-400 outline-solid',
        className,
      )}
      style={style}
    >
      {hasVideo ? (
        <VideoTrack
          trackRef={trackRef}
          className={cn(
            'size-full',
            isScreen ? 'bg-black object-contain' : 'object-cover',
            isLocal && !isScreen && prefs.mirror && '-scale-x-100',
          )}
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <span className="relative">
            {speaking && (
              <span className="absolute -inset-2 animate-ping rounded-full bg-sky-400/30" />
            )}
            <Avatar
              name={name}
              seed={participant.identity}
              className={cn(
                'relative',
                small ? 'size-12 text-lg' : large ? 'size-28 text-4xl' : 'size-20 text-2xl',
              )}
            />
          </span>
        </div>
      )}

      {/* Top right: muted, or speaking */}
      {!isScreen && (
        <span className="absolute top-2 right-2 flex items-center gap-1.5">
          {poor && (
            <span
              className="inline-flex size-7 items-center justify-center rounded-full bg-black/50"
              title="Poor connection"
            >
              <SignalLow className="size-4 text-amber-300" />
            </span>
          )}
          {micMuted ? (
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-black/50">
              <MicOff className="size-4" />
            </span>
          ) : speaking ? (
            <span className="inline-flex size-7 items-center justify-center gap-[2px] rounded-full bg-sky-500">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-[3px] animate-pulse rounded-full bg-white"
                  style={{ height: i === 1 ? 12 : 7, animationDelay: `${i * 120}ms` }}
                />
              ))}
            </span>
          ) : null}
        </span>
      )}

      {/* Bottom left: hand + name */}
      <span className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] items-center gap-1.5">
        {hand && !isScreen && (
          <span className="animate-knock inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-neutral-950">
            <Hand className="size-4" />
          </span>
        )}
        <span className="truncate rounded-md bg-black/40 px-2 py-0.5 text-sm font-medium backdrop-blur-sm">
          {isScreen ? `${name} (presentation)` : isLocal ? 'You' : name}
        </span>
      </span>

      {/* Hover menu: pin, full screen, and for hosts: mute, remove */}
      <div className="absolute top-2 left-2 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100">
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={`Options for ${name}`}
            className="inline-flex size-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/70"
          >
            <MoreVertical className="size-4" />
          </button>
          {menuOpen && (
            <div
              className="absolute top-10 left-0 z-20 w-52 rounded-2xl bg-white p-1.5 text-sm text-neutral-950 shadow-xl"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <MenuButton
                onClick={() => {
                  setMenuOpen(false);
                  setPinned(pinned === key ? null : key);
                }}
                icon={pinned === key ? <PinOff /> : <Pin />}
                label={pinned === key ? 'Unpin' : 'Pin to the screen'}
              />
              <MenuButton onClick={fullscreen} icon={<Expand />} label="Full screen" />
              {isHost && !isLocal && !isScreen && !micMuted && (
                <MenuButton
                  onClick={() => hostAction('mute')}
                  icon={<MicOff />}
                  label="Mute for everyone"
                />
              )}
              {isHost && guestTarget && !isScreen && (
                <MenuButton
                  onClick={() => hostAction('remove')}
                  icon={<UserMinus />}
                  label="Remove from the call"
                  danger
                />
              )}
            </div>
          )}
        </div>
      </div>
      {pinned === key && (
        <span className="absolute top-2 left-12 inline-flex size-8 items-center justify-center rounded-full bg-black/50">
          <Pin className="size-4" />
        </span>
      )}
    </div>
  );
}

export function MenuButton({
  onClick,
  icon,
  label,
  danger,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-black/5 [&_svg]:size-4',
        danger && 'text-red-600',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
