import { useId, useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { buttonStyles } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/cn';
import { faqs } from '../../content';
import { Reveal } from '../shared/Reveal';
import { RiskNote } from '../shared/RiskNote';
import { SectionHeading } from '../shared/SectionHeading';
import { BookingLink } from '@/components/ui/BookingLink';

export function FaqSection() {
  const [first, ...rest] = faqs;
  const [openQuestion, setOpenQuestion] = useState<string | null>(first?.question ?? null);
  const baseId = useId();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  // Mobile: "What happens on the call?" comes last, right above the booking card.
  const orderedFaqs = isDesktop || !first ? faqs : [...rest, first];

  return (
    <section id="faq" className="py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            align="left"
            eyebrow="FAQ"
            title={
              <>
                Questions, <em>answered.</em>
              </>
            }
            description="Everything you might want to know before booking a call."
          />
          <FaqCta className="mt-8 hidden lg:block" />
        </div>

        <div>
          <Reveal delay={100}>
            <ul className="divide-y divide-black/10 border-y border-black/10">
              {orderedFaqs.map((faq, i) => {
                const open = openQuestion === faq.question;
                const panelId = `${baseId}-panel-${i}`;
                return (
                  <li key={faq.question}>
                    <h3>
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => setOpenQuestion(open ? null : faq.question)}
                        className="flex w-full items-center justify-between gap-6 py-6 text-left text-base font-medium sm:text-lg"
                      >
                        {faq.question}
                        <span
                          className={cn(
                            'grid size-8 shrink-0 place-items-center rounded-full border transition',
                            open
                              ? 'rotate-45 border-neutral-950 bg-neutral-950 text-white'
                              : 'border-black/10',
                          )}
                        >
                          <Plus className="size-4" aria-hidden />
                        </span>
                      </button>
                    </h3>
                    <div
                      id={panelId}
                      role="region"
                      className={cn(
                        'grid transition-[grid-template-rows] duration-300 ease-out',
                        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-xl pr-12 pb-6 text-neutral-500">{faq.answer}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Reveal>

          {/* Mobile: shown after the questions instead. */}
          <FaqCta className="mt-12 lg:hidden" />
        </div>
      </Container>
    </section>
  );
}

function FaqCta({ className }: { className: string }) {
  return (
    <Reveal
      delay={150}
      className={cn(
        'rounded-[28px] border border-white/80 bg-white/70 p-6 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)]',
        className,
      )}
    >
      <p className="font-medium">Still have questions?</p>
      <p className="mt-1 text-sm text-neutral-500">Ask us anything on a free, no-pressure call.</p>
      <BookingLink className={cn(buttonStyles(), 'mt-5')}>
        Book a call
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </BookingLink>
      <RiskNote className="mt-3" />
    </Reveal>
  );
}
