/**
 * Industry pages (/services/<slug>): how Muvance approaches growth for each kind of store.
 * Written to answer what owners actually ask search engines and AI tools, e.g. "Meta ads
 * agency for fashion brands in Bangladesh". Advice only: no client names or results.
 *
 * The sitemap plugin reads each slug straight from this file, so keep every slug on one line.
 */
import { Apple, Gem, HeartPulse, Shirt, Smartphone, Sofa, type LucideIcon } from 'lucide-react';
import type { FaqItem } from '../components/faq-json-ld';

export type Industry = {
  slug: string;
  icon: LucideIcon;
  /** Short name for cards and breadcrumbs. */
  name: string;
  /** Who the page is for, used in the headline: "Meta ads for <audience>". */
  audience: string;
  /** The italic part of the headline. */
  accent: string;
  /** Page title and meta description. */
  title: string;
  description: string;
  lead: string;
  /** Card tint on the services page. */
  tint: string;
  challenges: { title: string; body: string }[];
  playbook: { title: string; body: string }[];
  /** Creative ideas that tend to work in this category. */
  angles: string[];
  /** The numbers we watch most closely, and why. */
  metrics: { name: string; why: string }[];
  faqs: FaqItem[];
  /** Blog posts worth reading next (slugs). */
  related: string[];
};

