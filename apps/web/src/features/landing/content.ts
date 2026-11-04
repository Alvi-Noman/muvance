/**
 * Landing page copy and data.
 *
 * Only add client names, results, stats or testimonials here once they're real.
 */
import {
  ChartLine,
  Clock,
  EyeOff,
  Flame,
  FlaskConical,
  Palette,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

export type PainPoint = { icon: LucideIcon; title: string; body: string };

export const painPoints: PainPoint[] = [
  {
    icon: TrendingUp,
    title: 'Costs keep climbing',
    body: 'Your cost per purchase creeps up every month while sales stay flat.',
  },
  {
    icon: Flame,
    title: 'Creatives burn out fast',
    body: 'An ad works for a week, then dies. You never have the next one ready.',
  },
  {
    icon: EyeOff,
    title: "Tracking you can't trust",
    body: "Ads Manager and Shopify tell two different stories, so you're guessing.",
  },
  {
    icon: Clock,
    title: 'No time to test',
    body: "You're running the business. Ads get whatever attention is left over.",
  },
];

export const processSteps = [
  {
    when: 'Day 1',
    title: 'Book a call',
    body: 'A free 30-minute call. We walk through your business, website and products, and show you where the growth is.',
  },
  {
    when: 'Week 1',
    title: 'Strategy & tracking',
    body: 'We fix Pixel + CAPI tracking, map your funnel and build a 90-day growth plan.',
  },
  {
    when: 'Week 2',
    title: 'Launch',
    body: 'Fresh creatives and a clean campaign structure go live, built for testing from day one.',
  },
  {
    when: 'Ongoing',
    title: 'Test & scale',
    body: 'Weekly creative tests, budget moves backed by data, and live reporting you can check anytime.',
  },
];

export type Service = { icon: LucideIcon; title: string; body: string; accent: string };

export const services: Record<
  'metaAds' | 'creative' | 'tracking' | 'testing' | 'insights',
  Service
> = {
  metaAds: {
    icon: Target,
    title: 'Meta Ads management',
    body: 'Full-funnel campaigns on Facebook and Instagram, structured to scale profitably, not just spend more.',
    accent: 'bg-emerald-400',
  },
  creative: {
    icon: Palette,
    title: 'Creative studio',
    body: 'Scroll-stopping statics, UGC and video, refreshed before fatigue sets in.',
    accent: 'bg-violet-400',
  },
  tracking: {
    icon: ChartLine,
    title: 'Conversion tracking',
    body: 'Pixel + Conversions API set up properly, so every purchase is counted.',
    accent: 'bg-orange-400',
  },
  testing: {
    icon: FlaskConical,
    title: 'Creative testing',
    body: 'A structured A/B framework that finds your next winning ad every week.',
    accent: 'bg-purple-400',
  },
  insights: {
    icon: TrendingUp,
    title: 'Campaign insights',
    body: 'Live dashboards and a weekly call. Always know what is working and why.',
    accent: 'bg-sky-400',
  },
};

export const faqs = [
  {
    question: 'What happens on the call?',
    answer:
      "We walk through your business, website and products together. You'll leave with the three biggest opportunities we see, whether or not you work with us.",
  },
  {
    question: 'How do you charge?',
    answer:
      "Only on results. Before we start, we agree on a monthly sales target together. You don't pay us a single taka until you hit it. After that, we take only a small percentage of your sales or net profit. No retainers, no setup fees, no advance payments.",
  },
  {
    question: 'Is there a minimum ad spend?',
    answer:
      "There's no fixed number. On the call we look at your sales and margins, and tell you honestly whether ads can work for you right now.",
  },
  {
    question: 'How quickly will I see results?',
    answer:
      "It depends on your product, margins and starting point. First we fix tracking and launch the first creative tests. We'll give you an honest timeline on the call.",
  },
  {
    question: 'Do I have to sign a long-term contract?',
    answer:
      "No. And you never pay in advance, because we don't charge until you hit your sales target. We keep clients by delivering results, not by locking them in.",
  },
  {
    question: 'Do you make the ad creatives too?',
    answer:
      'Yes. Our in-house creative studio produces statics, video and UGC-style ads, so strategy and creative stay in sync.',
  },
  {
    question: 'Which platforms do you run ads on?',
    answer:
      'We specialise in Meta (Facebook and Instagram). Going deep on one platform is how we get better results than generalist agencies.',
  },
];

/** "Our promise": how Muvance differs from a typical agency. Rows are shown side by side. */
export const promiseComparison = [
  {
    topic: 'How you pay',
    others: 'A fixed monthly retainer, paid upfront',
    muvance: 'Only after you hit your sales target',
  },
  {
    topic: 'If sales fall short',
    others: 'You still pay the full fee',
    muvance: 'You owe us nothing',
  },
  {
    topic: 'Advance payments',
    others: 'Required before work begins',
    muvance: 'None. Ever.',
  },
  {
    topic: 'Who carries the risk',
    others: 'You do',
    muvance: 'We do',
  },
  {
    topic: 'What they’re paid for',
    others: 'Hours, reports and ad spend',
    muvance: 'Hitting your sales target',
  },
];

export const bookingPerks = [
  'A review of your business, website and products',
  'The 3 biggest opportunities we see',
  'A clear plan, whether or not you hire us',
];
