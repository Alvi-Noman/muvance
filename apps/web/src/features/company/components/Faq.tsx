import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Reveal, SectionHeading } from '@/features/landing';
import type { FaqItem } from './faq-json-ld';

type FaqProps = {
  items: FaqItem[];
  eyebrow?: string;
  title?: ReactNode;
};

/** Questions and answers as native disclosure widgets: keyboard and screen-reader friendly. */
export function Faq({
  items,
  eyebrow = 'FAQ',
  title = (
    <>
      Questions, <em>answered.</em>
    </>
  ),
}: FaqProps) {
  return (
    <section className="py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <SectionHeading eyebrow={eyebrow} title={title} align="left" />
        <Reveal>
          <div className="divide-y divide-black/10 border-y border-black/10">
            {items.map((item) => (
              <details key={item.question} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg py-5 text-left text-lg font-medium outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/30 [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span className="grid size-8 shrink-0 place-items-center rounded-full border border-black/10 bg-white/70 transition group-open:rotate-45 group-open:bg-neutral-950 group-open:text-white">
                    <Plus className="size-4" aria-hidden />
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 leading-relaxed text-neutral-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
