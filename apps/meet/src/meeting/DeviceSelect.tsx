import { useMediaDevices } from '@livekit/components-react';
import { Camera, ChevronDown, Mic, Volume2 } from 'lucide-react';
import { cn } from '@/lib/cn';

const icons = { audioinput: Mic, audiooutput: Volume2, videoinput: Camera } as const;
const fallback = {
  audioinput: 'Microphone',
  audiooutput: 'Speaker',
  videoinput: 'Camera',
} as const;

/** Picking a speaker only works where the browser supports it (Chrome, Edge). */
const canPickSpeaker =
  typeof HTMLMediaElement !== 'undefined' && 'setSinkId' in HTMLMediaElement.prototype;

/** A pill-shaped device picker. Shows the device's name, e.g. "MacBook Pro Microphone". */
export function DeviceSelect({
  kind,
  value,
  onChange,
  dark,
  className,
}: {
  kind: 'audioinput' | 'audiooutput' | 'videoinput';
  value: string;
  onChange: (deviceId: string) => void;
  dark?: boolean;
  className?: string;
}) {
  const devices = useMediaDevices({ kind });
  if (kind === 'audiooutput' && !canPickSpeaker) return null;
  const Icon = icons[kind];
  const list = devices.filter((d) => d.deviceId);
  const current = list.find((d) => d.deviceId === value) ? value : (list[0]?.deviceId ?? '');

  return (
    <label
      className={cn(
        'relative inline-flex max-w-full min-w-0 items-center gap-2 rounded-full border py-2 pr-9 pl-3 text-sm',
        dark
          ? 'border-white/15 bg-white/5 text-white hover:bg-white/10'
          : 'border-black/10 bg-white/70 text-neutral-800 hover:bg-white',
        className,
      )}
    >
      <Icon className="size-4 shrink-0 opacity-70" />
      <span className="sr-only">{fallback[kind]}</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        disabled={!list.length}
        className={cn(
          'absolute inset-0 cursor-pointer appearance-none opacity-0',
          dark && '[&>option]:text-neutral-950',
        )}
      >
        {list.length === 0 && <option value="">{fallback[kind]}</option>}
        {list.map((d, i) => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label || `${fallback[kind]} ${i + 1}`}
          </option>
        ))}
      </select>
      <span className="pointer-events-none max-w-[14rem] truncate">
        {list.find((d) => d.deviceId === current)?.label || fallback[kind]}
      </span>
      <ChevronDown className="pointer-events-none absolute right-3 size-4 opacity-60" />
    </label>
  );
}
