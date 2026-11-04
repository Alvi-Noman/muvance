import type { ReactNode } from 'react';
import { Sparkle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from './Reveal';

type SectionHeadingProps = {
  eyebrow: string;
  /** Wrap the accent words in `<em>` for the italic serif style. */
  title: ReactNode;
  description?: ReactNode;
  align?: 'center' | 'left';
  tone?: 'light' | 'dark';
  /** Set false to skip the scroll-in animation. */
  reveal?: boolean;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'light',
  reveal = true,
  className,
}: SectionHeadingProps) {
  const dark = tone === 'dark';

  return (
    <Reveal
      disabled={!reveal}
      className={cn(
        'max-w-3xl',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-[0.14em] uppercase',
          dark
            ? 'border-white/15 bg-white/5 text-neutral-300'
            : 'border-black/5 bg-white/60 text-neutral-600',
        )}
      >
        <Sparkle className={cn('size-3', dark ? 'fill-white' : 'fill-neutral-900')} aria-hidden />
        {eyebrow}
      </span>
      <h2
        className={cn(
          'mt-5 font-serif text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.95] tracking-[-0.02em] text-balance',
          dark ? 'text-white' : 'text-neutral-950',
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-5 text-base text-balance sm:text-lg',
            align === 'center' && 'mx-auto max-w-xl',
            dark ? 'text-neutral-400' : 'text-neutral-500',
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
