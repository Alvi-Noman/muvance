import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const productPageAnatomy: BlogPost = {
  slug: 'product-page-that-converts-on-mobile',
  title: 'Anatomy of a product page that converts on mobile',
  description:
    'What belongs on the first screen, the order buyers’ doubts come in, and a checklist to score your own page.',
  category: 'Conversion',
  published: '2026-08-15',
  readMinutes: 6,
  cover: { glyph: 'funnel', tone: 'from-sky-200 via-blue-100 to-indigo-100', label: 'Page' },
  toc: [
    { id: 'order', label: 'Top to bottom, in order' },
    { id: 'check', label: 'Check your own page' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
