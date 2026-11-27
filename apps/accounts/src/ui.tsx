import { useState, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from './lib/cn';

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

/** The Muvance account card every sign-in screen sits on. */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="animate-fade-up w-full max-w-[420px] rounded-3xl bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_12px_40px_-12px_rgba(0,0,0,0.12)] ring-1 ring-line sm:p-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-9 items-center justify-center rounded-xl bg-ink text-white">
            <LogoMark className="w-5" />
          </span>
          <span className="font-logo text-lg font-semibold tracking-[-0.03em]">Muvance</span>
        </div>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
        <div className="mt-7">{children}</div>
      </div>
    </div>
  );
}

export function TextField({
  label,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        {...props}
        className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] outline-none transition focus:border-ink focus:ring-4 focus:ring-black/5"
      />
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  autoFocus,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  autoFocus?: boolean;
  hint?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <span className="mt-1.5 flex h-11 items-center rounded-xl border border-line bg-white pr-1.5 transition focus-within:border-ink focus-within:ring-4 focus-within:ring-black/5">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required
          className="h-full min-w-0 flex-1 rounded-xl bg-transparent px-3.5 text-[15px] outline-none"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="rounded-lg p-2 text-muted hover:bg-black/5 hover:text-ink"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </span>
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[15px] font-medium text-white transition hover:bg-black/85 disabled:opacity-60"
    >
      {busy ? <Spinner /> : children}
    </button>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      {children}
    </p>
  );
}
