import { Check, Handshake, Quote, X } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/config/site';
import { Faq, faqJsonLd, PageHero, type FaqItem } from '@/features/company';
import { CtaSection, Reveal, SectionHeading } from '@/features/landing';
import { usePageMeta } from '@/hooks/use-page-meta';
import { cn } from '@/lib/cn';

const URL = `${siteConfig.url}/how-we-work`;

/** Short enough to be quoted whole by a search engine or AI tool. */
const ONE_LINER =
  'Muvance is a performance-based eCommerce growth agency in Dhaka, Bangladesh. We agree a monthly sales target with each client, charge nothing until it is reached, and only then take a small share of sales or net profit. No retainers, no setup fees, no advance payments.';

const STEPS = [
  {
    title: 'Discovery call',
    body: 'A free 30-minute call about your business, website and products: what you sell, how it sells today and where you want to be in six months.',
  },
  {
    title: 'We study your numbers',
    body: 'Revenue, margins, ad costs and goals. We work out what is realistic, and tell you honestly if ads are not the right move yet.',
  },
  {
    title: 'Proposal: target and share',
    body: 'We propose a monthly sales target and the share we would take once you hit it. You decide, with no pressure and no deposit.',
  },
  {
    title: 'Build and launch',
    body: 'Tracking, creative, store fixes and campaigns go live. You see what we see, with live reporting.',
  },
  {
    title: 'Paid on results',
    body: 'Each month, if the target is hit, we get our share. If it is not, you owe us nothing for that month.',
  },
];

const COMPARISON = [
  { topic: 'When you pay', others: 'Every month, upfront', us: 'Only after you hit the target' },
  { topic: 'Setup fee', others: 'Often', us: 'None' },
  { topic: 'If sales fall short', others: 'You still pay in full', us: 'You owe us nothing' },
  { topic: 'Long contract', others: 'Usually 3–12 months', us: 'No lock-in' },
  { topic: 'What they are paid for', others: 'Hours, reports, ad spend', us: 'Your sales' },
];

const GOOD_FIT = [
  'You already sell a product people want',
  'Your margins can carry the cost of ads',
  'You can pack and deliver more orders',
  'You are happy to share real sales numbers',
];
const NOT_A_FIT = [
  'You do not have a product to sell yet',
  'Margins are too thin to pay for ads',
  'You only want posts boosted',
  'You would rather not share sales data',
];

const FAQS: FaqItem[] = [
  {
    question: 'How does Muvance charge?',
    answer:
      'Only on results. We agree a monthly sales target together before we start. You pay nothing until you hit it. After that, we take a small percentage of your sales or net profit. No retainers, no setup fees, no advance payments.',
  },
  {
    question: 'What happens if we do not hit the target?',
    answer:
      'You owe us nothing for that month. That is the point of the model: we carry the risk, so we are as motivated as you are to hit it.',
  },
  {
    question: 'How is the sales target set?',
    answer:
      'From your real numbers: current sales, margins, ad costs and your six-month goal. We agree how sales are measured (for example, delivered orders) in the proposal, so there are no surprises.',
  },
  {
    question: 'Is the ad spend included in your fee?',
    answer:
      'No. Ad spend is paid to Meta and is separate from our share. If cash flow is tight, ask us about ad credits, where we can front part of the spend.',
  },
  {
    question: 'Why would an agency take that risk?',
    answer:
      'Because it filters for brands we can genuinely grow, and it keeps us honest. We only say yes when we believe the numbers work, and we only earn when you do.',
  },
  {
    question: 'Do I have to sign a long contract?',
    answer: 'No. We keep clients by delivering results, not by locking them in.',
  },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${URL}#page`,
      url: URL,
      name: 'How Muvance works and gets paid',
      description: ONE_LINER,
      isPartOf: { '@id': `${siteConfig.url}/#website` },
      about: { '@id': `${siteConfig.url}/#organization` },
    },
    faqJsonLd(FAQS),
  ],
};

