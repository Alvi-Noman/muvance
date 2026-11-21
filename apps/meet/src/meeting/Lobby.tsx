import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useTrackVolume } from '@livekit/components-react';
import { Mic, MicOff, Sparkles, Video, VideoOff } from 'lucide-react';
import type { MeDto, MeetRoomInfoDto } from '@muvance/shared';
import { Header } from '@/components/Header';
import { Avatar, Button, Spinner } from '@/components/ui';
import { applyBlur, blurSupported } from '@/lib/blur';
import { cn } from '@/lib/cn';
import type { BlurLevel, MeetPrefs } from '@/lib/prefs';
import { DeviceSelect } from './DeviceSelect';
import { usePreviewTrack } from './use-preview-track';

const blurLabels: Record<BlurLevel, string> = {
  off: 'Blur background',
  light: 'Slight blur',
  strong: 'Strong blur',
};
const nextBlur: Record<BlurLevel, BlurLevel> = { off: 'light', light: 'strong', strong: 'off' };

function deviceMessage(error: Error | null, what: 'camera' | 'microphone') {
  if (!error) return '';
  if (error.name === 'NotAllowedError') {
    return `Your ${what} is blocked. Allow it from the icon in your browser's address bar.`;
  }
  if (error.name === 'NotFoundError') return `No ${what} found.`;
  if (error.name === 'NotReadableError') {
    return `Your ${what} is being used by another app. Close it and try again.`;
  }
  return `Couldn't start your ${what}.`;
}

