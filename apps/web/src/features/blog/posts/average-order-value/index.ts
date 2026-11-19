import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const averageOrderValue: BlogPost = {
  slug: 'increase-average-order-value',
  title: 'Seven practical ways to raise your average order value',
  description:
    'A higher basket size makes every ad cheaper in relative terms. Bundles, thresholds, add-ons and more, with what tends to work for Bangladeshi online stores.',
  category: 'Metrics',
  published: '2026-05-07',
  readMinutes: 6,
  cover: { glyph: 'line', tone: 'from-amber-200 via-orange-100 to-rose-100', label: 'AOV' },
  toc: [
    { id: 'ways', label: 'Seven ways that work' },
    { id: 'effect', label: 'Why it matters so much' },
    { id: 'careful', label: 'Watch for the trade-off' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
