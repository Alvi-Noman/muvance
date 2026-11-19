import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const repeatPurchaseRate: BlogPost = {
  slug: 'repeat-purchase-rate-ecommerce',
  title: 'Repeat purchase rate: the quiet number behind every profitable brand',
  description:
    'How to measure how many customers come back, what affects it, and simple ways to lift it without heavy discounts.',
  category: 'Metrics',
  published: '2025-05-15',
  readMinutes: 5,
  cover: { glyph: 'bars', tone: 'from-pink-200 via-rose-100 to-orange-100', label: '2nd' },
  toc: [
    { id: 'measure', label: 'How to measure it' },
    { id: 'drivers', label: 'What drives it' },
    { id: 'lift', label: 'Lifting it without discounts' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
