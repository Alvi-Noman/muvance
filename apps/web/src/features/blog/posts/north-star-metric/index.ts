import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const northStarMetric: BlogPost = {
  slug: 'north-star-metric-for-online-brands',
  title: 'Pick one number to rule them all: a north star metric for your brand',
  description:
    'Too many metrics means nobody knows what matters. How to choose a single guiding number for your team, with examples for different kinds of online businesses.',
  category: 'Metrics',
  published: '2026-07-11',
  readMinutes: 4,
  cover: { glyph: 'line', tone: 'from-amber-200 via-yellow-100 to-white', label: '★' },
  toc: [
    { id: 'what', label: 'What a north star metric is' },
    { id: 'examples', label: 'Examples by business type' },
    { id: 'avoid', label: 'What to avoid' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
