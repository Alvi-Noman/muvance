import {
  ArrowDown,
  Banknote,
  Boxes,
  HandCoins,
  Rocket,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  investmentApplicationSchema,
  investmentNeedLabels,
  investmentNeeds,
} from '@muvance/shared';
import { buttonStyles } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { siteConfig } from '@/config/site';
import {
  ApplicationForm,
  ChoiceField,
  Faq,
  faqJsonLd,
  PageHero,
  TextAreaField,
  TextField,
  type FaqItem,
} from '@/features/company';
import { Reveal, SectionHeading } from '@/features/landing';
import { usePageMeta } from '@/hooks/use-page-meta';
import { cn } from '@/lib/cn';

const URL = `${siteConfig.url}/get-funded`;

const BRINGS = [
  {
    icon: Banknote,
    title: 'Capital',
    body: 'Money for stock, production and ad spend, so growth is not limited by cash flow.',
  },
  {
    icon: Users,
    title: 'A full team',
    body: 'Brand strategy, creative, website, ads and operations, working on your brand from day one.',
  },
  {
    icon: Boxes,
    title: 'Operations',
    body: 'Call centre, warehouse and sourcing support, so more orders turn into delivered sales.',
  },
];

const LOOK_FOR = [
  {
    title: 'A product people love',
    body: 'Customers who come back, recommend it and leave real reviews.',
  },
  {
    title: 'Healthy margins',
    body: 'Enough room to pay for ads, delivery and returns, and still make money.',
  },
  {
    title: 'Room to grow online',
    body: 'A product that can sell to many more people through ads and a good store.',
  },
  {
    title: 'A founder who is all in',
    body: 'Someone who knows the product deeply and wants to build for the long run.',
  },
];

const STEPS = [
  {
    icon: Sparkles,
    title: 'Apply',
    body: 'Tell us about your product. It takes about five minutes.',
  },
  {
    icon: Search,
    title: 'We take a look',
    body: 'If it fits, we call you and go through the product and the numbers.',
  },
  {
    icon: HandCoins,
    title: 'Agree the terms',
    body: 'Every deal is different. We shape the structure together.',
  },
  {
    icon: Rocket,
    title: 'Grow together',
    body: 'Capital and our whole team go to work on your brand.',
  },
];

const FAQS: FaqItem[] = [
  {
    question: 'Does Muvance invest in small businesses?',
    answer:
      'Yes. Investing in promising brands is one of the main things we do. Size matters less than the product: if customers love it and the margins work, we want to hear from you.',
  },
  {
    question: 'Do I need sales already?',
    answer:
      'It helps a lot. Real customers and a few months of sales show the product works. If you are earlier than that, apply anyway and tell us what you have learned so far.',
  },
  {
    question: 'What kind of deal do you offer?',
    answer:
      'There is no single template. Once we understand your product and numbers, we agree the structure and terms together, so they fit your business.',
  },
  {
    question: 'Do you only give money?',
    answer:
      'No. Brands we invest in get our whole team: brand strategy, creative, website, ads and operational support. That is usually worth as much as the money.',
  },
  {
    question: 'Is my information kept private?',
    answer:
      'Yes. We only use what you send to assess the opportunity and get back to you. We never share it.',
  },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${URL}#page`,
      url: URL,
      name: 'Apply for investment from Muvance',
      isPartOf: { '@id': `${siteConfig.url}/#website` },
      about: { '@id': `${siteConfig.url}/#organization` },
    },
    faqJsonLd(FAQS),
  ],
};

