import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const breakEvenRoas: BlogPost = {
  slug: 'break-even-roas-calculator',
  title: 'Break-even ROAS: the one number you should know before running ads',
  description:
    'Calculate the ROAS where you stop losing money on each order, using your real margins, delivery costs and return rate.',
  category: 'Metrics',
  published: '2026-11-08',
  readMinutes: 5,
  cover: { glyph: 'split', tone: 'from-lime-200 via-green-100 to-emerald-100', label: '1:1' },
  toc: [
    { id: 'calc', label: 'Calculate yours' },
    { id: 'target', label: 'From break-even to target' },
    { id: 'lower', label: 'Ways to lower your break-even' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
