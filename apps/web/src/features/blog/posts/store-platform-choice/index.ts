import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const storePlatformChoice: BlogPost = {
  slug: 'shopify-vs-woocommerce-bangladesh',
  title: 'Shopify, WooCommerce or a custom site: which suits a Bangladeshi brand?',
  description:
    'What each option is good at, the must-haves for selling in Bangladesh, and what to check before switching platforms.',
  category: 'Conversion',
  published: '2026-09-14',
  readMinutes: 6,
  cover: { glyph: 'split', tone: 'from-green-200 via-emerald-100 to-sky-100', label: 'Store' },
  toc: [
    { id: 'compare', label: 'The options side by side' },
    { id: 'must', label: 'Must-haves for a Bangladeshi store' },
    { id: 'switch', label: 'Thinking of switching?' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
