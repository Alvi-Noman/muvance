import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const performanceVsRetainer: BlogPost = {
  slug: 'performance-based-agency-vs-retainer',
  title: 'Performance-based ad agency vs monthly retainer: which is better?',
  description:
    'How each pricing model works, what it costs at different results, the honest pros and cons, and the questions to ask any agency.',
  category: 'Agencies',
  published: '2026-11-14',
  readMinutes: 7,
  cover: { glyph: 'split', tone: 'from-stone-200 via-neutral-100 to-amber-100', label: '0%' },
  toc: [
    { id: 'models', label: 'How each model works' },
    { id: 'calculator', label: 'Compare the cost' },
    { id: 'pros-cons', label: 'Honest pros and cons' },
    { id: 'watch', label: 'What to watch for' },
    { id: 'questions', label: 'Questions to ask' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
