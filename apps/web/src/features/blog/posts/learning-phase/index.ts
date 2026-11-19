import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const learningPhase: BlogPost = {
  slug: 'meta-ads-learning-phase-explained',
  title: 'The learning phase explained: why results swing in the first week',
  description:
    'What the learning phase is, what restarts it, how to handle Learning limited, and why patience saves money.',
  category: 'Campaign setup',
  published: '2025-11-15',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-cyan-200 via-sky-100 to-indigo-100', label: 'Learn' },
  toc: [
    { id: 'shape', label: 'What learning usually looks like' },
    { id: 'reset', label: 'What restarts learning' },
    { id: 'limited', label: 'What to do about "Learning limited"' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
