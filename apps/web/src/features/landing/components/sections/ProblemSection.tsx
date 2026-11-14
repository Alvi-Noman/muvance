import { ArrowRight } from 'lucide-react';
import { buttonStyles } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { painPoints } from '../../content';
import { Reveal } from '../shared/Reveal';
import { RiskNote } from '../shared/RiskNote';
import { SectionHeading } from '../shared/SectionHeading';
import { BookingLink } from '@/components/ui/BookingLink';

export function ProblemSection() {
  return (
    <section className="py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            align="left"
            eyebrow="Sound familiar?"
            title={
              <>
                Great product. <em>Ads that don&apos;t show it.</em>
              </>
            }
            description="If any of these hit home, you're leaving money on the table. The good news: every one of them is fixable."
          />
          <Reveal delay={150} className="mt-8">
            <BookingLink className={buttonStyles()}>
              Book a call
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </BookingLink>
            <RiskNote className="mt-3" />
          </Reveal>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {painPoints.map((pain, i) => (
            <li key={pain.title}>
              <Reveal
                delay={i * 100}
                className="h-full rounded-[28px] border border-white/80 bg-white/70 p-7 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)]"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-neutral-100">
                  <pain.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-10 text-lg font-medium">{pain.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{pain.body}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
