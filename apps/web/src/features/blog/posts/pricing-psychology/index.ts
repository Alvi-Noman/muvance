import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const pricingPsychology: BlogPost = {
  slug: 'pricing-psychology-ecommerce',
  title: '৳990 or ৳1,000? Pricing ideas that help people buy',
  description:
    'Pricing ideas worth testing, honest anchors and discounts, and how to test a price change properly.',
  category: 'Conversion',
  published: '2026-01-11',
  readMinutes: 5,
  cover: { glyph: 'bars', tone: 'from-amber-200 via-orange-100 to-red-100', label: '৳990' },
  toc: [
    { id: 'tactics', label: 'Pricing ideas worth testing' },
    { id: 'anchor', label: 'Anchors and honest discounts' },
    { id: 'test', label: 'How to test a price' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
