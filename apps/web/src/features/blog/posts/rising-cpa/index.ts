import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const risingCpa: BlogPost = {
  slug: 'why-cost-per-purchase-keeps-rising',
  title: 'Why does my cost per purchase keep rising every month?',
  description:
    'The six real causes of a rising CPA on Meta ads, how to spot each one in five minutes, and what to fix first.',
  category: 'Scaling',
  published: '2026-11-14',
  readMinutes: 8,
  cover: { glyph: 'line', tone: 'from-orange-200 via-amber-100 to-yellow-100', label: 'CPA' },
  toc: [
    { id: 'causes', label: 'The six usual suspects' },
    { id: 'fatigue', label: 'Creative fatigue' },
    { id: 'seasonal', label: 'Seasonal costs' },
    { id: 'others', label: 'Learning, tracking, website' },
    { id: 'diagnose', label: '5-minute diagnosis' },
    { id: 'fix', label: 'What to do, in order' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
