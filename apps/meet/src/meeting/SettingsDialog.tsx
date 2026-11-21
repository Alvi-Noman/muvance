import { useEffect, useState } from 'react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import type { LocalVideoTrack } from 'livekit-client';
import { Dialog } from '@/components/ui';
import { applyBlur, blurSupported } from '@/lib/blur';
import { cn } from '@/lib/cn';
import type { BlurLevel } from '@/lib/prefs';
import { useCall } from './call-context';
import { DeviceSelect } from './DeviceSelect';

const blurOptions: { value: BlurLevel; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'light', label: 'Slight' },
  { value: 'strong', label: 'Strong' },
];

export function SettingsDialog() {
  const { settingsOpen, setSettingsOpen, prefs, updatePrefs, toast } = useCall();
  const room = useRoomContext();
  const { cameraTrack } = useLocalParticipant();
  const [canBlur, setCanBlur] = useState(false);

  useEffect(() => {
    void blurSupported().then(setCanBlur);
  }, []);

  const switchDevice = async (kind: MediaDeviceKind, id: string) => {
    try {
      await room.switchActiveDevice(kind, id);
    } catch {
      toast("Couldn't switch to that device.");
    }
    if (kind === 'audioinput') updatePrefs({ audioDeviceId: id });
    if (kind === 'videoinput') updatePrefs({ videoDeviceId: id });
    if (kind === 'audiooutput') updatePrefs({ audioOutputId: id });
  };

  const setBlur = async (level: BlurLevel) => {
    updatePrefs({ blur: level });
    const track = cameraTrack?.track as LocalVideoTrack | undefined;
    if (track) {
      try {
        await applyBlur(track, level);
      } catch {
        toast("Background blur isn't available on this device.");
      }
    }
  };

  return (
    <Dialog
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      title="Settings"
      dark
      className="max-w-lg"
    >
      <Section title="Audio">
        <Row label="Microphone">
          <DeviceSelect
            dark
            kind="audioinput"
            value={prefs.audioDeviceId}
            onChange={(id) => void switchDevice('audioinput', id)}
            className="w-full"
          />
        </Row>
        <Row label="Speakers">
          <DeviceSelect
            dark
            kind="audiooutput"
            value={prefs.audioOutputId}
            onChange={(id) => void switchDevice('audiooutput', id)}
            className="w-full"
          />
        </Row>
      </Section>

      <Section title="Video">
        <Row label="Camera">
          <DeviceSelect
            dark
            kind="videoinput"
            value={prefs.videoDeviceId}
            onChange={(id) => void switchDevice('videoinput', id)}
            className="w-full"
          />
        </Row>
        {canBlur && (
          <Row label="Blur your background">
            <div className="flex gap-1 rounded-full bg-white/5 p-1">
              {blurOptions.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => void setBlur(o.value)}
                  className={cn(
                    'flex-1 rounded-full px-3 py-1.5 text-sm transition',
                    prefs.blur === o.value ? 'bg-white text-neutral-950' : 'hover:bg-white/10',
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </Row>
        )}
      </Section>

      <Section title="General">
        <Switch
          label="Mirror my video"
          hint="Only you see it flipped, like a mirror."
          checked={prefs.mirror}
          onChange={(mirror) => updatePrefs({ mirror })}
        />
        <Switch
          label="Hide my video from me"
          hint="Others still see you."
          checked={prefs.hideSelf}
          onChange={(hideSelf) => updatePrefs({ hideSelf })}
        />
      </Section>

      <p className="mt-6 text-xs text-white/50">
        Shortcuts: Ctrl+D microphone · Ctrl+E camera · Ctrl+Alt+H raise hand · Ctrl+Alt+C chat ·
        Ctrl+Alt+P people (⌘ instead of Ctrl on a Mac)
      </p>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 first:mt-0">
      <h3 className="mb-2 text-xs font-semibold tracking-wide text-white/50 uppercase">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-sm text-white/80">{label}</p>
      {children}
    </div>
  );
}

function Switch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <span className="flex-1">
        <span className="block text-sm">{label}</span>
        <span className="block text-xs text-white/50">{hint}</span>
      </span>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        aria-hidden
        className={cn(
          'relative inline-block h-6 w-11 shrink-0 rounded-full transition peer-focus-visible:ring-2 peer-focus-visible:ring-sky-400',
          checked ? 'bg-sky-300' : 'bg-white/20',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition',
            checked && 'translate-x-5',
          )}
        />
      </span>
    </label>
  );
}
