import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
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
          <p className="mt-6 text-neutral-500">
            We&apos;ll call you just before the meeting. Need another time?
          </p>
          <Link to={siteConfig.bookingHref} className={`${buttonStyles()} mt-8`}>
            Book a call
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      )}
    </section>
  );
}
