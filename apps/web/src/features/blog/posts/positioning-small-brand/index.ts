import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const positioningSmallBrand: BlogPost = {
  slug: 'position-a-small-brand-against-bigger-competitors',
  title: 'How to position a small brand against bigger competitors',
  description:
    'Five angles small brands win on, a one-sentence positioning template, and how to put it to work in ads and pages.',
  category: 'Brand',
  published: '2026-07-06',
  readMinutes: 5,
  cover: { glyph: 'split', tone: 'from-amber-200 via-stone-100 to-neutral-100', label: 'Niche' },
  toc: [
    { id: 'ways', label: 'Ways small brands win' },
    { id: 'statement', label: 'Write your positioning in one sentence' },
    { id: 'use', label: 'Put it to work' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
