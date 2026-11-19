import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const instagramOrganic: BlogPost = {
  slug: 'grow-instagram-organically',
  title: 'Growing on Instagram without ads: what still works',
  description:
    'Reels, shares, saves and replies. A realistic plan for brands to grow an Instagram account organically, and how to tell if it is working.',
  category: 'Social media',
  published: '2025-07-29',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-pink-200 via-rose-100 to-orange-100', label: 'IG' },
  toc: [
    { id: 'what-works', label: 'What tends to work' },
    { id: 'measure', label: 'Measuring the right things' },
    { id: 'routine', label: 'A weekly routine' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
