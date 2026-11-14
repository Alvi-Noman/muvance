import { ArrowRight, Check, Clock, ShieldCheck } from 'lucide-react';
import { buttonStyles } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { bookingPerks } from '../../content';
import { Reveal } from '../shared/Reveal';
import { RiskNote } from '../shared/RiskNote';
import { SectionHeading } from '../shared/SectionHeading';
import { BookingLink } from '@/components/ui/BookingLink';

/** Final call to action at the bottom of the landing page. Booking itself happens on /book. */
export function CtaSection() {
  return (
    <section className="px-2 py-8 sm:px-4">
      <div className="relative overflow-clip rounded-[32px] bg-neutral-950 py-20 text-white sm:rounded-[48px] sm:py-28">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />

        <Container className="relative flex flex-col items-center text-center">
          <SectionHeading
            tone="dark"
            eyebrow="Free strategy call"
            title={
              <>
                Ready to grow? <em>Let&apos;s talk.</em>
              </>
            }
            description="A free 30-minute call where we walk through your business, website and products. No pitch decks, no pressure. Just a clear look at what's working and what isn't."
          />

          <Reveal delay={100}>
            <ul className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8">
              {bookingPerks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-neutral-200">
                  <span className="grid size-5 place-items-center rounded-full bg-white text-neutral-950">
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={200} className="mt-12 flex flex-col items-center gap-3">
            <BookingLink className={buttonStyles({ variant: 'inverted', size: 'lg' })}>
              Book a call
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </BookingLink>
            <RiskNote tone="dark" />
          </Reveal>

          <Reveal
            delay={300}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-neutral-400"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4" aria-hidden />
              No fees until you hit your target
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4" aria-hidden />
              Pick a time that suits you
            </div>
          </Reveal>
        </Container>
      </div>
    </section>
  );
}
