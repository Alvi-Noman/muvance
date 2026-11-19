import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const prSmallBrands: BlogPost = {
  slug: 'pr-for-small-brands',
  title: 'PR for small brands: getting featured without a big agency',
  description:
    'Journalists need stories. How to find yours, pitch it simply and use coverage to build trust and links.',
  category: 'Brand',
  published: '2026-08-30',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-stone-200 via-neutral-100 to-amber-100', label: 'Press' },
  toc: [
    { id: 'angle', label: 'Finding a story worth telling' },
    { id: 'pitch', label: 'Pitching simply' },
    { id: 'use', label: 'Using coverage' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
