import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const marketingDashboard: BlogPost = {
  slug: 'one-page-marketing-dashboard',
  title: 'Build a one-page marketing dashboard you will actually check',
  description:
    'Eight numbers, one page, updated weekly. What to include, where each number comes from and how to set it up in a sheet or Looker Studio.',
  category: 'Metrics',
  published: '2026-01-26',
  readMinutes: 6,
  cover: { glyph: 'grid', tone: 'from-zinc-200 via-slate-100 to-sky-100', label: '8' },
  toc: [
    { id: 'eight', label: 'The eight numbers' },
    { id: 'sources', label: 'Where each number comes from' },
    { id: 'tool', label: 'Sheet or Looker Studio?' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
