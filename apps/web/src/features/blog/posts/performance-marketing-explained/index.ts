import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const performanceMarketingExplained: BlogPost = {
  slug: 'what-is-performance-marketing',
  title: 'What is performance marketing, and how is it different from brand marketing?',
  description:
    'A plain-words definition, how it compares with brand marketing, the numbers that matter, and what a performance-based agency is.',
  category: 'Agencies',
  published: '2025-04-24',
  readMinutes: 6,
  cover: { glyph: 'line', tone: 'from-emerald-200 via-teal-100 to-sky-100', label: 'Perf' },
  toc: [
    { id: 'definition', label: 'What it means, in plain words' },
    { id: 'vs-brand', label: 'Performance vs brand marketing' },
    { id: 'numbers', label: 'The numbers that matter' },
    { id: 'agencies', label: 'What a performance-based agency is' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
