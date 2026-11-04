import { useEffect } from 'react';
import { Sparkle } from 'lucide-react';
import { motion } from 'motion/react';
import { siteConfig } from '@/config/site';
import { BookingWidget } from '@/features/booking';

export function BookPage() {
  useEffect(() => {
    document.title = `Book a call | ${siteConfig.name}`;
  }, []);

  return (
    <section className="relative isolate overflow-clip px-3 pt-8 pb-20 sm:px-6 sm:pt-14 sm:pb-28">
      {/* Soft backdrop glow behind the widget */}
      <div
        className="pointer-events-none absolute top-[38%] left-1/2 -z-10 h-[32rem] w-[64rem] -translate-x-1/2 rounded-full bg-white/70 blur-3xl"
        aria-hidden
      />

      <div className="mx-auto max-w-3xl px-1 text-center">
        <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-black/5 bg-white/60 px-3 py-1 text-xs font-medium tracking-[0.14em] text-neutral-600 uppercase">
          <Sparkle className="size-3 fill-neutral-900" aria-hidden />
          Free strategy call
        </span>

        <h1 className="mt-5 animate-fade-up font-serif text-[clamp(3rem,9vw,6.25rem)] leading-[0.95] tracking-[-0.02em] [animation-delay:80ms]">
          Book a{' '}
          <span className="relative inline-block">
            <em>30-min</em>
            <svg
              viewBox="0 0 200 16"
              preserveAspectRatio="none"
              className="absolute -bottom-[0.12em] left-0 h-[0.18em] w-full overflow-visible"
              aria-hidden
            >
              <motion.path
                d="M3 11 C 50 3, 120 3, 197 9"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.6, duration: 0.7, ease: 'easeInOut' }}
              />
            </svg>
          </span>{' '}
          call
        </h1>

        <p className="mx-auto mt-6 max-w-md animate-fade-up text-base text-balance text-neutral-500 [animation-delay:160ms] sm:text-lg">
          Pick a time that suits you. We&apos;ll walk through your business, website and products,
          and show you exactly where the growth is.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-5xl animate-fade-up [animation-delay:240ms] sm:mt-14">
        <BookingWidget />
      </div>
    </section>
  );
}
