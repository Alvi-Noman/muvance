import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const variants = {
  primary: 'bg-neutral-950 text-white shadow-lg shadow-black/10 hover:bg-neutral-800',
  secondary: 'border border-black/10 bg-white/70 text-neutral-950 backdrop-blur hover:bg-white',
  inverted: 'bg-white text-neutral-950 hover:bg-neutral-200',
  ghost: 'text-neutral-700 hover:bg-black/5',
} as const;

const sizes = {
  md: 'px-6 py-3 text-sm',
  lg: 'px-7 py-4 text-base',
} as const;

type ButtonStyleOptions = {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

/** Button classes, for use on `<a>` and `<Link>` as well as `<button>`. */
export function buttonStyles({ variant = 'primary', size = 'md' }: ButtonStyleOptions = {}) {
  return cn(
    'group inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleOptions;

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}
