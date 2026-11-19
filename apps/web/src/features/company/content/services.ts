/**
 * What Muvance does, in the order the services page shows it. Copy only: no client names,
 * results or prices (see the note at the top of features/landing/content.ts).
 */
import {
  Boxes,
  Clapperboard,
  Compass,
  Headset,
  MonitorSmartphone,
  PackageSearch,
  Target,
  Wallet,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';

export type ServiceField = {
  id: string;
  icon: LucideIcon;
  title: string;
  /** One line: the outcome, not the activity. */
  promise: string;
  body: string;
  includes: string[];
  /** Tailwind classes for the card's tint and the icon chip. */
  tint: string;
  chip: string;
};

export const serviceFields: ServiceField[] = [
  {
    id: 'brand-strategy',
    icon: Compass,
    title: 'Brand Strategy',
    promise: 'Know who you sell to, and why they should pick you.',
    body: 'Before a single ad goes live, we get clear on your customer, your offer and what makes you different. Most "ad problems" are really positioning problems, and they are cheaper to fix here than in Ads Manager.',
    includes: [
      'Customer and competitor research',
      'Positioning and messaging',
      'Offers, bundles and pricing structure',
      'Brand identity and tone of voice',
      'Launch and growth roadmap',
    ],
    tint: 'from-amber-100/80 via-white to-white',
    chip: 'bg-amber-400',
  },
  {
    id: 'creative-production',
    icon: Clapperboard,
    title: 'Creative Production',
    promise: 'Ads people stop scrolling for, made every week.',
    body: 'On Meta today, the creative is the targeting. Our in-house team writes, shoots and edits a steady flow of new ads, so there is always a fresh one ready before the last one tires.',
    includes: [
      'Static and carousel ads',
      'Short videos and Reels',
      'UGC and creator content',
      'Product photography',
      'Bangla, English and Banglish copy',
    ],
    tint: 'from-violet-100/80 via-white to-white',
    chip: 'bg-violet-400',
  },
  {
    id: 'website-cro',
    icon: MonitorSmartphone,
    title: 'Website & CRO',
    promise: 'A store that turns clicks into orders.',
    body: 'Paying for clicks that land on a slow or confusing page is the most expensive mistake in eCommerce. We build and fix stores so they load fast on mobile data, answer every doubt and make ordering easy.',
    includes: [
      'Store builds and redesigns',
      'High-converting landing pages',
      'Mobile speed fixes',
      'Checkout and cash-on-delivery flow',
      'Pixel and Conversions API tracking',
      'A/B tests on what matters',
    ],
    tint: 'from-sky-100/80 via-white to-white',
    chip: 'bg-sky-400',
  },
  {
    id: 'online-advertising',
    icon: Target,
    title: 'Online Advertising',
    promise: 'Ads that pay for themselves, then scale.',
    body: 'We plan, launch and manage your campaigns on Facebook and Instagram, test new creative every week and move budget towards what is actually selling, judged on delivered orders and profit, not likes.',
    includes: [
      'Campaign strategy and structure',
      'Weekly creative testing',
      'Scaling winning ads',
      'Retargeting and repeat buyers',
      'Live reporting you can check anytime',
    ],
    tint: 'from-emerald-100/80 via-white to-white',
    chip: 'bg-emerald-400',
  },
  {
    id: 'operational-support',
    icon: Boxes,
    title: 'Operational Support',
    promise: 'The back office behind every delivered order.',
    body: 'Growth breaks things: unconfirmed orders, packing backlogs, stock that runs out, cash tied up in ad spend. We help run the operations side too, so more orders turn into delivered sales.',
    includes: ['Call centre', 'Warehouse', 'Product sourcing', 'Ad credits'],
    tint: 'from-rose-100/70 via-white to-white',
    chip: 'bg-rose-400',
  },
];

export type OperationsItem = { icon: LucideIcon; title: string; body: string };

/** The four parts of Operational Support, shown as their own cards. */
export const operationsItems: OperationsItem[] = [
  {
    icon: Headset,
    title: 'Call centre',
    body: 'Every order gets a confirmation call before it ships, which cuts fake and cancelled cash-on-delivery orders. We also follow up on abandoned orders.',
  },
  {
    icon: Warehouse,
    title: 'Warehouse',
    body: 'Storage, packing and dispatch handled for you, so a good sales week never turns into a late-delivery week.',
  },
  {
    icon: PackageSearch,
    title: 'Product sourcing',
    body: 'We help you find, check and negotiate with suppliers at home and abroad, so your best seller never runs out.',
  },
  {
    icon: Wallet,
    title: 'Ad credits',
    body: 'We can front your ad spend, so a winning campaign never has to stop because your cash is tied up in stock.',
  },
];

/** The short "how" on the services page; the full version lives on /how-we-work. */
export const howSteps = [
  {
    title: 'Diagnose',
    body: 'A free call where we look at your business, website and products, and find the biggest gaps.',
  },
  {
    title: 'Agree a target',
    body: 'We set a monthly sales target together. Our fee only starts once you hit it.',
  },
  {
    title: 'Build',
    body: 'Brand, creative, store and tracking: we fix the foundations before spending more.',
  },
  {
    title: 'Launch and scale',
    body: 'Weekly tests, budget moved to what sells, and operations that keep up.',
  },
];
