import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const awarenessVsSales: BlogPost = {
  slug: 'brand-awareness-vs-sales-campaigns',
  title: 'Brand awareness or sales campaigns: which does a small brand need?',
  description:
    'When awareness campaigns make sense, when they waste money, and how to build a brand while still running for sales.',
  category: 'Strategy',
  published: '2025-09-17',
  readMinutes: 5,
  cover: { glyph: 'split', tone: 'from-sky-200 via-violet-100 to-rose-100', label: 'A/S' },
  toc: [
    { id: 'compare', label: 'What each campaign does' },
    { id: 'when', label: 'When awareness makes sense' },
    { id: 'both', label: 'Building brand inside sales campaigns' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
