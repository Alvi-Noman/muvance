import { useMemo } from 'react';
import { ArrowRight, ArrowUpRight, ChevronRight, Lightbulb } from 'lucide-react';
import { Link, useParams } from 'react-router';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/config/site';
import { posts, PostCover } from '@/features/blog';
import {
  Faq,
  faqJsonLd,
  findIndustry,
  industries,
  PageHero,
  type Industry,
} from '@/features/company';
import { CtaSection, Reveal, SectionHeading } from '@/features/landing';
import { usePageMeta } from '@/hooks/use-page-meta';
import { cn } from '@/lib/cn';
import { NotFoundPage } from './NotFoundPage';

/** /services/<industry>: how Muvance grows one kind of store. */
export function IndustryPage() {
  const industry = findIndustry(useParams().slug);
  if (!industry) return <NotFoundPage />;
  // Keyed so every hook starts fresh when moving between industries.
  return <IndustryContent key={industry.slug} industry={industry} />;
}

function IndustryContent({ industry }: { industry: Industry }) {
  const url = `${siteConfig.url}/services/${industry.slug}`;
  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Service',
          '@id': `${url}#service`,
          name: industry.title,
          description: industry.description,
          serviceType: 'eCommerce growth and Meta advertising',
          url,
          provider: { '@id': `${siteConfig.url}/#organization` },
          areaServed: { '@type': 'Country', name: 'Bangladesh' },
          audience: { '@type': 'BusinessAudience', name: industry.audience },
        },
        faqJsonLd(industry.faqs),
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteConfig.url}/` },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Services',
              item: `${siteConfig.url}/services`,
            },
            { '@type': 'ListItem', position: 3, name: industry.name, item: url },
          ],
        },
      ],
    }),
    [industry, url],
  );
  usePageMeta({
    title: `${industry.title} | ${siteConfig.name}`,
    description: industry.description,
    canonical: url,
    jsonLd,
  });

  const related = industry.related
    .map((slug) => posts.find((p) => p.slug === slug))
    .filter((p) => p !== undefined);
  const others = industries.filter((i) => i.slug !== industry.slug);

  return (
    <>
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-neutral-500">
          <li>
            <Link to="/services" className="hover:text-neutral-950">
              Services
            </Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden />
          <li aria-current="page" className="text-neutral-800">
            {industry.name}
          </li>
        </ol>
      </nav>

      <PageHero
        eyebrow={industry.name}
        icon={industry.icon}
        title={
          <>
            Meta ads for {industry.audience} <em>{industry.accent}</em>
          </>
        }
        lead={industry.lead}
        className="pt-6 sm:pt-10"
      />

      {/* The challenges */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="What makes it hard"
            title={
              <>
                Selling {industry.name.toLowerCase()} online <em>is its own game.</em>
              </>
            }
          />
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {industry.challenges.map((challenge, i) => (
              <Reveal
                key={challenge.title}
                delay={i * 100}
                className="rounded-[28px] border border-white/80 bg-white/70 p-7 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)]"
              >
                <span className="font-serif text-5xl text-neutral-300">0{i + 1}</span>
                <h3 className="mt-5 text-xl font-medium">{challenge.title}</h3>
                <p className="mt-2 leading-relaxed text-neutral-500">{challenge.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* The playbook */}
      <section className="px-2 sm:px-4">
        <div className="relative overflow-clip rounded-[32px] bg-neutral-950 py-20 text-white sm:rounded-[48px] sm:py-28">
          <div
            className={cn(
              'pointer-events-none absolute -top-48 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-r opacity-25 blur-3xl',
              industry.tint,
            )}
            aria-hidden
          />
          <Container className="relative grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <SectionHeading
              tone="dark"
              align="left"
              eyebrow="Our playbook"
              title={
                <>
                  How we grow <em>{industry.audience}.</em>
                </>
              }
              description="The same five fields we use for every client (brand, creative, store, ads and operations), tuned to how your category sells."
              className="lg:sticky lg:top-28 lg:self-start"
            />
            <ol className="space-y-4">
              {industry.playbook.map((step, i) => (
                <Reveal key={step.title} delay={i * 80}>
                  <li className="flex gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-white/20 font-serif text-lg">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-medium">{step.title}</h3>
                      <p className="mt-1.5 leading-relaxed text-neutral-400">{step.body}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </Container>
        </div>
      </section>

      {/* Creative angles and the numbers we watch */}
      <section className="py-20 sm:py-28">
        <Container className="grid gap-6 lg:grid-cols-2">
          <Reveal
            className={cn(
              'rounded-[32px] border border-white/80 bg-gradient-to-br p-7 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)] sm:p-10',
              industry.tint,
            )}
          >
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-neutral-950 text-white">
                <Lightbulb className="size-5" aria-hidden />
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl">Creative angles that work</h2>
            </div>
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {industry.angles.map((angle) => (
                <li
                  key={angle}
                  className="rounded-full border border-white bg-white/80 px-4 py-2 text-sm font-medium shadow-sm"
                >
                  {angle}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal
            delay={100}
            className="rounded-[32px] border border-white/80 bg-white/70 p-7 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)] sm:p-10"
          >
            <h2 className="font-serif text-3xl sm:text-4xl">The numbers we watch</h2>
            <dl className="mt-8 divide-y divide-black/5">
              {industry.metrics.map((metric) => (
                <div
                  key={metric.name}
                  className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6"
                >
                  <dt className="font-medium">{metric.name}</dt>
                  <dd className="text-neutral-500">{metric.why}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </section>

      <Faq
        items={industry.faqs}
        title={
          <>
            {industry.name}, <em>answered.</em>
          </>
        }
      />

      {related.length > 0 && (
        <section className="pb-20 sm:pb-28">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-serif text-4xl sm:text-5xl">
                Worth <em>reading next</em>
              </h2>
              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
              >
                All guides <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {related.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  onMouseEnter={post.preload}
                  className="group overflow-hidden rounded-[28px] border border-white/80 bg-white/70 p-2.5 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)] transition hover:-translate-y-1"
                >
                  <PostCover post={post} className="aspect-[16/9] rounded-[20px]" />
                  <div className="p-4">
                    <p className="text-xs tracking-[0.14em] text-neutral-500 uppercase">
                      {post.category}
                    </p>
                    <h3 className="mt-2 font-medium leading-snug">{post.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="pb-20 sm:pb-28">
        <Container>
          <p className="text-xs tracking-[0.14em] text-neutral-500 uppercase">Other industries</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {others.map((other) => (
              <Link
                key={other.slug}
                to={`/services/${other.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium transition hover:bg-white"
              >
                <other.icon className="size-4" aria-hidden />
                {other.name}
                <ArrowUpRight className="size-3.5 text-neutral-400" aria-hidden />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <CtaSection />
    </>
  );
}
