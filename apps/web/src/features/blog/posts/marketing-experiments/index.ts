import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const marketingExperiments: BlogPost = {
  slug: 'run-marketing-experiments',
  title: 'How to run marketing experiments that teach you something',
  description:
    'Most “tests” are just changes with hope attached. A simple template for real experiments: hypothesis, metric, duration and decision.',
  category: 'Strategy',
  published: '2026-09-30',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-cyan-200 via-blue-100 to-purple-100', label: 'Test' },
  toc: [
    { id: 'template', label: 'The experiment card' },
    { id: 'pick', label: 'Picking what to test' },
    { id: 'log', label: 'Keep a log' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