export const industries: Industry[] = [
  {
    slug: 'fashion-brands',
    icon: Shirt,
    name: 'Fashion & clothing',
    audience: 'fashion brands',
    accent: 'that sell out, not just get likes.',
    title: 'Meta ads agency for fashion brands in Bangladesh',
    description:
      'How Muvance grows fashion and clothing brands in Bangladesh with Meta ads, creative, a faster store and fewer returns. Paid only after you hit your sales target.',
    lead: 'Fashion moves fast: new drops, short trends, size questions and a lot of cash-on-delivery returns. We build ads, creative and operations around exactly that.',
    tint: 'from-rose-100 to-orange-50',
    challenges: [
      {
        title: 'Creative tires in days',
        body: 'Fashion audiences scroll past the same look quickly. Without a steady flow of new ads, costs rise within a week or two.',
      },
      {
        title: 'Size and fit doubts',
        body: 'Most hesitation is "will it fit me?". If the ad and product page do not answer it, people message, wait, and often never order.',
      },
      {
        title: 'Returns eat the margin',
        body: 'Wrong sizes and impulse cash-on-delivery orders come back. A sale that is returned costs you twice: the ad and the delivery.',
      },
    ],
    playbook: [
      {
        title: 'Collections as campaigns',
        body: 'Each drop gets its own creative set and a short launch window, with best sellers moved into an always-on campaign.',
      },
      {
        title: 'Try-on creative',
        body: 'Real people wearing the product, different body types, fabric close-ups and a clear size guide in the ad itself.',
      },
      {
        title: 'Fit answered on the page',
        body: 'Size charts with measurements in inches, model height and size, and an easy exchange policy above the order button.',
      },
      {
        title: 'Confirm before you ship',
        body: 'A confirmation call checks size and address on every cash-on-delivery order before it leaves the warehouse.',
      },
    ],
    angles: [
      'Try-on videos with real customers',
      'One outfit, three ways to style it',
      'Fabric and stitching close-ups',
      'Eid and Boishakh collection launches',
      '"Under ৳1,500" style edits',
      'Restock alerts for sold-out sizes',
    ],
    metrics: [
      {
        name: 'Delivered orders',
        why: 'Placed orders flatter fashion. Delivered ones pay the bills.',
      },
      {
        name: 'Return rate by ad',
        why: 'Some ads attract buyers who keep what they order. We find and scale those.',
      },
      {
        name: 'Creative hook rate',
        why: 'Shows early whether a new look stops the scroll, before money is wasted.',
      },
      { name: 'Repeat purchase rate', why: 'Fashion profit lives in the second and third order.' },
    ],
    faqs: [
      {
        question: 'Do Meta ads work for clothing brands in Bangladesh?',
        answer:
          'Yes. Facebook and Instagram are where most Bangladeshi shoppers discover clothing. What decides profit is fresh creative every week, a product page that answers size questions, and confirming cash-on-delivery orders before they ship.',
      },
      {
        question: 'How do you reduce returns for a fashion brand?',
        answer:
          'Clear size charts with measurements, model height and size in every photo, try-on videos, and a confirmation call that checks the size before dispatch. We also watch which ads bring buyers who return more, and cut them.',
      },
      {
        question: 'How many new ads does a fashion brand need?',
        answer:
          'More than most categories, because looks tire fast. Usually several new creatives a week, plus a burst for every new collection. We make them in-house, so you do not have to.',
      },
      {
        question: 'How do you charge fashion brands?',
        answer:
          'The same way we charge everyone: we agree a monthly sales target together, and you pay nothing until you hit it. No retainer, no setup fee, no advance payment.',
      },
    ],
    related: [
      'reduce-fake-cod-orders-bangladesh',
      'how-many-new-creatives-per-week',
      'meta-ads-eid-seasonal-performance',
    ],
  },
  {
    slug: 'beauty-skincare-brands',
    icon: Gem,
    name: 'Beauty & skincare',
    audience: 'beauty and skincare brands',
    accent: 'built on trust, not hype.',
    title: 'Meta ads agency for beauty and skincare brands in Bangladesh',
    description:
      'How Muvance grows beauty and skincare brands in Bangladesh with Meta ads, honest creative and repeat-order systems. Paid only after you hit your sales target.',
    lead: 'In skincare, people buy proof: real skin, real routines and trust that the product is authentic. We build every ad and page around earning that trust.',
    tint: 'from-pink-100 to-violet-50',
    challenges: [
      {
        title: '"Is it original?"',
        body: 'Fake products have made buyers careful. If your ads and page do not prove authenticity, they buy from the brand they already trust.',
      },
      {
        title: 'Strict ad rules',
        body: 'Before-and-after claims and promises about skin conditions can get ads rejected or accounts restricted. Copy has to persuade within the rules.',
      },
      {
        title: 'Profit is in the reorder',
        body: 'The first order rarely makes much money. The brands that win get customers back for the second and third bottle.',
      },
    ],
    playbook: [
      {
        title: 'Proof-first creative',
        body: 'Real routines, texture shots, ingredient explainers and honest reviews, filmed in natural light on real skin.',
      },
      {
        title: 'Policy-safe copy',
        body: 'We write claims that sell without breaking Meta’s health and beauty rules, so your account stays healthy.',
      },
      {
        title: 'Authenticity on the page',
        body: 'Batch numbers, import papers or sourcing story, and clear return terms, right where people decide.',
      },
      {
        title: 'Reorder system',
        body: 'Retargeting timed to when the product runs out, bundles for routines, and follow-up calls for repeat buyers.',
      },
    ],
    angles: [
      'Morning and night routine videos',
      'Ingredient explainers in plain Bangla',
      'Texture and swatch close-ups',
      'How to spot a fake vs the original',
      'Routine bundles for skin types',
      'Dermatologist or expert Q&A (where real)',
    ],
    metrics: [
      {
        name: 'Repeat purchase rate',
        why: 'The clearest sign the product works and the brand is trusted.',
      },
      { name: 'Cost per first order', why: 'Worth paying more for if those customers reorder.' },
      {
        name: 'Ad rejection rate',
        why: 'Rejected ads waste time and can put the account at risk.',
      },
      {
        name: 'Average order value',
        why: 'Bundles and routines lift it, which makes ads affordable.',
      },
    ],
    faqs: [
      {
        question: 'Can skincare brands run before-and-after ads on Facebook?',
        answer:
          'Meta restricts before-and-after images and claims about health or body conditions. We use routines, textures, ingredient education and genuine reviews instead, which tend to sell just as well and keep the ad account safe.',
      },
      {
        question: 'How do you prove a beauty product is original in ads?',
        answer:
          'Show the sourcing: batch codes, packaging details, import documents or your own production story, plus real customer videos. Put the same proof on the product page, next to the order button.',
      },
      {
        question: 'Is the first order profitable for skincare brands?',
        answer:
          'Often not, and that is fine if customers reorder. We work out what a customer is worth over a few months and set ad targets from that, then build retargeting and bundles to bring them back.',
      },
      {
        question: 'How do you charge beauty brands?',
        answer:
          'We agree a monthly sales target together, and you pay nothing until you hit it. No retainer, no setup fee, no advance payment.',
      },
    ],
    related: [
      'ugc-vs-studio-vs-ai-ads',
      'what-is-a-good-roas-bangladesh',
      'bangla-vs-english-ad-copy',
    ],
  },
  {
    slug: 'gadget-electronics-stores',
    icon: Smartphone,
    name: 'Gadgets & electronics',
    audience: 'gadget and electronics stores',
    accent: 'without a price war.',
    title: 'Meta ads agency for gadget and electronics stores in Bangladesh',
    description:
      'How Muvance grows gadget and electronics stores in Bangladesh with Meta ads that sell on trust, warranty and demos, not just the lowest price. Paid only after you hit your target.',
    lead: 'Gadget buyers compare everything: price, warranty, original or copy. We help you win on trust and clarity, so you are not forced into the cheapest price in every ad.',
    tint: 'from-sky-100 to-indigo-50',
    challenges: [
      {
        title: 'Everyone sells the same item',
        body: 'When five pages sell the same earbuds, the cheapest ad wins unless you give buyers another reason to choose you.',
      },
      {
        title: 'Thin margins',
        body: 'Electronics margins leave little room for wasted ad spend. Every taka has to be tracked to a delivered order.',
      },
      {
        title: 'Warranty and fake worries',
        body: 'Buyers worry about copies and what happens if it breaks. Unanswered doubts become unanswered messages.',
      },
    ],
    playbook: [
      {
        title: 'Demo-led creative',
        body: 'Short videos that show the product working: unboxing, sound tests, battery tests, side-by-side comparisons.',
      },
      {
        title: 'Trust as the offer',
        body: 'Official warranty, replacement policy and authenticity checks in the ad itself, not hidden on the page.',
      },
      {
        title: 'Profit-based targets',
        body: 'We set cost-per-order limits per product from its real margin, so best sellers scale and thin-margin items stay small.',
      },
      {
        title: 'Accessories and bundles',
        body: 'Cases, chargers and bundles lift the order value so the ad cost is spread over more profit.',
      },
    ],
    angles: [
      'Unboxing and first impressions',
      'Original vs copy: how to check',
      'Real battery and sound tests',
      'Warranty explained in 15 seconds',
      'Gift ideas by budget',
      'Bundle deals with accessories',
    ],
    metrics: [
      { name: 'Profit per order', why: 'Margins are thin, so revenue alone can hide a loss.' },
      {
        name: 'Cost per delivered order',
        why: 'Set per product from its margin, not one number for the store.',
      },
      {
        name: 'Average order value',
        why: 'Bundles and accessories decide whether ads are affordable.',
      },
      {
        name: 'Message-to-order rate',
        why: 'Many gadget buyers ask first. Slow replies lose sales.',
      },
    ],
    faqs: [
      {
        question: 'How do gadget shops compete on Facebook without the lowest price?',
        answer:
          'By selling trust: official warranty, a clear replacement policy, proof that the product is original and fast delivery. Demo videos that show the product working also beat static price posts.',
      },
      {
        question: 'Are Meta ads profitable for electronics with low margins?',
        answer:
          'They can be, if each product has its own cost-per-order limit based on its margin and you raise order value with bundles. We judge ads on profit per delivered order, not on revenue.',
      },
      {
        question: 'Should electronics stores use Messenger or website ads?',
        answer:
          'Often both. Higher-priced items get many questions, so message ads can work well if someone replies fast. Simpler items sell better straight from a product page.',
      },
      {
        question: 'How do you charge electronics stores?',
        answer:
          'We agree a monthly sales target together, and you pay nothing until you hit it. No retainer, no setup fee, no advance payment.',
      },
    ],
    related: [
      'click-to-whatsapp-vs-website-ads',
      'what-is-a-good-roas-bangladesh',
      'how-to-test-meta-ad-creatives',
    ],
  },
  {
    slug: 'home-lifestyle-brands',
    icon: Sofa,
    name: 'Home & lifestyle',
    audience: 'home and lifestyle brands',
    accent: 'people can picture at home.',
    title: 'Meta ads agency for home decor and lifestyle brands in Bangladesh',
    description:
      'How Muvance grows home decor, furniture and lifestyle brands in Bangladesh with Meta ads, room-ready creative and delivery that keeps up. Paid only after you hit your target.',
    lead: 'Home products are bought with the imagination: "how will it look in my room?" We make creative that answers that, and operations that deliver bulky items safely.',
    tint: 'from-amber-100 to-lime-50',
    challenges: [
      {
        title: 'Hard to judge from a photo',
        body: 'Size, colour and quality are hard to read on a phone screen, so buyers hesitate or order the wrong thing.',
      },
      {
        title: 'Longer decisions',
        body: 'People save posts and come back days later. Ads judged on same-day sales look worse than they are.',
      },
      {
        title: 'Delivery is part of the product',
        body: 'Breakages and late deliveries of bulky items turn into returns and bad reviews.',
      },
    ],
    playbook: [
      {
        title: 'Room-ready creative',
        body: 'Products shown in real homes, with dimensions on screen and a hand or person for scale.',
      },
      {
        title: 'Patient retargeting',
        body: 'People who saved, watched or visited are shown room ideas and reviews over the following weeks.',
      },
      {
        title: 'Clear page details',
        body: 'Dimensions, materials, colour notes and care instructions above the order button.',
      },
      {
        title: 'Safe packing and dispatch',
        body: 'Packing standards and delivery partners chosen for fragile and bulky items.',
      },
    ],
    angles: [
      'Small-room makeovers',
      'Before and after a room refresh',
      'Dimensions shown with a tape measure',
      'Gift sets for weddings and new homes',
      'Material and finish close-ups',
      'Customer homes (with permission)',
    ],
    metrics: [
      {
        name: 'Seven-day click conversions',
        why: 'Home buyers take days to decide, so same-day numbers undercount.',
      },
      { name: 'Saves and shares', why: 'An early sign a design will sell when retargeted.' },
      {
        name: 'Damage and return rate',
        why: 'Bulky items can lose more in breakage than the ad cost.',
      },
      { name: 'Average order value', why: 'Sets and room bundles make ads far more affordable.' },
    ],
    faqs: [
      {
        question: 'Do Facebook ads work for home decor in Bangladesh?',
        answer:
          'Yes, especially video and carousel ads that show products in real rooms. Expect a longer decision time than fashion, so retargeting and a longer attribution window matter.',
      },
      {
        question: 'How do you sell furniture online when people want to see it first?',
        answer:
          'Show scale and quality on screen: dimensions, a person for size, material close-ups and real customer homes. Then make the page answer every remaining doubt, and make delivery and returns clear.',
      },
      {
        question: 'Can you help with delivery of bulky items?',
        answer:
          'Yes. Our operational support covers warehousing, packing and dispatch, and we help choose delivery partners that handle fragile and bulky goods well.',
      },
      {
        question: 'How do you charge home brands?',
        answer:
          'We agree a monthly sales target together, and you pay nothing until you hit it. No retainer, no setup fee, no advance payment.',
      },
    ],
    related: [
      'meta-attribution-settings-explained',
      'landing-page-fixes-ad-clicks-no-sales',
      'how-to-scale-winning-meta-ads',
    ],
  },
  {
    slug: 'food-grocery-brands',
    icon: Apple,
    name: 'Food & grocery',
    audience: 'food and grocery brands',
    accent: 'that customers reorder.',
    title: 'Meta ads agency for food and grocery brands in Bangladesh',
    description:
      'How Muvance grows food, organic and grocery brands in Bangladesh with Meta ads, trust-building creative and subscription-style reorders. Paid only after you hit your target.',
    lead: 'Food brands live on trust and habit. We help you prove quality and purity, then turn first orders into monthly ones.',
    tint: 'from-lime-100 to-emerald-50',
    challenges: [
      {
        title: 'Purity is hard to prove',
        body: '"Pure", "organic" and "home-made" are on every page. Buyers want to see why yours is different.',
      },
      {
        title: 'Low order value',
        body: 'A single jar or packet rarely covers the ad and delivery cost. The money is in bigger baskets and reorders.',
      },
      {
        title: 'Freshness and delivery',
        body: 'Late or damaged deliveries of food lose customers for good.',
      },
    ],
    playbook: [
      {
        title: 'Source-to-table creative',
        body: 'Farms, kitchens, processes and tests on camera. Show how it is made, not just the finished product.',
      },
      {
        title: 'Bigger first baskets',
        body: 'Combos, family packs and free-delivery thresholds so the first order covers its costs.',
      },
      {
        title: 'Reorder rhythm',
        body: 'Retargeting and reminder calls timed to when a pack usually runs out.',
      },
      {
        title: 'Freshness logistics',
        body: 'Packing and delivery planned around shelf life and city routes.',
      },
    ],
    angles: [
      'How it is made, start to finish',
      'Purity tests on camera',
      'Family recipes using the product',
      'Monthly family pack offers',
      'Ramadan and Eid bundles',
      'Customer kitchen videos',
    ],
    metrics: [
      {
        name: 'Reorder rate at 30 and 60 days',
        why: 'Food brands grow on habit. This is the number that compounds.',
      },
      { name: 'Average order value', why: 'Decides whether a first order can pay for its own ad.' },
      {
        name: 'Cost per new customer',
        why: 'Judged against what a customer spends over months, not one order.',
      },
      { name: 'Delivery complaints', why: 'One spoiled delivery can cost a lifetime customer.' },
    ],
    faqs: [
      {
        question: 'How do organic food brands advertise on Facebook in Bangladesh?',
        answer:
          'By showing proof rather than claims: the farm or kitchen, the process, tests and real customers. Pair that with combo packs so the first order is worth the ad cost, and remind buyers when they are likely to run out.',
      },
      {
        question: 'Are Meta ads worth it for low-priced food products?',
        answer:
          'Only if you raise the basket size and get reorders. We plan bundles and reorder campaigns from the start, and judge ads on what a customer is worth over a few months.',
      },
      {
        question: 'Do you help with food delivery and packing?',
        answer:
          'Yes. Our operational support covers warehousing, packing and dispatch, planned around shelf life.',
      },
      {
        question: 'How do you charge food brands?',
        answer:
          'We agree a monthly sales target together, and you pay nothing until you hit it. No retainer, no setup fee, no advance payment.',
      },
    ],
    related: [
      'mer-vs-roas',
      'meta-ads-eid-seasonal-performance',
      'website-vs-facebook-page-bangladesh',
    ],
  },
  {
    slug: 'health-wellness-brands',
    icon: HeartPulse,
    name: 'Health & wellness',
    audience: 'health and wellness brands',
    accent: 'that stay within the rules.',
    title: 'Meta ads agency for health and wellness brands in Bangladesh',
    description:
      'How Muvance grows health, fitness and wellness brands in Bangladesh with policy-safe Meta ads, education-led creative and repeat orders. Paid only after you hit your target.',
    lead: 'Wellness is one of the most restricted categories on Meta. We help you sell with education and trust, inside the rules, so your ad account keeps running.',
    tint: 'from-teal-100 to-sky-50',
    challenges: [
      {
        title: 'Strict ad policies',
        body: 'Claims about health, weight or body image can get ads rejected and accounts restricted, sometimes for good.',
      },
      {
        title: 'Sceptical buyers',
        body: 'Miracle promises have made people wary. Over-claiming loses trust as fast as it loses ads.',
      },
      {
        title: 'Results take time',
        body: 'Customers judge wellness products over weeks, so the first order is only the start.',
      },
    ],
    playbook: [
      {
        title: 'Education-led creative',
        body: 'Explain how and why the product helps, with real routines and honest expectations.',
      },
      {
        title: 'Policy review on every ad',
        body: 'Copy and visuals checked against Meta’s health rules before launch, to protect the account.',
      },
      {
        title: 'Expert and customer voices',
        body: 'Real practitioners and customers, never staged miracles.',
      },
      {
        title: 'Course-length offers',
        body: 'Packs that match how long the product takes to work, plus reminders to continue.',
      },
    ],
    angles: [
      'Daily routine videos',
      'Myths vs facts explainers',
      'What to expect in week 1, 2 and 4',
      'Ingredient sourcing stories',
      'Practitioner Q&A (where real)',
      'Course packs and refills',
    ],
    metrics: [
      {
        name: 'Ad account health',
        why: 'Rejections and warnings are watched as closely as sales.',
      },
      {
        name: 'Course completion reorders',
        why: 'Shows customers are staying long enough to see results.',
      },
      {
        name: 'Cost per first order',
        why: 'Set against what a customer spends over the full course.',
      },
      {
        name: 'Refund and complaint rate',
        why: 'The early warning that copy is promising too much.',
      },
    ],
    faqs: [
      {
        question: 'Why do Facebook ads for health products get rejected?',
        answer:
          'Meta restricts claims about health conditions, weight loss and body image, and before-and-after images. Ads that educate and set honest expectations get approved far more often and build more trust.',
      },
      {
        question: 'How do you keep a wellness brand’s ad account safe?',
        answer:
          'Every ad is checked against Meta’s policies before launch, landing pages are kept consistent with the ads, and we avoid the claims and images that trigger reviews.',
      },
      {
        question: 'How do wellness brands get repeat customers?',
        answer:
          'Sell packs that match how long the product takes to work, set honest expectations, and remind customers before they run out.',
      },
      {
        question: 'How do you charge wellness brands?',
        answer:
          'We agree a monthly sales target together, and you pay nothing until you hit it. No retainer, no setup fee, no advance payment.',
      },
    ],
    related: [
      'ugc-vs-studio-vs-ai-ads',
      'why-cost-per-purchase-keeps-rising',
      'performance-based-agency-vs-retainer',
    ],
  },
];

export const findIndustry = (slug: string | undefined) => industries.find((i) => i.slug === slug);
