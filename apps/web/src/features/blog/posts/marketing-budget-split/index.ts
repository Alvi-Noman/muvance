import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const marketingBudgetSplit: BlogPost = {
  slug: 'how-to-split-marketing-budget',
  title: 'How to split your marketing budget (ads, creative, tools and people)',
  description:
    'A practical way to divide marketing money for a growing online brand, why creative is often underfunded, and how the split changes as you grow.',
  category: 'Strategy',
  published: '2025-12-13',
  readMinutes: 5,
  cover: { glyph: 'bars', tone: 'from-emerald-200 via-teal-100 to-cyan-100', label: '%' },
  toc: [
    { id: 'split', label: 'A starting split' },
    { id: 'creative', label: 'Why creative deserves more' },
    { id: 'stage', label: 'How it changes with growth' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
