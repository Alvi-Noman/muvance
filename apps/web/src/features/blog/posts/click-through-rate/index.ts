import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const clickThroughRate: BlogPost = {
  slug: 'click-through-rate-what-it-means',
  title: 'Click-through rate: what it tells you, and what it doesn’t',
  description:
    'A high CTR can still lose money and a low one can be fine. How to read link CTR on Meta, what moves it and when to stop worrying about it.',
  category: 'Metrics',
  published: '2025-05-10',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-blue-200 via-indigo-100 to-violet-100', label: 'CTR' },
  toc: [
    { id: 'which', label: 'Which CTR to look at' },
    { id: 'tells', label: 'What it tells you' },
    { id: 'doesnt', label: 'What it doesn’t tell you' },
    { id: 'improve', label: 'If CTR is genuinely low' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
