import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const reachVsImpressions: BlogPost = {
  slug: 'reach-vs-impressions-explained',
  title: 'Reach vs impressions: what the difference tells you about your ads',
  description:
    'Reach counts people, impressions count views. How to read them together, what frequency means for results, and when each number matters.',
  category: 'Metrics',
  published: '2025-08-18',
  readMinutes: 4,
  cover: { glyph: 'line', tone: 'from-sky-200 via-blue-100 to-indigo-100', label: 'Seen' },
  toc: [
    { id: 'difference', label: 'The difference' },
    { id: 'read', label: 'Reading them together' },
    { id: 'when', label: 'When each matters' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
