import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const goodRoasBangladesh: BlogPost = {
  slug: 'what-is-a-good-roas-bangladesh',
  title: "What's a good ROAS for your store? Work out your own break-even",
  description:
    'Why category averages mislead, how to calculate your break-even ROAS including failed COD orders, and how to lower it.',
  category: 'Bangladesh',
  published: '2026-11-14',
  readMinutes: 6,
  cover: { glyph: 'split', tone: 'from-orange-200 via-amber-100 to-yellow-100', label: '2×' },
  toc: [
    { id: 'calc', label: 'Find your break-even ROAS' },
    { id: 'categories', label: 'Why category averages mislead' },
    { id: 'raise', label: 'Ways to lower your break-even' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