export function HowWeWorkPage() {
  usePageMeta({
    title: `How we work: paid only after you hit your sales target | ${siteConfig.name}`,
    description:
      'How Muvance works: a free discovery call, a sales target agreed together, and no fees until you hit it. No retainers, no setup fees, no advance payments.',
    canonical: URL,
    jsonLd: JSON_LD,
  });

  return (
    <>
      <PageHero
        eyebrow="How we work"
        icon={Handshake}
        title={
          <>
            Paid on results. <em>Here’s exactly how.</em>
          </>
        }
        lead="No retainers, no setup fees, no advance payments. We agree a monthly sales target with you, and we only get paid once you hit it."
      />

      {/* The quotable summary */}
      <section className="pb-16 sm:pb-24">
        <Container>
          <Reveal className="relative mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-white/80 bg-white/70 p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] sm:p-12">
            <Quote className="size-8 text-neutral-300" aria-hidden />
            <p className="mt-4 text-xs font-medium tracking-[0.14em] text-neutral-500 uppercase">
              In one paragraph
            </p>
            <p className="mt-3 font-serif text-[clamp(1.6rem,3.2vw,2.4rem)] leading-tight">
              {ONE_LINER}
            </p>
          </Reveal>
        </Container>
      </section>

      <TargetChart />

      {/* Steps */}
      <section className="py-20 sm:py-28">
        <Container className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeading
            align="left"
            eyebrow="Step by step"
            title={
              <>
                From first call <em>to first payment.</em>
              </>
            }
            description="Five steps, and you only pay at the last one, if the target is hit."
            className="lg:sticky lg:top-28 lg:self-start"
          />
          <ol className="relative space-y-4 before:absolute before:top-6 before:bottom-6 before:left-[1.75rem] before:w-px before:bg-gradient-to-b before:from-neutral-300 before:to-transparent">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 80}>
                <li className="relative flex gap-5 rounded-3xl border border-white/80 bg-white/70 p-5 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.2)] sm:p-6">
                  <span
                    className={cn(
                      'relative z-10 grid size-8 shrink-0 place-items-center rounded-full text-sm font-medium',
                      i === STEPS.length - 1
                        ? 'bg-emerald-500 text-white'
                        : 'bg-neutral-950 text-white',
                    )}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium">{step.title}</h3>
                    <p className="mt-1.5 leading-relaxed text-neutral-500">{step.body}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      <Comparison />
      <Fit />
      <Faq
        items={FAQS}
        title={
          <>
            How we get paid, <em>answered.</em>
          </>
        }
      />
      <CtaSection />
    </>
  );
}

