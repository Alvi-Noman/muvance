import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const buyerObjections: BlogPost = {
  slug: 'handle-buyer-objections-before-they-ask',
  title: 'The six doubts that stop people buying, and how to answer them in advance',
  description:
    'Price, trust, fit, timing, quality and “I’ll think about it.” How to spot which doubt is costing you sales and answer it in the ad, page or checkout.',
  category: 'Audience',
  published: '2025-08-08',
  readMinutes: 6,
  cover: { glyph: 'grid', tone: 'from-orange-200 via-amber-100 to-yellow-100', label: '?' },
  toc: [
    { id: 'six', label: 'The six doubts' },
    { id: 'where', label: 'Answer it at the right moment' },
    { id: 'test', label: 'Test the answers' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
