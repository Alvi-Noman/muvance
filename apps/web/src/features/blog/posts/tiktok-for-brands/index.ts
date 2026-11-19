import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const tiktokForBrands: BlogPost = {
  slug: 'tiktok-for-brands-bangladesh',
  title: 'TikTok for brands in Bangladesh: is it worth your time?',
  description:
    'Who is on TikTok, what kind of content works for brands, and how to start without a big team. Plus how to tell if it is bringing sales.',
  category: 'Social media',
  published: '2025-08-17',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-zinc-200 via-cyan-100 to-pink-100', label: 'TT' },
  toc: [
    { id: 'fit', label: 'Is your brand a fit?' },
    { id: 'content', label: 'What works for brands' },
    { id: 'sales', label: 'Does it bring sales?' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