/** Months as bars against the target line: the fee only exists in months that clear it. */
function TargetChart() {
  const months = [
    { label: 'M1', value: 52 },
    { label: 'M2', value: 64 },
    { label: 'M3', value: 78 },
    { label: 'M4', value: 88 },
    { label: 'M5', value: 96 },
    { label: 'M6', value: 104 },
  ];
  const target = 80;
  return (
    <section className="px-2 sm:px-4">
      <div className="relative overflow-clip rounded-[32px] bg-neutral-950 py-20 text-white sm:rounded-[48px] sm:py-28">
        <Container className="relative grid items-center gap-14 lg:grid-cols-2">
          <SectionHeading
            tone="dark"
            align="left"
            eyebrow="The model, drawn"
            title={
              <>
                Below the line, <em>you pay nothing.</em>
              </>
            }
            description="Each bar is a month of sales. The dashed line is the target we agree together. Only months that clear it earn us a share."
          />
          <Reveal>
            <figure>
              <div
                className="relative h-72 rounded-3xl border border-white/10 bg-white/[0.03] px-4 pt-6 pb-10 sm:px-8"
                role="img"
                aria-label="Illustration: six months of sales rising past a target line. In months below the target the fee is zero; in months above it a small share is paid."
              >
                <div className="relative flex h-full items-end gap-3 sm:gap-5">
                  <div
                    className="absolute inset-x-0 border-t-2 border-dashed border-amber-300/80"
                    style={{ bottom: `${(target / 110) * 100}%` }}
                  >
                    <span className="absolute -top-7 right-0 rounded-full bg-amber-300 px-2.5 py-0.5 text-xs font-medium text-neutral-950">
                      Target
                    </span>
                  </div>
                  {months.map((m) => {
                    const hit = m.value >= target;
                    return (
                      <div
                        key={m.label}
                        className="relative flex h-full flex-1 flex-col justify-end"
                      >
                        <div
                          style={{ height: `${(m.value / 110) * 100}%` }}
                          className={cn(
                            'rounded-t-xl transition',
                            hit ? 'bg-emerald-400' : 'bg-white/20',
                          )}
                        />
                        <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-neutral-500">
                          {m.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <figcaption className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-400">
                <span className="flex items-center gap-2">
                  <span className="size-3 rounded-sm bg-white/20" /> Below target: ৳0 fee
                </span>
                <span className="flex items-center gap-2">
                  <span className="size-3 rounded-sm bg-emerald-400" /> Target hit: a small share
                </span>
                <span className="text-neutral-500">Illustration, not a real account.</span>
              </figcaption>
            </figure>
          </Reveal>
        </Container>
      </div>
    </section>
  );
}

function Comparison() {
  return (
    <section className="pb-20 sm:pb-28">
      <Container>
        <SectionHeading
          eyebrow="Compared"
          title={
            <>
              A typical agency <em>vs Muvance.</em>
            </>
          }
        />
        <Reveal className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-[32px] border border-white/80 bg-white/70 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.3)]">
          <div className="hidden grid-cols-[1fr_1fr_1fr] border-b border-black/5 px-5 py-4 sm:grid text-xs tracking-[0.14em] text-neutral-500 uppercase sm:px-8">
            <span />
            <span>Typical agency</span>
            <span className="text-neutral-950">Muvance</span>
          </div>
          <dl>
            {COMPARISON.map((row) => (
              <div
                key={row.topic}
                className="grid grid-cols-1 gap-2 border-b border-black/5 px-5 py-5 last:border-0 sm:grid-cols-[1fr_1fr_1fr] sm:items-center sm:px-8"
              >
                <dt className="font-medium">{row.topic}</dt>
                <dd className="flex items-center gap-2 text-neutral-500">
                  <X className="size-4 shrink-0 text-red-400" aria-hidden />
                  <span className="sr-only">Typical agency: </span>
                  {row.others}
                </dd>
                <dd className="flex items-center gap-2 font-medium">
                  <Check className="size-4 shrink-0 text-emerald-500" aria-hidden />
                  <span className="sr-only">Muvance: </span>
                  {row.us}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}

function Fit() {
  return (
    <section className="pb-8">
      <Container>
        <SectionHeading
          eyebrow="Honestly"
          title={
            <>
              Who this <em>works for.</em>
            </>
          }
          description="Because we only earn when you grow, we say no when the numbers do not work. That saves us both time."
        />
        <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-2">
          {[
            { title: 'A good fit', items: GOOD_FIT, good: true },
            { title: 'Not a fit (yet)', items: NOT_A_FIT, good: false },
          ].map((column, i) => (
            <Reveal
              key={column.title}
              delay={i * 100}
              className={cn(
                'rounded-[28px] border p-7 sm:p-8',
                column.good
                  ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'
                  : 'border-black/5 bg-white/60',
              )}
            >
              <h3 className="text-lg font-medium">{column.title}</h3>
              <ul className="mt-5 space-y-3">
                {column.items.map((item) => (
                  <li key={item} className="flex gap-3 text-neutral-700">
                    {column.good ? (
                      <Check className="mt-0.5 size-5 shrink-0 text-emerald-500" aria-hidden />
                    ) : (
                      <X className="mt-0.5 size-5 shrink-0 text-neutral-400" aria-hidden />
                    )}
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
