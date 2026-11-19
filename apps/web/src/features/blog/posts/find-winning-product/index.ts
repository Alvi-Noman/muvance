import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const findWinningProduct: BlogPost = {
  slug: 'how-to-find-a-winning-product-bangladesh',
  title: 'How to find a winning product to sell online in Bangladesh',
  description:
    'What winning products usually have, a margin check for ads, and how to test demand before buying stock.',
  category: 'Growth',
  published: '2025-12-20',
  readMinutes: 6,
  cover: { glyph: 'bars', tone: 'from-lime-200 via-yellow-100 to-amber-100', label: 'Win' },
  toc: [
    { id: 'criteria', label: 'What winners usually have' },
    { id: 'margin', label: 'Check the numbers first' },
    { id: 'test', label: 'Test demand before buying big' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
