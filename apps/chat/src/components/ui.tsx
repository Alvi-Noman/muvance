import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { X } from 'lucide-react';
import type { ChatPersonDto } from '@muvance/shared';
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
  person,
  className,
  presence,
}: {
  person: Pick<ChatPersonDto, 'id' | 'name' | 'avatarUrl' | 'online'>;
  className?: string;
  /** Show a green dot when they're online. */
  presence?: boolean;
}) {
  return (
    <span className={cn('relative inline-flex shrink-0', className)}>
      {person.avatarUrl ? (
        <img
          src={person.avatarUrl}
          alt=""
          className="size-full rounded-full object-cover"
          draggable={false}
        />
      ) : (
        <span
          className={cn(
            'inline-flex size-full items-center justify-center rounded-full text-[0.8em] font-semibold select-none',
            avatarTone(person.id || person.name),
          )}
          aria-hidden
        >
          {initials(person.name)}
        </span>
      )}
      {presence && (
        <span
          className={cn(
            'absolute -right-0.5 -bottom-0.5 size-[38%] max-h-3.5 max-w-3.5 min-h-2.5 min-w-2.5 rounded-full border-2 border-white',
            person.online ? 'bg-emerald-500' : 'bg-neutral-300',
          )}
          title={person.online ? 'Online' : 'Away'}
        />
      )}
    </span>
  );
}

const variants = {
  primary: 'bg-ink text-white hover:bg-black/85 shadow-sm',
  secondary: 'border border-line bg-white text-ink hover:bg-black/[0.03]',
  ghost: 'text-ink hover:bg-black/[0.05]',
  accent: 'bg-accent text-white hover:bg-accent/90 shadow-sm',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
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
        'inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

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

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] outline-none transition placeholder:text-neutral-400 focus:border-ink focus:ring-4 focus:ring-black/5',
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </label>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (on: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-10 shrink-0 rounded-full transition',
        checked ? 'bg-accent' : 'bg-neutral-300',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 size-5 rounded-full bg-white shadow transition-all',
          checked ? 'left-[18px]' : 'left-0.5',
        )}
      />
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
          'animate-slide-in scrollbar-thin relative max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:max-w-lg sm:rounded-2xl',
          className,
        )}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="truncate text-base font-semibold">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}

/** A small dropdown menu that closes on outside click or Escape. */
export function Menu({
  trigger,
  children,
  align = 'right',
  className,
}: {
  trigger: (open: boolean, toggle: () => void) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: 'left' | 'right';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      {trigger(open, () => setOpen((o) => !o))}
      {open && (
        <div
          className={cn(
            'animate-fade-up absolute top-full z-40 mt-1.5 min-w-52 rounded-xl border border-line bg-white p-1.5 text-sm shadow-xl',
            align === 'right' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  icon,
  children,
  onClick,
  danger,
}: {
  icon?: ReactNode;
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-black/[0.04] [&_svg]:size-4 [&_svg]:text-muted',
        danger && 'text-red-600 [&_svg]:text-red-500',
      )}
    >
      {icon}
      <span className="min-w-0 flex-1">{children}</span>
    </button>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'guest' | 'accent';
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        tone === 'neutral' && 'bg-black/[0.05] text-muted',
        tone === 'guest' && 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
        tone === 'accent' && 'bg-accent-soft text-accent',
      )}
    >
      {children}
    </span>
  );
}

/* Toasts ---------------------------------------------------------------------------------- */

interface ToastItem {
  id: number;
  text: string;
}
const ToastContext = createContext<(text: string) => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const show = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setItems((list) => [...list.slice(-2), { id, text }]);
    window.setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 4500);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            className="animate-fade-up pointer-events-auto max-w-md rounded-xl bg-ink px-4 py-2.5 text-sm text-white shadow-xl"
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
