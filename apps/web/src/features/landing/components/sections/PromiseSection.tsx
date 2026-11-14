import { ArrowRight, Check, ShieldCheck, X } from 'lucide-react';
import { buttonStyles } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/cn';
import { promiseComparison } from '../../content';
import { Reveal } from '../shared/Reveal';
import { SectionHeading } from '../shared/SectionHeading';
import { BookingLink } from '@/components/ui/BookingLink';

/** Muvance's core differentiator: no fees until the client hits their sales target. */
export function PromiseSection() {
  return (
    <section id="promise" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Our promise"
          title={
            <>
              Hit your sales target first. <em>Then we get paid.</em>
            </>
          }
          description="Most agencies bill you every month, whether your sales grow or not. We agree on a sales target with you, and we don't charge a single taka until you reach it. We treat your business like our own, as your growth partner, not just another agency."
        />

        <div className="mt-16 grid gap-4 lg:grid-cols-2">
          <Reveal>
            <ComparisonCard variant="others" />
          </Reveal>
          <Reveal delay={120}>
            <ComparisonCard variant="muvance" />
          </Reveal>
        </div>

        <Reveal
          delay={200}
          className="mt-4 flex flex-col gap-6 rounded-[28px] border border-white/80 bg-white/70 p-6 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)] sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <ShieldCheck className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-lg font-medium">0% risk. We only win when you do.</p>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-neutral-500">
                No retainers, no setup fees, no advance payments. If we don&apos;t deliver the sales
                we promised, you don&apos;t pay. It&apos;s that simple.
              </p>
            </div>
          </div>
          <BookingLink className={cn(buttonStyles(), 'shrink-0')}>
            Book a call
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </BookingLink>
        </Reveal>
      </Container>
    </section>
  );
}

function ComparisonCard({ variant }: { variant: 'others' | 'muvance' }) {
  const ours = variant === 'muvance';

  return (
    <div
      className={cn(
        'relative h-full overflow-hidden rounded-[28px] p-6 sm:p-8',
        ours
          ? 'bg-neutral-950 text-white shadow-[0_40px_100px_-30px_rgba(0,0,0,0.45)]'
          : 'border border-black/5 bg-white/40',
      )}
    >
      {ours && (
        <div
          className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-emerald-400/15 blur-3xl"
          aria-hidden
        />
      )}

      <div className="relative flex items-center justify-between gap-4">
        <p className={cn('text-lg font-semibold', !ours && 'text-neutral-500')}>
          {ours ? siteConfig.name : 'Other agencies'}
        </p>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium',
            ours ? 'bg-white text-neutral-950' : 'bg-black/5 text-neutral-500',
          )}
        >
          {ours ? 'Paid on results' : 'Paid either way'}
        </span>
      </div>

      <ul className="relative mt-6">
        {promiseComparison.map((row) => (
          <li
            key={row.topic}
            className={cn(
              'flex gap-4 border-t py-4 sm:min-h-[5.25rem]',
              ours ? 'border-white/10' : 'border-black/5',
            )}
          >
            <span
              className={cn(
                'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full',
                ours ? 'bg-emerald-400 text-neutral-950' : 'bg-black/5 text-neutral-400',
              )}
            >
              {ours ? (
                <Check className="size-3.5" strokeWidth={3} aria-hidden />
              ) : (
                <X className="size-3.5" strokeWidth={3} aria-hidden />
              )}
            </span>
            <div>
              <p className="text-xs tracking-[0.12em] text-neutral-400 uppercase">{row.topic}</p>
              <p
                className={cn(
                  'mt-1',
                  ours
                    ? 'font-medium text-white'
                    : 'text-neutral-500 line-through decoration-neutral-300',
                )}
              >
                {ours ? row.muvance : row.others}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