export function Lobby({
  info,
  me,
  prefs,
  updatePrefs,
  asking,
  joining,
  error,
  onJoin,
  onCancel,
}: {
  info: MeetRoomInfoDto | undefined;
  me: MeDto | null;
  prefs: MeetPrefs;
  updatePrefs: (patch: Partial<MeetPrefs>) => void;
  asking: boolean;
  joining: boolean;
  error: string;
  onJoin: (name: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(prefs.name);
  const [canBlur, setCanBlur] = useState(false);
  const videoEl = useRef<HTMLVideoElement>(null);

  const camera = usePreviewTrack('videoinput', prefs.videoEnabled, prefs.videoDeviceId);
  const mic = usePreviewTrack('audioinput', prefs.audioEnabled, prefs.audioDeviceId);
  const volume = useTrackVolume(mic.track ?? undefined);

  useEffect(() => {
    void blurSupported().then(setCanBlur);
  }, []);

  useEffect(() => {
    const track = camera.track;
    const el = videoEl.current;
    if (!track || !el) return;
    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [camera.track]);

  useEffect(() => {
    const track = camera.track;
    if (!track || !canBlur) return;
    void applyBlur(track, prefs.blur).catch(() => {});
  }, [camera.track, prefs.blur, canBlur]);

  const others = info?.participants ?? [];
  const full = info?.full ?? false;
  const isTeam = !!me;
  const direct = isTeam || info?.quickAccess;
  const busy = joining || asking;
  const showVideo = prefs.videoEnabled && camera.track && !camera.error;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (busy || full) return;
    onJoin(isTeam ? me.name : name.trim());
  };

  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 pb-12 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="animate-fade-up">
          <div className="relative aspect-video overflow-hidden rounded-[1.75rem] bg-neutral-900 shadow-2xl shadow-black/20">
            <video
              ref={videoEl}
              muted
              playsInline
              className={cn(
                'size-full object-cover',
                prefs.mirror && '-scale-x-100',
                !showVideo && 'hidden',
              )}
            />
            {!showVideo && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white/80">
                {camera.error ? (
                  <p className="max-w-sm text-sm">{deviceMessage(camera.error, 'camera')}</p>
                ) : prefs.videoEnabled ? (
                  <Spinner className="size-7" />
                ) : (
                  <p className="text-lg">Camera is off</p>
                )}
              </div>
            )}
            <span className="absolute top-4 left-5 text-sm font-medium text-white drop-shadow">
              {isTeam ? me.name : name || 'You'}
            </span>

            {/* Mic level, like a little equaliser */}
            {prefs.audioEnabled && mic.track && (
              <span className="absolute bottom-5 left-5 flex h-6 items-end gap-0.5" aria-hidden>
                {[0.6, 1, 0.6].map((k, i) => (
                  <span
                    key={i}
                    className="w-1.5 rounded-full bg-white transition-[height] duration-75"
                    style={{ height: `${Math.max(6, Math.min(24, volume * 120 * k))}px` }}
                  />
                ))}
              </span>
            )}

            <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3">
              <RoundToggle
                on={prefs.audioEnabled}
                onClick={() => updatePrefs({ audioEnabled: !prefs.audioEnabled })}
                label={prefs.audioEnabled ? 'Turn off microphone' : 'Turn on microphone'}
                icon={prefs.audioEnabled ? <Mic /> : <MicOff />}
              />
              <RoundToggle
                on={prefs.videoEnabled}
                onClick={() => updatePrefs({ videoEnabled: !prefs.videoEnabled })}
                label={prefs.videoEnabled ? 'Turn off camera' : 'Turn on camera'}
                icon={prefs.videoEnabled ? <Video /> : <VideoOff />}
              />
            </div>

            {canBlur && prefs.videoEnabled && (
              <button
                type="button"
                onClick={() => updatePrefs({ blur: nextBlur[prefs.blur] })}
                className={cn(
                  'absolute right-4 bottom-4 flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-medium backdrop-blur transition',
                  prefs.blur === 'off'
                    ? 'bg-black/40 text-white hover:bg-black/60'
                    : 'bg-white text-neutral-950',
                )}
              >
                <Sparkles className="size-4" />
                <span className="hidden sm:inline">{blurLabels[prefs.blur]}</span>
              </button>
            )}
          </div>

          {mic.error && (
            <p className="mt-3 text-sm text-red-600">{deviceMessage(mic.error, 'microphone')}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <DeviceSelect
              kind="audioinput"
              value={prefs.audioDeviceId}
              onChange={(id) => updatePrefs({ audioDeviceId: id })}
            />
            <DeviceSelect
              kind="audiooutput"
              value={prefs.audioOutputId}
              onChange={(id) => updatePrefs({ audioOutputId: id })}
            />
            <DeviceSelect
              kind="videoinput"
              value={prefs.videoDeviceId}
              onChange={(id) => updatePrefs({ videoDeviceId: id })}
            />
          </div>
        </section>

        <section className="animate-fade-up text-center [animation-delay:100ms] lg:text-left">
          <h1 className="font-serif text-4xl sm:text-5xl">
            {asking ? 'Asking to join…' : full ? 'This call is full' : 'Ready to join?'}
          </h1>
          {info?.title && <p className="mt-2 text-lg text-neutral-700">{info.title}</p>}

          <div className="mt-4 flex items-center justify-center gap-3 lg:justify-start">
            {others.length > 0 && (
              <span className="flex -space-x-2">
                {others.slice(0, 4).map((n, i) => (
                  <Avatar
                    key={`${n}-${i}`}
                    name={n}
                    className="size-8 text-xs ring-2 ring-canvas"
                  />
                ))}
              </span>
            )}
            <p className="text-neutral-600">{presenceText(others, full, info?.maxParticipants)}</p>
          </div>

          {asking ? (
            <div className="mt-8">
              <p className="text-neutral-600">You'll join the call when someone lets you in.</p>
              <div className="mt-5 flex items-center justify-center gap-3 lg:justify-start">
                <Spinner className="size-5 text-neutral-500" />
                <Button variant="secondary" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="mx-auto mt-8 max-w-sm lg:mx-0">
              {isTeam ? (
                <p className="mb-5 text-sm text-neutral-600">
                  Joining as <strong className="text-neutral-950">{me.name}</strong>. You can let
                  guests in and manage the call.
                </p>
              ) : (
                <label className="mb-4 block text-left">
                  <span className="sr-only">Your name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="What's your name?"
                    maxLength={60}
                    autoFocus={!name}
                    className="w-full rounded-2xl border border-black/15 bg-white/80 px-4 py-3.5 outline-none transition focus:border-neutral-950 focus:bg-white"
                  />
                </label>
              )}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={busy || full || (!isTeam && !name.trim()) || !info}
              >
                {joining && <Spinner className="size-4" />}
                {direct ? 'Join now' : 'Ask to join'}
              </Button>
              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
              {!isTeam && (
                <p className="mt-6 text-sm text-neutral-500">
                  Muvance team?{' '}
                  <Link
                    to={`/signin?next=${info?.code ?? ''}`}
                    className="font-medium text-neutral-950 underline-offset-4 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              )}
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

function presenceText(others: string[], full: boolean, max = 5) {
  if (full) return `${max} people are in this call, the most it can hold.`;
  if (others.length === 0) return 'No one else is here yet.';
  if (others.length === 1) return `${others[0]} is in this call.`;
  if (others.length === 2) return `${others[0]} and ${others[1]} are in this call.`;
  return `${others[0]} and ${others.length - 1} others are in this call.`;
}

function RoundToggle({
  on,
  onClick,
  label,
  icon,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-14 items-center justify-center rounded-full border transition [&_svg]:size-6',
        on
          ? 'border-white/60 bg-transparent text-white hover:bg-white/15'
          : 'border-transparent bg-red-600 text-white hover:bg-red-500',
      )}
    >
      {icon}
    </button>
  );
}
