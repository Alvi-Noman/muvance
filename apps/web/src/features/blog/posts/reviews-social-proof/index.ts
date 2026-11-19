import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const reviewsSocialProof: BlogPost = {
  slug: 'collect-and-show-customer-reviews',
  title: 'How to collect and show reviews that actually build trust',
  description:
    'When and how to ask for reviews in Bangladesh, what strong social proof looks like, and how to handle bad reviews.',
  category: 'Conversion',
  published: '2025-01-21',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-amber-200 via-yellow-100 to-orange-100', label: '★★★★' },
  toc: [
    { id: 'collect', label: 'How to collect reviews' },
    { id: 'show', label: 'Where and how to show them' },
    { id: 'bad', label: 'Handling bad reviews' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
