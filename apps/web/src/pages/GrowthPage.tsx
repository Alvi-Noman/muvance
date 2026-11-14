import { useEffect, useRef } from 'react';
import { Sparkle } from 'lucide-react';
import { BookingWidget } from '@/features/booking';
import {
  FaqSection,
  Hero,
  ProblemSection,
  ProcessSection,
  PromiseSection,
  RiskNote,
  ServicesSection,
} from '@/features/landing';
import { trackEvent } from '@/lib/meta-pixel';

/** Id of the booking section. Must match the BookingTargetContext value for /growth in the router. */
const GROWTH_BOOKING_ID = 'book';

/**
 * The booking calendar right on the page, so ad visitors book without loading another page.
 * Sends the same ViewContent event /book does, once, when it first comes into view.
 */
function BookingSection() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        trackEvent('ViewContent');
        observer.disconnect();
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-clip px-3 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28"
    >
      <div
        className="pointer-events-none absolute top-[45%] left-1/2 -z-10 h-[32rem] w-[64rem] -translate-x-1/2 rounded-full bg-white/70 blur-3xl"
        aria-hidden
      />

      <div className="mx-auto max-w-3xl px-1 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/60 px-3 py-1 text-xs font-medium tracking-[0.14em] text-neutral-600 uppercase">
          <Sparkle className="size-3 fill-neutral-900" aria-hidden />
          Free strategy call
        </span>
        <h2 className="mt-5 font-serif text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.95] tracking-[-0.02em]">
          Ready to grow? <em>Let&apos;s talk.</em>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-base text-balance text-neutral-500 sm:text-lg">
          Pick a time for a free 30-minute call. We&apos;ll walk through your business, website and
          products, and show you exactly where the growth is.
        </p>
        <div className="mt-5 flex justify-center">
          <RiskNote />
        </div>
      </div>

      {/* Buttons land on the calendar itself (with a little air above it on desktop). */}
      <div id={GROWTH_BOOKING_ID} className="mx-auto mt-10 max-w-5xl sm:mt-14 lg:scroll-mt-10">
        <BookingWidget />
      </div>
    </section>
  );
}

/**
 * The sales page for ad traffic (muvance.com/growth). Same story as the home page, but it ends
 * in the booking calendar itself, and lives separately so the home page can change without
 * touching what ads point to. Not linked from the site and kept out of search results
 * (noindex, not in sitemap), so it never competes with the home page.
 */
export function GrowthPage() {
  useEffect(() => {
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, follow';
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  // Links like /growth#book (e.g. from an ad) open at that section once the page renders.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
  }, []);

  return (
    <>
      <Hero />
      <ProblemSection />
      <PromiseSection />
      <ServicesSection />
      <ProcessSection />
      <FaqSection />
      <BookingSection />
    </>
  );
}
