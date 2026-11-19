import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const sourcingFromChina: BlogPost = {
  slug: 'sourcing-products-from-china-bangladesh',
  title: 'Sourcing products from China for a Bangladeshi brand: a practical checklist',
  description:
    'From shortlisting suppliers to inspection before payment, how to calculate landed cost, and what to check before the deposit.',
  category: 'Operations',
  published: '2026-06-08',
  readMinutes: 6,
  cover: { glyph: 'split', tone: 'from-red-200 via-amber-100 to-yellow-100', label: 'Source' },
  toc: [
    { id: 'steps', label: 'From idea to stock in hand' },
    { id: 'landed', label: 'Know your landed cost' },
    { id: 'check', label: 'Before you send the deposit' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
