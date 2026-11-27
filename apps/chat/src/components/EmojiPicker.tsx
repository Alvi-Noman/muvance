import { useEffect, useRef, useState } from 'react';
import { EMOJI_GROUPS } from '@/lib/format';
import { cn } from '@/lib/utils';

/** A small emoji grid in a popover. */
export function EmojiPicker({
  onPick,
  onClose,
  className,
}: {
  onPick: (emoji: string) => void;
  onClose: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [group, setGroup] = useState(0);
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    // Next tick, so the click that opened it doesn't close it.
    const t = window.setTimeout(() => document.addEventListener('pointerdown', onDown));
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);
  return (
    <div
      ref={ref}
      className={cn(
        'animate-fade-up z-40 w-[296px] rounded-2xl border border-line bg-white p-2 shadow-xl',
        className,
      )}
    >
      <div className="mb-1.5 flex gap-1">
        {EMOJI_GROUPS.map((g, i) => (
          <button
            key={g.name}
            type="button"
            onClick={() => setGroup(i)}
            className={cn(
              'rounded-lg px-2 py-1 text-xs font-medium transition',
              i === group ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-black/5',
            )}
          >
            {g.name}
          </button>
        ))}
      </div>
      <div className="scrollbar-thin grid max-h-52 grid-cols-8 gap-0.5 overflow-y-auto">
        {EMOJI_GROUPS[group]!.emoji.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onPick(e)}
            className="inline-flex size-8 items-center justify-center rounded-lg text-xl transition hover:bg-black/5"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}
