import { ArrowUpRight, Building2, GraduationCap, HandCoins, Layers } from 'lucide-react';
import { Link } from 'react-router';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/config/site';
import { PageHero, serviceFields } from '@/features/company';
import { CtaSection, Reveal, SectionHeading } from '@/features/landing';
import { usePageMeta } from '@/hooks/use-page-meta';
import { cn } from '@/lib/cn';

const URL = `${siteConfig.url}/about`;

const VALUES = [
  {
    title: 'Results over reports',
    body: 'We are paid on your sales, not on hours or slide decks. So that is what we work on.',
  },
  {
    title: 'Your business, like our own',
    body: 'We treat your money, your brand and your customers the way we would treat ours.',
  },
  {
    title: 'Honest numbers',
    body: 'Delivered orders and profit, not likes and placed orders. Good news and bad, straight away.',
  },
  {
    title: 'No when it won’t work',
    body: 'If ads are not the right move yet, we say so on the first call, even though it costs us a client.',
  },
];

const LINES = [
  {
    to: '/services',
    icon: Layers,
    title: 'Growth agency',
    body: 'Brand, creative, website, ads and operations for eCommerce brands, paid on results.',
  },
  {
    to: '/get-funded',
    icon: HandCoins,
    title: 'Investment',
    body: 'We fund brands with great products and grow them with our whole team.',
  },
  {
    to: '/training',
    icon: GraduationCap,
    title: 'Training',
    body: 'Practical Meta ads training for business owners and media buyers.',
  },
];

const FACTS = [
  { label: 'Name', value: 'Muvance' },
  { label: 'What we are', value: 'eCommerce growth agency and investor' },
  { label: 'Based in', value: 'House 22, Road 1B, Nikunja 2, Khilkhet, Dhaka 1229, Bangladesh' },
  { label: 'Who we work with', value: 'eCommerce brands in Bangladesh' },
  { label: 'Services', value: serviceFields.map((f) => f.title).join(', ') },
  { label: 'How we charge', value: 'Only after you hit an agreed monthly sales target' },
  { label: 'How to reach us', value: 'By appointment: book a free call at muvance.com/book' },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${URL}#page`,
  url: URL,
  name: 'About Muvance',
  isPartOf: { '@id': `${siteConfig.url}/#website` },
  mainEntity: { '@id': `${siteConfig.url}/#organization` },
};

export function AboutPage() {
  usePageMeta({
    title: `About Muvance: an eCommerce growth partner in Dhaka | ${siteConfig.name}`,
    description:
      'Muvance is an eCommerce growth company in Dhaka, Bangladesh. We grow brands with strategy, creative, websites, ads and operations, invest in great products, and only get paid when clients hit their sales target.',
    canonical: URL,
    jsonLd: JSON_LD,
  });

  return (
    <>
      <PageHero
        eyebrow="About Muvance"
        icon={Building2}
        title={
          <>
            Your growth partner, <em>not just another agency.</em>
          </>
        }
        lead="Muvance is an eCommerce growth company based in Dhaka. We help brands grow with strategy, creative, websites, ads and operations, and we only get paid when they hit their sales target."
      />

      {/* Why we exist */}
      <section className="py-16 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeading
            align="left"
            eyebrow="Why we exist"
            title={
              <>
                Agencies get paid <em>either way.</em> We don’t.
              </>
            }
          />
          <Reveal className="space-y-5 text-lg leading-relaxed text-neutral-600">
            <p>
              Most agencies charge a fixed fee every month. If your sales grow, they get paid. If
              your sales fall, they still get paid. The risk sits entirely with you.
            </p>
            <p>
              We think that is backwards. So we agree a sales target with every client, and we do
              not charge a single taka until it is hit.{' '}
              <strong className="font-medium text-neutral-950">We only win when you do.</strong>
            </p>
            <p>
              That one decision shapes everything else. We look at delivered orders and profit, not
              likes. We fix the website and the operations, not just the ads. And we treat your
              business like our own, because in a real sense, it is partly ours too.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* Values */}
      <section className="px-2 sm:px-4">
        <div className="relative overflow-clip rounded-[32px] bg-neutral-950 py-20 text-white sm:rounded-[48px] sm:py-28">
          <div
            className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
            aria-hidden
          />
          <Container className="relative">
            <SectionHeading
              tone="dark"
              eyebrow="What we believe"
              title={
                <>
                  Four rules <em>we work by.</em>
                </>
              }
            />
            <div className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2">
              {VALUES.map((value, i) => (
                <Reveal key={value.title} delay={i * 80} className="bg-neutral-950 p-8 sm:p-10">
                  <span className="font-serif text-5xl text-white/25">0{i + 1}</span>
                  <h3 className="mt-6 font-serif text-3xl">{value.title}</h3>
                  <p className="mt-3 max-w-md leading-relaxed text-neutral-400">{value.body}</p>
                </Reveal>
              ))}
            </div>
          </Container>
        </div>
      </section>

      {/* Three lines of business */}
      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="What we do"
            title={
              <>
                Three ways <em>we grow brands.</em>
              </>
            }
          />
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {LINES.map((line, i) => (
              <Reveal key={line.to} delay={i * 100}>
                <Link
                  to={line.to}
                  className={cn(
                    'group flex h-full flex-col rounded-[28px] border border-white/80 p-7 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)] transition hover:-translate-y-1',
                    i === 0 ? 'bg-neutral-950 text-white' : 'bg-white/70',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <line.icon className="size-7" aria-hidden />
                    <ArrowUpRight
                      className="size-5 opacity-50 transition group-hover:rotate-45 group-hover:opacity-100"
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-10 font-serif text-3xl">{line.title}</h3>
                  <p className={cn('mt-2', i === 0 ? 'text-neutral-400' : 'text-neutral-500')}>
                    {line.body}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* At a glance: plain facts that search engines and AI tools can quote */}
      <section className="pb-8">
        <Container>
          <Reveal className="mx-auto max-w-4xl rounded-[32px] border border-white/80 bg-white/70 p-7 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.3)] sm:p-10">
            <h2 className="font-serif text-4xl">
              Muvance <em>at a glance</em>
            </h2>
            <dl className="mt-8 divide-y divide-black/5">
              {FACTS.map((fact) => (
                <div key={fact.label} className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
                  <dt className="text-sm text-neutral-500">{fact.label}</dt>
                  <dd className="font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </section>

      <CtaSection />
    </>
  );
}
