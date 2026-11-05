import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/cn';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Accessible dialog: Escape and backdrop close it, focus moves inside and returns afterwards. */
export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    // Focus the first field (or the panel) once it's rendered.
    requestAnimationFrame(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(
        'input, select, textarea, button:not([data-close])',
      );
      (target ?? panelRef.current)?.focus();
    });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus();
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-void/75 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-hud/30 bg-white p-6 shadow-[0_0_60px_-10px_rgb(92_225_255/0.35)] outline-none sm:max-w-lg sm:rounded-3xl',
              className,
            )}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-base tracking-wide">{title}</h2>
                {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
              </div>
              <button
                type="button"
                data-close
                onClick={onClose}
                aria-label="Close"
                className="grid size-8 shrink-0 place-items-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <X className="size-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
