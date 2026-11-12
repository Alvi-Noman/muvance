import { ArrowRight, Banknote, ShieldCheck, Sparkle, TrendingUp } from 'lucide-react';
import heroPortrait from '@/assets/images/hero/hero-portrait.jpg';
import { SectionLink } from '@/components/layout/SectionLink';
import { siteConfig } from '@/config/site';
import { ConnectorLines } from './ConnectorLines';
import { FloatingCard } from './FloatingCard';
import { RotatingBadge } from './RotatingBadge';
import { Link } from 'react-router';

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <ConnectorLines className="pointer-events-none absolute inset-0 -z-10 hidden size-full text-neutral-300 xl:block" />

      {/* Copy */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-8 text-center sm:px-6 sm:pt-12 lg:px-8">
        {/* The core offer, linking to the promise section. */}
        <SectionLink
          href="/#promise"
          className="group mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-black/5 bg-white/70 py-1 pr-3 pl-1 text-sm shadow-sm backdrop-blur transition hover:bg-white"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-white">
            <ShieldCheck className="size-3.5" aria-hidden />
            Paid on results
          </span>
          <span className="hidden text-neutral-600 sm:inline">
            No fees until you hit your sales target
          </span>
          <ArrowRight
            className="size-3.5 text-neutral-400 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </SectionLink>

        <h1 className="animate-fade-up font-serif text-[min(13.5vw,4.25rem)] sm:text-[clamp(4rem,8vw,7rem)] leading-[0.92] tracking-[-0.02em]">
          Smarter ads
          <br />
          <em>for faster growth.</em>
        </h1>

        <p className="mx-auto mt-6 max-w-xl animate-fade-up text-base text-balance text-neutral-500 [animation-delay:120ms] sm:text-lg">
          This is how our clients generate{' '}
          <strong className="font-semibold text-neutral-900">
            50 lac to 2 crore taka of sales
          </strong>{' '}
          every single month for{' '}
          <strong className="font-semibold text-neutral-900">less than $1 CPA</strong>, without
          massive advertising budgets.
        </p>

        <div className="mt-9 flex animate-fade-up justify-center [animation-delay:240ms]">
          {/* The one call to action: beats gently to draw the eye, and stops while hovered. */}
          <Link
            to={siteConfig.bookingHref}
            className="group inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-neutral-950 px-8 py-4 text-base font-medium text-white shadow-lg shadow-black/10 transition-colors hover:bg-neutral-800 hover:[animation-play-state:paused] sm:w-auto motion-safe:animate-cta-pulse"
          >
            Book a call
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </div>

      {/* Portrait */}
      <div className="relative -mt-14 -ml-[25%] w-[150%] animate-fade-up [animation-delay:360ms] sm:mx-auto sm:-mt-24 sm:w-full sm:max-w-5xl">
        <img
          src={heroPortrait}
          alt="Man looking upward, surrounded by floating cards showing Meta ad results"
          width={1744}
          height={1200}
          fetchPriority="high"
          draggable={false}
          className="hero-image-mask h-auto w-full select-none"
        />
      </div>

      {/* Decorations (large screens only) */}
      <RotatingBadge
        text="More growth · Every single day · "
        className="absolute top-10 right-[6%] hidden animate-fade-up [animation-delay:500ms] xl:block"
      />

      <FloatingCard className="absolute top-[250px] left-[4%] hidden -rotate-6 xl:block">
        <span className="grid size-9 place-items-center rounded-xl bg-neutral-100">
          <TrendingUp className="size-4" aria-hidden />
        </span>
        <p className="mt-6 text-lg leading-snug font-medium">Turn ad spend into real profit.</p>
        <p className="mt-2 text-sm text-neutral-500">Track, test and scale what works.</p>
      </FloatingCard>

      <FloatingCard
        className="absolute top-[330px] right-[4%] hidden rotate-6 xl:block"
        floatDelay="-3s"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-neutral-100">
          <Banknote className="size-4" aria-hidden />
        </span>
        <p className="mt-6 text-lg leading-snug font-medium">Hit your target first.</p>
        <p className="mt-2 text-sm text-neutral-500">Then we get paid. No advance payments.</p>
      </FloatingCard>

      <div className="absolute bottom-[18%] left-[4%] hidden animate-fade-up text-left [animation-delay:700ms] lg:block">
        <span className="block h-px w-8 bg-neutral-400" />
        <p className="mt-4 max-w-44 text-sm text-neutral-600">
          No retainers. No setup fees. No advance payments.
        </p>
      </div>

      <div className="absolute right-[4%] bottom-[22%] hidden animate-fade-up items-end gap-4 [animation-delay:700ms] lg:flex">
        <span className="mb-2 block h-px w-8 bg-neutral-400" />
        <div className="text-left">
          <Sparkle className="mb-5 size-5 fill-neutral-900" aria-hidden />
          <p className="text-sm text-neutral-600">
            Less guesswork.
            <br />
            More growth.
          </p>
        </div>
      </div>
    </section>
  );
}
