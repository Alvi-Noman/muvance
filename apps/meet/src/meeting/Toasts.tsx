import { X } from 'lucide-react';
import type { Toast } from './call-context';

export function Toasts({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  if (!toasts.length) return null;
  return (
    <div
      className="pointer-events-none fixed inset-x-3 top-3 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:top-auto sm:bottom-24 sm:left-5 sm:items-start"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-fade-up pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl bg-raised py-3 pr-2 pl-4 text-sm text-white shadow-2xl ring-1 ring-white/10"
        >
          <span className="line-clamp-5 flex-1">{t.text}</span>
          {t.action && (
            <button
              type="button"
              onClick={() => {
                t.action?.run();
                dismiss(t.id);
              }}
              className="shrink-0 rounded-full px-3 py-1.5 font-medium text-sky-300 hover:bg-white/10"
            >
              {t.action.label}
            </button>
          )}
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss"
            className="shrink-0 rounded-full p-1.5 text-white/60 hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
