import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const reelsAds: BlogPost = {
  slug: 'reels-ads-that-sell',
  title: 'How to make Reels ads that sell, not just entertain',
  description:
    'A 20-second structure for sales Reels, how to make them feel native, and how to judge whether they work.',
  category: 'Creative',
  published: '2025-11-22',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-violet-200 via-fuchsia-100 to-rose-100', label: 'Reels' },
  toc: [
    { id: 'structure', label: 'A structure that sells' },
    { id: 'native', label: 'Making it feel native' },
    { id: 'measure', label: 'How to judge a Reels ad' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
