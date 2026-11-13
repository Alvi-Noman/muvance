import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const attributionSettings: BlogPost = {
  slug: 'meta-attribution-settings-explained',
  title: 'Which attribution setting should you use: 7-day click, 1-day view or incremental?',
  description:
    'What each attribution setting counts, why your results change when you switch, and which to use for what.',
  category: 'Tracking',
  published: '2026-11-14',
  readMinutes: 6,
  cover: { glyph: 'bars', tone: 'from-blue-200 via-indigo-100 to-slate-100', label: '7d' },
  toc: [
    { id: 'options', label: "The settings you'll see" },
    { id: 'effect', label: 'Same week, three different answers' },
    { id: 'choose', label: 'Which one should you use?' },
    { id: 'truth', label: 'So which number is true?' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
