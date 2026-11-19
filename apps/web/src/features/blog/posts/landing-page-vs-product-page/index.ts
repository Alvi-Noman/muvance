import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const landingPageVsProductPage: BlogPost = {
  slug: 'landing-page-vs-product-page-for-ads',
  title: 'Send ad traffic to a landing page or a product page?',
  description:
    'Dedicated landing pages can lift conversions for some products and hurt others. When each makes sense and how to test it fairly.',
  category: 'Conversion',
  published: '2025-05-10',
  readMinutes: 5,
  cover: { glyph: 'split', tone: 'from-orange-200 via-yellow-100 to-lime-100', label: 'LP' },
  toc: [
    { id: 'compare', label: 'The difference' },
    { id: 'when', label: 'When a landing page helps' },
    { id: 'test', label: 'Testing it fairly' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
