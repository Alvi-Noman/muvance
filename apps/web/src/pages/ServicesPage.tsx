import { ArrowRight, ArrowUpRight, GraduationCap, HandCoins, Layers } from 'lucide-react';
import { Link } from 'react-router';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/config/site';
import {
  industries,
  howSteps,
  operationsItems,
  PageHero,
  serviceFields,
  ServiceVisual,
} from '@/features/company';
import { CtaSection, Reveal, SectionHeading } from '@/features/landing';
import { useHashScroll } from '@/hooks/use-hash-scroll';
import { usePageMeta } from '@/hooks/use-page-meta';
import { cn } from '@/lib/cn';

const URL = `${siteConfig.url}/services`;

/** The services as structured data, so search and AI tools can list what Muvance offers. */
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${URL}#page`,
      url: URL,
      name: 'Services',
      isPartOf: { '@id': `${siteConfig.url}/#website` },
      about: { '@id': `${siteConfig.url}/#organization` },
    },
    {
      '@type': 'OfferCatalog',
      name: 'Muvance growth services for eCommerce brands',
      itemListElement: serviceFields.map((field) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: field.title,
          description: `${field.promise} ${field.body}`,
          provider: { '@id': `${siteConfig.url}/#organization` },
          areaServed: { '@type': 'Country', name: 'Bangladesh' },
        },
      })),
    },
  ],
};

export function ServicesPage() {
  useHashScroll();
  usePageMeta({
    title: `Services: brand, creative, website, ads and operations | ${siteConfig.name}`,
    description:
      'Muvance grows eCommerce brands end to end: brand strategy, creative production, website and CRO, online advertising and operational support (call centre, warehouse, sourcing and ad credits). Paid only after you hit your sales target.',
    canonical: URL,
    jsonLd: JSON_LD,
  });

  return (
    <>
      <PageHero
        eyebrow="Services"
        icon={Layers}
        title={
          <>
            We grow eCommerce brands, <em>end to end.</em>
          </>
        }
        lead="Most agencies only run your ads. We build the whole engine behind them: the brand, the creative, the store, the ads and the operations that turn orders into delivered sales."
      />

      <WhatWeDo />
      <HowWeDoIt />
      <Fields />
      <Operations />
      <Industries />
      <MoreWays />
      <CtaSection />
    </>
  );
}

