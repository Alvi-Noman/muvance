import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const statisticalSignificance: BlogPost = {
  slug: 'is-your-ad-test-result-real',
  title: 'Is that test result real? Statistical significance without the maths',
  description:
    'Why an ad that “won” after two days often loses next week, how much data you need before trusting a result, and simple rules for small budgets.',
  category: 'Metrics',
  published: '2026-07-28',
  readMinutes: 6,
  cover: { glyph: 'split', tone: 'from-indigo-200 via-blue-100 to-cyan-100', label: 'p' },
  toc: [
    { id: 'noise', label: 'The problem: noise' },
    { id: 'rules', label: 'Simple rules of thumb' },
    { id: 'tools', label: 'If you want the maths' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
