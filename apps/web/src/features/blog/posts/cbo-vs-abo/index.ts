import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const cboVsAbo: BlogPost = {
  slug: 'cbo-vs-abo-budget',
  title: 'CBO vs ABO: which budget setup works better for testing and scaling?',
  description:
    'How campaign budgets and ad set budgets move your money differently, and a simple setup that uses both.',
  category: 'Campaign setup',
  published: '2026-11-14',
  readMinutes: 6,
  cover: { glyph: 'bars', tone: 'from-sky-200 via-blue-100 to-indigo-100', label: 'CBO' },
  toc: [
    { id: 'how', label: 'How the money moves' },
    { id: 'compare', label: 'Side by side' },
    { id: 'setup', label: 'A simple setup that uses both' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
