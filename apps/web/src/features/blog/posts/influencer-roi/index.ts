import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const influencerRoi: BlogPost = {
  slug: 'measure-influencer-campaigns',
  title: 'Measuring influencer campaigns: did that collaboration actually sell anything?',
  description:
    'Discount codes, tracked links, sales lift and turning creator content into ads. A practical way to judge influencer marketing beyond likes.',
  category: 'Social media',
  published: '2025-02-16',
  readMinutes: 5,
  cover: { glyph: 'bars', tone: 'from-purple-200 via-pink-100 to-rose-100', label: '@' },
  toc: [
    { id: 'track', label: 'Ways to track' },
    { id: 'compare', label: 'Comparing creators' },
    { id: 'content', label: 'The hidden value: content' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
