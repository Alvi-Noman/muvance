import type { CSSProperties } from 'react';
import { useCall } from './call-context';

/** Emoji reactions floating up the left side of the screen, with who sent them. */
export function Reactions() {
  const { reactions } = useCall();
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-live="polite">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="animate-float-up absolute bottom-24 flex flex-col items-center"
          style={
            {
              left: `${r.left}%`,
              '--drift': `${(r.id % 2 ? 1 : -1) * (10 + (r.id % 5) * 6)}px`,
            } as CSSProperties
          }
        >
          <span className="text-4xl drop-shadow-lg">{r.emoji}</span>
          <span className="mt-1 max-w-28 truncate rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
            {r.name}
          </span>
        </div>
      ))}
    </div>
  );
}
