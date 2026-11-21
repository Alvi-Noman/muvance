import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

/** The Muvance mark: three rising bars. Takes its colour from the text colour. */
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

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className="w-8" />
      <span className="font-logo text-xl font-semibold tracking-[-0.03em]">
        Muvance <span className="font-sans font-normal text-neutral-500">Meet</span>
      </span>
    </span>
  );
}

const variants = {
  primary: 'bg-neutral-950 text-white shadow-lg shadow-black/10 hover:bg-neutral-800',
  secondary: 'border border-black/10 bg-white/70 text-neutral-950 backdrop-blur hover:bg-white',
  ghost: 'text-neutral-700 hover:bg-black/5',
  light: 'bg-white text-neutral-950 hover:bg-neutral-200',
  dark: 'bg-white/10 text-white hover:bg-white/20',
  danger: 'bg-red-600 text-white hover:bg-red-500',
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: 'sm' | 'md' | 'lg';
};

export function buttonStyles(variant: keyof typeof variants = 'primary', size = 'md') {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    size === 'sm' && 'px-4 py-2 text-sm',
    size === 'md' && 'px-6 py-3 text-sm',
    size === 'lg' && 'px-7 py-3.5 text-base',
  );
}

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonStyles(variant, size), className)} {...props} />;
}

const avatarColors = [
  'bg-amber-600',
  'bg-emerald-700',
  'bg-sky-700',
  'bg-violet-700',
  'bg-rose-700',
  'bg-teal-700',
  'bg-orange-700',
  'bg-indigo-700',
];

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

function colorFor(seed: string) {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function Avatar({
  name,
  seed,
  className,
}: {
  name: string;
  seed?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white select-none',
        colorFor(seed ?? name),
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

/** A centred dialog with a dimmed backdrop. Escape or the backdrop closes it. */
export function Dialog({
  open,
  onClose,
  title,
  children,
  dark,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  dark?: boolean;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        aria-label={title}
        className={cn(
          'animate-fade-up relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl p-6 shadow-2xl',
          dark ? 'bg-raised text-white' : 'bg-white text-neutral-950',
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(
              '-m-2 rounded-full p-2 transition',
              dark ? 'hover:bg-white/10' : 'hover:bg-black/5',
            )}
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block size-5 animate-spin rounded-full border-2 border-current border-r-transparent',
        className,
      )}
      aria-hidden
    />
  );
}
