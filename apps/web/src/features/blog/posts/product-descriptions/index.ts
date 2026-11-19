import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const productDescriptions: BlogPost = {
  slug: 'write-product-descriptions-that-sell',
  title: 'How to write product descriptions that sell (with before-and-after examples)',
  description:
    'Turn a list of specs into words that help people decide. A simple structure, real examples and the mistakes that make shoppers leave.',
  category: 'Content',
  published: '2025-04-15',
  readMinutes: 5,
  cover: { glyph: 'bars', tone: 'from-teal-200 via-emerald-100 to-lime-100', label: 'Copy' },
  toc: [
    { id: 'structure', label: 'A structure that works' },
    { id: 'example', label: 'Before and after' },
    { id: 'tips', label: 'Small things that help' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
