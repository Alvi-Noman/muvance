import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { avatarTone, cn, initials } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 552 270"
      className={cn('h-auto shrink-0', className)}
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="8"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M72 105H184L120 262H8Z" />
      <path d="M232 105H344L280 262H168Z" />
      <path d="M433 8H544L440 262H329Z" />
    </svg>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent',
        className,
      )}
      aria-hidden
    />
  );
}

export function Avatar({
  name,
  seed,
  src,
  className,
}: {
  name: string;
  seed: string;
  /** A profile picture; initials are shown when there's none. */
  src?: string | null;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn('inline-block shrink-0 rounded-full object-cover', className)}
      />
    );
  }
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full text-[13px] font-semibold select-none',
        avatarTone(seed),
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

const variants = {
  primary: 'bg-ink text-white hover:bg-black/85 shadow-sm',
  secondary: 'border border-line bg-white text-ink hover:bg-black/[0.03]',
  ghost: 'text-ink hover:bg-black/[0.05]',
  accent: 'bg-accent text-white hover:bg-accent/90 shadow-sm',
} as const;

export function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

/** A square icon button with a tooltip-style title. */
export function IconButton({
  label,
  className,
  children,
  active,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-black/[0.05] hover:text-ink disabled:opacity-40 [&_svg]:size-[18px]',
        active && 'bg-black/[0.06] text-ink',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        aria-label={title}
        className={cn(
          'animate-slide-in relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-2xl',
          className,
        )}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-canvas px-1.5 py-0.5 font-sans text-[11px] text-muted">
      {children}
    </kbd>
  );
}
