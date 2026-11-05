import type { ButtonHTMLAttributes } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

const variants = {
  primary:
    'bg-hud text-void shadow-[0_0_18px_rgb(92_225_255/0.4)] hover:bg-neutral-950 hover:shadow-[0_0_26px_rgb(92_225_255/0.65)]',
  secondary:
    'border border-hud/30 bg-hud/[0.04] text-neutral-900 hover:border-hud/70 hover:bg-hud/10 hover:text-hud',
  ghost: 'text-neutral-600 hover:bg-black/5 hover:text-neutral-950',
  danger: 'bg-red-600 text-void shadow-[0_0_18px_rgb(255_107_122/0.35)] hover:bg-red-500',
  'danger-ghost': 'text-red-600 hover:bg-red-50',
} as const;

const sizes = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-xs',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  icon: 'size-9 rounded-lg',
} as const;

export type ButtonStyleProps = { variant?: keyof typeof variants; size?: keyof typeof sizes };

export function buttonStyles({ variant = 'primary', size = 'md' }: ButtonStyleProps = {}) {
  return cn(
    'inline-flex shrink-0 items-center justify-center font-semibold tracking-wide whitespace-nowrap transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hud disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleProps & { loading?: boolean };

export function Button({
  variant,
  size,
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(buttonStyles({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
