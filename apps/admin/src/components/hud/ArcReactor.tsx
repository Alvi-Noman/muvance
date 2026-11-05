import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

const COILS = Array.from({ length: 10 }, (_, i) => i * 36);

/** The animated reactor mark. Decorative: anything shown in its centre is passed as children. */
export function ArcReactor({
  size = 120,
  className,
  children,
}: {
  size?: number;
  className?: string;
  children?: ReactNode;
}) {
  const glow = useId();

  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        className="size-full text-hud drop-shadow-[0_0_14px_rgb(92_225_255/0.55)]"
        fill="none"
        aria-hidden
      >
        <defs>
          <radialGradient id={glow}>
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#8ff0ff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#5ce1ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="100" cy="100" r="98" stroke="currentColor" strokeOpacity="0.3" />
        <circle
          className="hud-spin"
          cx="100"
          cy="100"
          r="92"
          stroke="currentColor"
          strokeOpacity="0.85"
          strokeDasharray="1.5 7"
          strokeWidth="3"
        />
        <circle
          className="hud-spin-reverse"
          cx="100"
          cy="100"
          r="80"
          stroke="currentColor"
          strokeDasharray="70 22 12 22"
          strokeWidth="2.5"
        />
        <g className="hud-spin">
          {COILS.map((angle) => (
            <rect
              key={angle}
              x="92"
              y="30"
              width="16"
              height="20"
              rx="1.5"
              fill="currentColor"
              fillOpacity="0.45"
              stroke="currentColor"
              transform={`rotate(${angle} 100 100)`}
            />
          ))}
        </g>
        <circle cx="100" cy="100" r="46" stroke="currentColor" strokeOpacity="0.8" />
        <circle
          className="hud-pulse"
          cx="100"
          cy="100"
          r={children ? 46 : 42}
          fill={`url(#${glow})`}
          // Dimmer behind a readout, so the number stays legible.
          opacity={children ? 0.4 : undefined}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
      )}
    </div>
  );
}
