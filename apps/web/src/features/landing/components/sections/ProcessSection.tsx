import { ArrowRight } from 'lucide-react';
import { buttonStyles } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/cn';
import { processSteps } from '../../content';
import { Reveal } from '../shared/Reveal';
import { RiskNote } from '../shared/RiskNote';
import { SectionHeading } from '../shared/SectionHeading';
import { BookingLink } from '@/components/ui/BookingLink';

export function ProcessSection() {
  return (
    <section id="process" className="px-2 py-8 sm:px-4">
      <div className="relative overflow-hidden rounded-[32px] bg-neutral-950 py-24 text-white sm:rounded-[48px] sm:py-32">
        {/* Soft glow for depth */}
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />

        <Container className="relative">
          <SectionHeading
            tone="dark"
            eyebrow="How it works"
            title={
              <>
                From first call <em>to compounding growth.</em>
              </>
            }
            description="A simple, proven process. You'll know exactly what's happening, and why, at every step."
          />

          <ol className="mt-20 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {processSteps.map((step, i) => (
              <li key={step.title}>
                <Reveal delay={i * 120} className="relative">
                  <div className="flex items-center gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/20 font-serif text-lg">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'hidden h-px flex-1 bg-gradient-to-r from-white/25 to-white/0 lg:block',
                        i === processSteps.length - 1 && 'lg:invisible',
                      )}
                    />
                  </div>
                  <p className="mt-8 text-xs tracking-[0.14em] text-neutral-400 uppercase">
                    {step.when}
                  </p>
                  <h3 className="mt-2 text-xl font-medium">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-400">{step.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal className="mt-16 flex flex-col items-center gap-3">
            <BookingLink className={buttonStyles({ variant: 'inverted' })}>
              Book a call
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </BookingLink>
            <RiskNote tone="dark" />
          </Reveal>
        </Container>
      </div>
    </section>
  );
}
