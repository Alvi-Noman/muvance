import {
  ArrowDown,
  BarChart3,
  Briefcase,
  Clapperboard,
  GraduationCap,
  Layers3,
  Megaphone,
  Rocket,
  Sprout,
  Store,
  Truck,
  Users,
} from 'lucide-react';
import {
  trainingApplicationSchema,
  trainingLevelLabels,
  trainingLevels,
  trainingRoleLabels,
  trainingRoles,
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

const URL = `${siteConfig.url}/training`;

const AUDIENCES = [
  {
    icon: Store,
    title: 'Business owners',
    body: 'Understand your ads well enough to run them, or to manage whoever does.',
  },
  {
    icon: Briefcase,
    title: 'Media buyers',
    body: 'Sharpen structure, testing and scaling for clients who expect profit.',
  },
  {
    icon: Users,
    title: 'Marketing teams',
    body: 'Get your whole team using the same playbook and the same numbers.',
  },
  {
    icon: Sprout,
    title: 'Starting out',
    body: 'Build a real skill from the ground up, with the basics done right.',
  },
];

const MODULES = [
  {
    icon: Layers3,
    title: 'Tracking that tells the truth',
    body: 'Pixel and Conversions API, event match quality, and why Ads Manager and your store disagree.',
  },
  {
    icon: Megaphone,
    title: 'Campaign structure today',
    body: 'How Meta’s delivery system works now, broad targeting, Advantage+ and how many ads per ad set.',
  },
  {
    icon: Clapperboard,
    title: 'Creative that sells',
    body: 'Hooks, hold rate, UGC vs studio vs AI, and a weekly testing system you can actually keep up.',
  },
  {
    icon: Rocket,
    title: 'Scaling without breaking it',
    body: 'When and how to raise budgets, CBO vs ABO, and what to do when costs start rising.',
  },
  {
    icon: BarChart3,
    title: 'Numbers that matter',
    body: 'Break-even ROAS, MER, attribution windows and reading results like an owner, not a platform.',
  },
  {
    icon: Truck,
    title: 'Selling in Bangladesh',
    body: 'Cash on delivery, fake orders, delivered-order optimisation, Bangla copy and the seasonal calendar.',
  },
];

const FAQS: FaqItem[] = [
  {
    question: 'Who teaches the Muvance training program?',
    answer:
      'The people who run campaigns at Muvance every day. The lessons come from the same accounts, creative tests and store fixes we work on for clients.',
  },
  {
    question: 'Do I need experience with Facebook ads?',
    answer:
      'No. Tell us your level when you register and we will point you to the right batch, whether you have never run an ad or you run them every week.',
  },
  {
    question: 'When is the next batch, and how much does it cost?',
    answer:
      'Register your interest and we will call you with the next batch dates, the format and the fee.',
  },
  {
    question: 'Is the training about Bangladesh specifically?',
    answer:
      'It covers Meta ads in general, with a strong focus on selling in Bangladesh: cash on delivery, fake orders, local creative and the seasonal calendar.',
  },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Course',
      '@id': `${URL}#course`,
      name: 'Meta ads training program',
      description:
        'Practical Meta (Facebook and Instagram) ads training for business owners, media buyers and marketers in Bangladesh: tracking, campaign structure, creative testing, scaling and reading the numbers.',
      url: URL,
      provider: { '@id': `${siteConfig.url}/#organization` },
      inLanguage: ['en', 'bn'],
      teaches: MODULES.map((m) => m.title),
    },
    faqJsonLd(FAQS),
  ],
};

export function TrainingPage() {
  usePageMeta({
    title: `Meta ads training program in Bangladesh | ${siteConfig.name}`,
    description:
      'Learn Meta ads from the team that runs them every day: tracking, campaign structure, creative testing, scaling and selling in Bangladesh. For owners, media buyers and marketers.',
    canonical: URL,
    jsonLd: JSON_LD,
  });

  return (
    <>
      <PageHero
        eyebrow="Training program"
        icon={GraduationCap}
        title={
          <>
            Learn Meta ads <em>from people who run them daily.</em>
          </>
        }
        lead="Practical training built on the campaigns, creative tests and store fixes we work on every week. No theory you cannot use tomorrow."
        actions={
          <a href="#register" className={buttonStyles({ size: 'lg' })}>
            Register your interest
            <ArrowDown
              className="size-4 transition-transform group-hover:translate-y-0.5"
              aria-hidden
            />
          </a>
        }
      />

      {/* Who it's for */}
      <section className="pb-20 sm:pb-28">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((item, i) => (
              <Reveal
                key={item.title}
                delay={i * 80}
                className="rounded-[28px] border border-white/80 bg-white/70 p-6 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)]"
              >
                <span className="grid size-11 place-items-center rounded-2xl bg-neutral-950 text-white">
                  <item.icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-6 text-lg font-medium">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* What you'll learn */}
      <section className="px-2 sm:px-4">
        <div className="relative overflow-clip rounded-[32px] bg-neutral-950 py-20 text-white sm:rounded-[48px] sm:py-28">
          <div
            className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-violet-300/15 blur-3xl"
            aria-hidden
          />
          <Container className="relative">
            <SectionHeading
              tone="dark"
              eyebrow="What you’ll learn"
              title={
                <>
                  Six modules. <em>All of it practical.</em>
                </>
              }
              description="The same topics our team works through for clients every week."
            />
            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MODULES.map((module, i) => (
                <Reveal
                  key={module.title}
                  delay={(i % 3) * 100}
                  className={cn(
                    'group rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition hover:bg-white/[0.07]',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <module.icon className="size-6" aria-hidden />
                    <span className="text-xs tracking-[0.14em] text-neutral-500 uppercase">
                      Module {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-8 font-serif text-2xl">{module.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">{module.body}</p>
                </Reveal>
              ))}
            </div>
          </Container>
        </div>
      </section>

      {/* Register */}
      <section id="register" className="scroll-mt-20 py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="Register"
            title={
              <>
                Save your seat <em>for the next batch.</em>
              </>
            }
            description="One minute. We call you with dates, format and fees. No payment now."
          />
          <Reveal className="mx-auto mt-12 max-w-2xl rounded-[32px] border border-white/80 bg-white/70 p-6 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.35)] backdrop-blur sm:p-10">
            <ApplicationForm
              type="training"
              schema={trainingApplicationSchema}
              submitLabel="Register interest"
              success={{
                title: 'You’re on the list.',
                body: 'Thank you. We will call you with the next batch dates, the format and the fee.',
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
                  </div>
                  <ChoiceField
                    name="role"
                    label="Which sounds most like you?"
                    options={trainingRoles.map((role) => ({
                      value: role,
                      label: trainingRoleLabels[role],
                    }))}
                    error={errors.role}
                  />
                  <ChoiceField
                    name="level"
                    label="Your experience with Meta ads"
                    options={trainingLevels.map((level) => ({
                      value: level,
                      label: trainingLevelLabels[level],
                    }))}
                    error={errors.level}
                  />
                  <TextAreaField
                    name="goal"
                    label="What do you most want to learn?"
                    optional
                    rows={3}
                    error={errors.goal}
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
            Training, <em>answered.</em>
          </>
        }
      />
    </>
  );
}
