import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const cohortAnalysis: BlogPost = {
  slug: 'cohort-analysis-for-beginners',
  title: 'Cohort analysis for beginners: see if your customers are getting better or worse',
  description:
    'A plain guide to grouping customers by when they first bought, so you can tell whether newer customers are as valuable as older ones.',
  category: 'Metrics',
  published: '2025-03-06',
  readMinutes: 6,
  cover: { glyph: 'grid', tone: 'from-purple-200 via-violet-100 to-indigo-100', label: 'Cohort' },
  toc: [
    { id: 'build', label: 'Building a simple cohort table' },
    { id: 'read', label: 'Reading it' },
    { id: 'uses', label: 'What it helps you decide' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
