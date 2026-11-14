import { useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { buttonStyles } from '@/components/ui/Button';
import { siteConfig } from '@/config/site';
import { BookingThankYou, isThankYouState } from '@/features/booking';

export function ThankYouPage() {
  const { state } = useLocation();

  useEffect(() => {
    document.title = `You're booked | ${siteConfig.name}`;
  }, []);

  return (
    <section className="relative isolate overflow-clip px-4 pt-12 pb-20 sm:pt-20 sm:pb-28">
      <div
        className="pointer-events-none absolute top-[45%] left-1/2 -z-10 h-[32rem] w-[64rem] -translate-x-1/2 rounded-full bg-white/70 blur-3xl"
        aria-hidden
      />

      {isThankYouState(state) ? (
        <BookingThankYou booking={state} />
      ) : (
        // Opened directly (e.g. bookmarked) without booking details.
        <div className="mx-auto max-w-xl py-16 text-center">
          <h1 className="font-serif text-[clamp(3rem,8vw,5rem)] leading-[0.95]">
            Thanks for <em>booking.</em>
          </h1>
          <p className="mt-6 text-neutral-500">We&apos;ll call you just before the meeting.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/" className={buttonStyles()}>
              <ArrowLeft
                className="size-4 transition-transform group-hover:-translate-x-0.5"
                aria-hidden
              />
              Go to home
            </Link>
            <Link to={siteConfig.bookingHref} className={buttonStyles({ variant: 'secondary' })}>
              Need another time?
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
