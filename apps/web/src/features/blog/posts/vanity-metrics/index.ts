import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const vanityMetrics: BlogPost = {
  slug: 'vanity-metrics-vs-business-metrics',
  title: 'Vanity metrics vs money metrics: what to stop celebrating',
  description:
    'Likes, followers and reach feel good but rarely pay salaries. Which numbers to report, which to watch quietly, and which to ignore.',
  category: 'Metrics',
  published: '2025-03-13',
  readMinutes: 4,
  cover: { glyph: 'split', tone: 'from-yellow-200 via-amber-100 to-orange-100', label: '♥' },
  toc: [
    { id: 'sort', label: 'Sorting your numbers' },
    { id: 'not-useless', label: 'They are not useless' },
    { id: 'report', label: 'What to put in a monthly report' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
