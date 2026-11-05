import { useId } from 'react';

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** A ring that fills to `value` (0 to 1). No value yet shows an empty ring. */
export function HudGauge({
  value,
  label,
  hint,
  display,
}: {
  value: number | null;
  label: string;
  hint: string;
  display: string;
}) {
  const id = useId();
  const fill = Math.min(1, Math.max(0, value ?? 0));

  return (
    <div className="flex items-center gap-4 p-5">
      <div className="relative size-24 shrink-0">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" fill="none" aria-hidden>
          <defs>
            <linearGradient id={id}>
              <stop offset="0%" stopColor="#ffb454" />
              <stop offset="100%" stopColor="#5ce1ff" />
            </linearGradient>
          </defs>
          <circle
            cx="60"
            cy="60"
            r="58"
            stroke="#5ce1ff"
            strokeOpacity="0.25"
            strokeDasharray="1 5"
          />
          <circle cx="60" cy="60" r={RADIUS} stroke="#5ce1ff" strokeOpacity="0.1" strokeWidth="7" />
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            stroke={`url(#${id})`}
            strokeWidth="7"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - fill)}
            className="transition-[stroke-dashoffset] duration-1000 ease-out"
            style={{ filter: 'drop-shadow(0 0 5px rgb(92 225 255 / 0.7))' }}
          />
        </svg>
        <p className="absolute inset-0 grid place-items-center font-serif text-lg tabular-nums">
          {display}
        </p>
      </div>
      <div className="min-w-0">
        <p className="hud-label text-hud">{label}</p>
        <p className="mt-1.5 text-sm text-neutral-500">{hint}</p>
      </div>
    </div>
  );
}
