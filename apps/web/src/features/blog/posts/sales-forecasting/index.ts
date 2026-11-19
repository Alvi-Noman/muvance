import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const salesForecasting: BlogPost = {
  slug: 'simple-sales-forecast-for-ad-budget',
  title: 'A simple sales forecast to plan your ad budget (no finance degree needed)',
  description:
    'Work backwards from a sales goal to the ad budget, stock and team you need. A calculator, the assumptions to check, and how to keep the plan honest.',
  category: 'Metrics',
  published: '2026-07-01',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-emerald-200 via-green-100 to-lime-100', label: 'Plan' },
  toc: [
    { id: 'backwards', label: 'Work backwards from the goal' },
    { id: 'assumptions', label: 'Check the assumptions' },
    { id: 'track', label: 'Track against the plan weekly' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
