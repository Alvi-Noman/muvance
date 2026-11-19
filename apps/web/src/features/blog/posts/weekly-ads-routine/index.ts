import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const weeklyAdsRoutine: BlogPost = {
  slug: 'weekly-meta-ads-routine',
  title: 'A weekly Meta ads routine that takes one hour',
  description:
    'A two-minute daily check, a one-hour weekly review in five steps, and the habits that waste money.',
  category: 'Scaling',
  published: '2025-02-10',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-violet-200 via-indigo-100 to-sky-100', label: '1 hr' },
  toc: [
    { id: 'routine', label: 'The one-hour weekly routine' },
    { id: 'daily', label: 'The two-minute daily check' },
    { id: 'avoid', label: 'What not to do' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
