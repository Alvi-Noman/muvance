import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const liveSelling: BlogPost = {
  slug: 'facebook-live-selling',
  title: 'Selling on Facebook Live: a practical guide for online shops',
  description:
    'Live selling is huge in Bangladesh, especially for fashion. How to plan a live, take orders without chaos and turn viewers into delivered sales.',
  category: 'Social media',
  published: '2026-04-24',
  readMinutes: 6,
  cover: { glyph: 'line', tone: 'from-red-200 via-orange-100 to-amber-100', label: 'LIVE' },
  toc: [
    { id: 'plan', label: 'Plan the session' },
    { id: 'orders', label: 'Taking orders without chaos' },
    { id: 'measure', label: 'Measure delivered sales' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
