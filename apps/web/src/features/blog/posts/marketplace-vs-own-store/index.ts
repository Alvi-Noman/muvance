import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const marketplaceVsOwnStore: BlogPost = {
  slug: 'daraz-vs-own-website',
  title: 'Marketplace or your own website? Selling on Daraz and other platforms vs going direct',
  description:
    'Marketplaces bring ready buyers and take a cut. Your own site gives control and customer data. How to decide, and how to do both.',
  category: 'Strategy',
  published: '2025-07-15',
  readMinutes: 5,
  cover: { glyph: 'split', tone: 'from-orange-200 via-pink-100 to-violet-100', label: 'M/D' },
  toc: [
    { id: 'compare', label: 'Side by side' },
    { id: 'when', label: 'Which fits when' },
    { id: 'numbers', label: 'Compare on profit, not revenue' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