/** The plain answer to "what does Muvance do?", in one big sentence. */
function WhatWeDo() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <Reveal className="mx-auto max-w-5xl">
          <p className="text-xs font-medium tracking-[0.14em] text-neutral-500 uppercase">
            What we do
          </p>
          <p className="mt-6 font-serif text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.05] tracking-[-0.01em] text-neutral-400">
            We are a <span className="text-neutral-950">growth partner</span> for eCommerce brands.
            We shape the <span className="text-neutral-950">brand</span>, make the{' '}
            <span className="text-neutral-950">creative</span>, fix the{' '}
            <span className="text-neutral-950">store</span>, run the{' '}
            <span className="text-neutral-950">ads</span> and help run the{' '}
            <span className="text-neutral-950">operations</span>.{' '}
            <em className="text-neutral-950">
              And we only get paid once you hit your sales target.
            </em>
          </p>
        </Reveal>

        <Reveal delay={100} className="mx-auto mt-12 flex max-w-5xl flex-wrap gap-2.5">
          {serviceFields.map((field) => (
            <a
              key={field.id}
              href={`#${field.id}`}
              className="group inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 py-2 pr-4 pl-2 text-sm font-medium backdrop-blur transition hover:border-black/25 hover:bg-white"
            >
              <span
                className={cn('grid size-7 place-items-center rounded-full text-white', field.chip)}
              >
                <field.icon className="size-3.5" aria-hidden />
              </span>
              {field.title}
            </a>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}

function HowWeDoIt() {
  return (
    <section className="px-2 sm:px-4">
      <div className="relative overflow-clip rounded-[32px] bg-neutral-950 py-20 text-white sm:rounded-[48px] sm:py-28">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <Container className="relative">
          <SectionHeading
            tone="dark"
            eyebrow="How we do it"
            title={
              <>
                One team. <em>One target.</em>
              </>
            }
            description="Strategy, creative, store, ads and operations planned together, all pointed at the sales target we agree with you."
          />

          <ol className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {howSteps.map((step, i) => (
              <li key={step.title} className="bg-neutral-950 p-7">
                <Reveal delay={i * 100}>
                  <span className="font-serif text-5xl text-white/25">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-6 text-xl font-medium">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">{step.body}</p>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal className="mt-10 text-center">
            <Link
              to="/how-we-work"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white underline-offset-4 hover:underline"
            >
              See exactly how we work and get paid
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Reveal>
        </Container>
      </div>
    </section>
  );
}

/** The five fields, as cards that stack on top of each other while scrolling on desktop. */
function Fields() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Our fields"
          title={
            <>
              Five fields. <em>Everything growth needs.</em>
            </>
          }
          description="Use one, or all five. They work best together, because every part is planned around the same sales target."
        />

        <div className="mt-16 space-y-6 lg:space-y-10">
          {serviceFields.map((field, i) => (
            <article
              key={field.id}
              id={field.id}
              style={{ top: `${6 + i * 1.25}rem` }}
              className={cn(
                'scroll-mt-28 overflow-hidden rounded-[32px] border border-white/90 bg-gradient-to-br p-3 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] lg:sticky',
                field.tint,
              )}
            >
              <div className="group grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="flex flex-col p-5 sm:p-8">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'grid size-10 place-items-center rounded-xl text-white',
                        field.chip,
                      )}
                    >
                      <field.icon className="size-5" aria-hidden />
                    </span>
                    <span className="font-serif text-2xl text-neutral-400">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-6 font-serif text-[clamp(2.25rem,4vw,3.25rem)] leading-none tracking-[-0.01em]">
                    {field.title}
                  </h3>
                  <p className="mt-3 text-lg font-medium text-neutral-800">{field.promise}</p>
                  <p className="mt-3 leading-relaxed text-neutral-600">{field.body}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {field.includes.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-black/5 bg-white/80 px-3 py-1.5 text-sm text-neutral-700"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative min-h-72 overflow-hidden rounded-[24px] border border-black/5 bg-canvas">
                  <ServiceVisual id={field.id} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Operations() {
  return (
    <section className="pb-20 sm:pb-28">
      <Container>
        <SectionHeading
          eyebrow="Operational support, up close"
          title={
            <>
              More orders <em>actually delivered.</em>
            </>
          }
          description="The work most agencies leave to you. We help with it, because an order that never arrives is not a sale."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {operationsItems.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 80}
              className="group rounded-[28px] border border-white/80 bg-white/70 p-6 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)] transition hover:-translate-y-1 hover:bg-white"
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-neutral-950 text-white transition group-hover:rotate-6">
                <item.icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-6 text-lg font-medium">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{item.body}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function Industries() {
  return (
    <section className="pb-20 sm:pb-28">
      <Container>
        <SectionHeading
          eyebrow="Industries"
          title={
            <>
              Built for <em>how your category sells.</em>
            </>
          }
          description="Every category has its own doubts, rules and margins. See how we approach yours."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry, i) => (
            <Reveal key={industry.slug} delay={(i % 3) * 80}>
              <Link
                to={`/services/${industry.slug}`}
                className={cn(
                  'group flex h-full flex-col rounded-[28px] border border-white/80 bg-gradient-to-br p-6 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)] transition hover:-translate-y-1',
                  industry.tint,
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl bg-white/90 shadow-sm">
                    <industry.icon className="size-5" aria-hidden />
                  </span>
                  <span className="grid size-9 place-items-center rounded-full bg-neutral-950 text-white transition group-hover:rotate-45">
                    <ArrowUpRight className="size-4" aria-hidden />
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-medium">{industry.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{industry.lead}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

function MoreWays() {
  const cards = [
    {
      to: '/get-funded',
      icon: HandCoins,
      eyebrow: 'We invest',
      title: 'Got a great product? We may invest.',
      body: 'We fund promising brands and grow them with our whole team behind them.',
      tone: 'bg-neutral-950 text-white',
      muted: 'text-neutral-400',
    },
    {
      to: '/training',
      icon: GraduationCap,
      eyebrow: 'Training program',
      title: 'Learn Meta ads from the people running them.',
      body: 'Practical training for business owners and media buyers.',
      tone: 'bg-white/80 text-neutral-950 border border-white',
      muted: 'text-neutral-500',
    },
  ];
  return (
    <section className="pb-20 sm:pb-28">
      <Container className="grid gap-4 md:grid-cols-2">
        {cards.map((card, i) => (
          <Reveal key={card.to} delay={i * 100}>
            <Link
              to={card.to}
              className={cn(
                'group relative flex h-full flex-col overflow-hidden rounded-[32px] p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.4)] transition hover:-translate-y-1 sm:p-10',
                card.tone,
              )}
            >
              <card.icon className="size-8" aria-hidden />
              <p className={cn('mt-8 text-xs tracking-[0.14em] uppercase', card.muted)}>
                {card.eyebrow}
              </p>
              <h3 className="mt-2 font-serif text-4xl leading-tight">{card.title}</h3>
              <p className={cn('mt-3', card.muted)}>{card.body}</p>
              <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium">
                Learn more
                <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          </Reveal>
        ))}
      </Container>
    </section>
  );
}
