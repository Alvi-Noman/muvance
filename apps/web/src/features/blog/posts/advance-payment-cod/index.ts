import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const advancePaymentCod: BlogPost = {
  slug: 'advance-payment-cash-on-delivery',
  title: 'Should you ask for advance payment on cash-on-delivery orders?',
  description:
    'The trade-off between fewer refusals and fewer orders, when to ask for an advance, and how to make paying upfront feel safe.',
  category: 'Bangladesh',
  published: '2025-05-22',
  readMinutes: 5,
  cover: { glyph: 'split', tone: 'from-pink-200 via-rose-100 to-red-100', label: 'bKash' },
  toc: [
    { id: 'tradeoff', label: 'The trade-off' },
    { id: 'when', label: 'When to ask for an advance' },
    { id: 'trust', label: 'Make paying upfront feel safe' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
