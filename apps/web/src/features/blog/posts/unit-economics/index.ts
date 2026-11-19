import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const unitEconomics: BlogPost = {
  slug: 'unit-economics-online-store',
  title: 'Unit economics on one page: does each order actually make money?',
  description:
    'Break one order down from selling price to what is left after product, delivery, returns, fees and ads. The simplest way to see if growth will help or hurt.',
  category: 'Metrics',
  published: '2026-08-06',
  readMinutes: 5,
  cover: { glyph: 'bars', tone: 'from-orange-200 via-amber-100 to-lime-100', label: '1 unit' },
  toc: [
    { id: 'waterfall', label: 'Where the money goes' },
    { id: 'levers', label: 'The levers' },
    { id: 'next', label: 'Going further' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
