import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const broadTargeting: BlogPost = {
  slug: 'broad-targeting-vs-interests',
  title: 'Is broad targeting really better than interests and lookalikes?',
  description:
    'When broad targeting beats interests, when it does not, and how to run a fair test on your own account before moving your budget.',
  category: 'Campaign setup',
  published: '2026-11-14',
  readMinutes: 7,
  cover: { glyph: 'line', tone: 'from-sky-200 via-cyan-100 to-emerald-100', label: 'Broad' },
  toc: [
    { id: 'what', label: "What 'broad' means today" },
    { id: 'why', label: 'Why broad usually wins' },
    { id: 'when-not', label: 'When interests still help' },
    { id: 'ready', label: 'Readiness check' },
    { id: 'test', label: 'How to test it' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
