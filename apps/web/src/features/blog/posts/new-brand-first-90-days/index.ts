import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const newBrandFirst90Days: BlogPost = {
  slug: 'launch-a-new-brand-first-90-days',
  title: 'Starting a new online brand: the first 90 days of marketing',
  description:
    'What to do in month one, two and three when you have a product and almost no audience. A realistic sequence that saves money and learns fast.',
  category: 'Strategy',
  published: '2025-05-08',
  readMinutes: 6,
  cover: { glyph: 'line', tone: 'from-lime-200 via-amber-100 to-rose-100', label: 'Day 1' },
  toc: [
    { id: 'month1', label: 'Month one: foundations' },
    { id: 'month2', label: 'Month two: test' },
    { id: 'month3', label: 'Month three: double down' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
