import type { ReactNode } from 'react';
import { ArrowRight, Sparkle, type LucideIcon } from 'lucide-react';
import { BookingLink } from '@/components/ui/BookingLink';
import { buttonStyles } from '@/components/ui/Button';
import { RiskNote } from '@/features/landing';
import { cn } from '@/lib/cn';

type PageHeroProps = {
  eyebrow: string;
  icon?: LucideIcon;
  /** Wrap the accent words in `<em>` for the italic serif style. */
  title: ReactNode;
  lead: ReactNode;
  /** Replaces the default "Book a call" button and risk note. */
  actions?: ReactNode;
  /** Shown under the copy, e.g. a visual or a row of facts. */
  children?: ReactNode;
  className?: string;
};

/**
 * The opening of every inner page (services, about, invest...): a pill label, a large serif
 * headline with an italic accent, a short lead and the call to action, over a soft grid.
 */
export function PageHero({
  eyebrow,
  icon: Icon = Sparkle,
  title,
  lead,
  actions,
  children,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn('relative isolate overflow-clip pt-10 pb-16 sm:pt-16 sm:pb-24', className)}
    >
      <HeroBackdrop />

      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <p className="inline-flex animate-fade-up items-center gap-2.5 rounded-full border border-black/5 bg-white/70 py-1.5 pr-4 pl-1.5 text-sm font-medium text-neutral-800 shadow-sm backdrop-blur">
          <span className="grid size-7 place-items-center rounded-full bg-neutral-950 text-white">
            <Icon className="size-3.5" aria-hidden />
          </span>
          {eyebrow}
        </p>

        <h1 className="mt-6 animate-fade-up font-serif text-[clamp(3rem,10vw,6.5rem)] leading-[0.92] tracking-[-0.02em] text-balance [animation-delay:60ms]">
          {title}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-base text-balance text-neutral-500 [animation-delay:120ms] sm:text-lg">
          {lead}
        </p>

        <div className="mt-9 flex animate-fade-up flex-col items-center gap-3 [animation-delay:180ms]">
          {actions ?? (
            <>
              <BookingLink className={buttonStyles({ size: 'lg' })}>
                Book a call
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </BookingLink>
              <RiskNote />
            </>
          )}
        </div>
      </div>

      {children && (
        <div className="mx-auto mt-14 max-w-7xl animate-fade-up px-4 [animation-delay:260ms] sm:mt-20 sm:px-6 lg:px-8">
          {children}
        </div>
      )}
    </section>
  );
}

/** A faint grid that fades out towards the edges, with a warm glow behind the headline. */
function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
      <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgb(0_0_0/0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgb(0_0_0/0.045)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_30%,black,transparent)]" />
      <div className="absolute top-0 left-1/2 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-white/80 blur-3xl" />
      <div className="absolute top-24 left-[12%] size-72 rounded-full bg-amber-200/25 blur-3xl" />
      <div className="absolute top-40 right-[10%] size-72 rounded-full bg-sky-200/25 blur-3xl" />
    </div>
  );
}
