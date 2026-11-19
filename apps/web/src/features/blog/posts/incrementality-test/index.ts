import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const incrementalityTest: BlogPost = {
  slug: 'are-your-ads-causing-sales-incrementality',
  title: 'Are your ads causing sales, or just taking credit?',
  description:
    'The gap between attributed and incremental sales, a simple on/off test you can run, and when Meta lift studies make sense.',
  category: 'Tracking',
  published: '2026-11-18',
  readMinutes: 6,
  cover: { glyph: 'split', tone: 'from-indigo-200 via-violet-100 to-fuchsia-100', label: 'Lift' },
  toc: [
    { id: 'gap', label: 'The gap between credit and cause' },
    { id: 'test', label: 'A simple test you can run' },
    { id: 'lift', label: 'Meta’s own lift studies' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