export function InvestPage() {
  usePageMeta({
    title: `We invest in great products: apply for funding | ${siteConfig.name}`,
    description:
      'Muvance invests in eCommerce brands with great products in Bangladesh: capital for stock and ads, plus a full team for brand, creative, website, ads and operations. Apply in five minutes.',
    canonical: URL,
    jsonLd: JSON_LD,
  });

  return (
    <>
      <PageHero
        eyebrow="We invest"
        icon={HandCoins}
        title={
          <>
            Great product? <em>We’ll help fund it.</em>
          </>
        }
        lead="Investing in brands is one of the main things we do. If you have a product people love, we can put money behind it, and our whole team behind the money."
        actions={
          <a href="#apply" className={buttonStyles({ size: 'lg' })}>
            Apply for investment
            <ArrowDown
              className="size-4 transition-transform group-hover:translate-y-0.5"
              aria-hidden
            />
          </a>
        }
      />

      {/* What we bring */}
      <section className="pb-20 sm:pb-28">
        <Container>
          <div className="grid gap-4 md:grid-cols-3">
            {BRINGS.map((item, i) => (
              <Reveal
                key={item.title}
                delay={i * 100}
                className={cn(
                  'rounded-[28px] p-7 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)] sm:p-8',
                  i === 0 ? 'bg-neutral-950 text-white' : 'border border-white/80 bg-white/70',
                )}
              >
                <item.icon className="size-7" aria-hidden />
                <h3 className="mt-10 font-serif text-3xl">{item.title}</h3>
                <p className={cn('mt-2', i === 0 ? 'text-neutral-400' : 'text-neutral-500')}>
                  {item.body}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* What we look for */}
      <section className="pb-20 sm:pb-28">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeading
            align="left"
            eyebrow="What we look for"
            title={
              <>
                The product <em>comes first.</em>
              </>
            }
            description="We back products before we back pitches. These are the things that matter most to us."
            className="lg:sticky lg:top-28 lg:self-start"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {LOOK_FOR.map((item, i) => (
              <Reveal
                key={item.title}
                delay={(i % 2) * 100}
                className="rounded-[28px] border border-white/80 bg-gradient-to-br from-white to-amber-50/60 p-7 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)]"
              >
                <span className="font-serif text-4xl text-neutral-300">0{i + 1}</span>
                <h3 className="mt-4 text-lg font-medium">{item.title}</h3>
                <p className="mt-1.5 text-neutral-500">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="px-2 sm:px-4">
        <div className="relative overflow-clip rounded-[32px] bg-neutral-950 py-20 text-white sm:rounded-[48px] sm:py-28">
          <div
            className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-amber-200/15 blur-3xl"
            aria-hidden
          />
          <Container className="relative">
            <SectionHeading
              tone="dark"
              eyebrow="How it works"
              title={
                <>
                  From application <em>to growing together.</em>
                </>
              }
            />
            <ol className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <Reveal key={step.title} delay={i * 100}>
                  <li className="h-full rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                    <div className="flex items-center justify-between">
                      <step.icon className="size-6" aria-hidden />
                      <span className="font-serif text-3xl text-white/25">0{i + 1}</span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{step.body}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </Container>
        </div>
      </section>

      {/* The application */}
      <section id="apply" className="scroll-mt-20 py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="Apply"
            title={
              <>
                Tell us about <em>your product.</em>
              </>
            }
            description="About five minutes. We read every application, and call you if it looks like a fit."
          />
          <Reveal className="mx-auto mt-12 max-w-3xl rounded-[32px] border border-white/80 bg-white/70 p-6 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.35)] backdrop-blur sm:p-10">
            <ApplicationForm
              type="investment"
              schema={investmentApplicationSchema}
              multiValueFields={['needs']}
              submitLabel="Send application"
              success={{
                title: 'Application received.',
                body: 'Thank you. We read every application carefully, and we will call you if your product looks like a fit.',
              }}
            >
              {(errors) => (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextField
                      name="name"
                      label="Your name"
                      autoComplete="name"
                      error={errors.name}
                    />
                    <TextField
                      name="phone"
                      label="Phone number"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+880 1XXX-XXXXXX"
                      error={errors.phone}
                    />
                    <TextField
                      name="businessName"
                      label="Brand name"
                      autoComplete="organization"
                      error={errors.businessName}
                    />
                    <TextField
                      name="website"
                      label="Website or Facebook page"
                      inputMode="url"
                      placeholder="yourbrand.com"
                      error={errors.website}
                    />
                    <TextField
                      name="category"
                      label="What kind of product?"
                      placeholder="e.g. Skincare, clothing, organic food"
                      error={errors.category}
                    />
                    <TextField
                      name="sellingSince"
                      label="Selling since"
                      placeholder="e.g. March 2024, or not yet"
                      error={errors.sellingSince}
                    />
                    <TextField
                      name="monthlySales"
                      label="Average monthly sales"
                      placeholder="e.g. 5 lac, or 0"
                      suffix="Taka"
                      wrapperClassName="sm:col-span-2"
                      error={errors.monthlySales}
                    />
                  </div>
                  <TextAreaField
                    name="product"
                    label="What makes your product special?"
                    hint="Who buys it, why they love it, and anything that shows it (reorders, reviews)."
                    error={errors.product}
                  />
                  <ChoiceField
                    name="needs"
                    multiple
                    label="Where do you need the most help?"
                    hint="Pick all that apply."
                    options={investmentNeeds.map((need) => ({
                      value: need,
                      label: investmentNeedLabels[need],
                    }))}
                    error={errors.needs}
                  />
                  <TextAreaField
                    name="message"
                    label="Anything else we should know?"
                    optional
                    rows={3}
                    error={errors.message}
                  />
                </>
              )}
            </ApplicationForm>
          </Reveal>
        </Container>
      </section>

      <Faq
        items={FAQS}
        title={
          <>
            Investing, <em>answered.</em>
          </>
        }
      />
    </>
  );
}
