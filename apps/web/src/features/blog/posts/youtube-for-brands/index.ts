import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const youtubeForBrands: BlogPost = {
  slug: 'youtube-for-small-brands',
  title: 'YouTube for small brands: long videos, Shorts and why search matters',
  description:
    'YouTube is a search engine as well as a video app. How small brands can use reviews, how-tos and Shorts to get found and build trust.',
  category: 'Social media',
  published: '2026-02-18',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-red-200 via-rose-100 to-stone-100', label: 'YT' },
  toc: [
    { id: 'why', label: 'Why YouTube is different' },
    { id: 'ideas', label: 'Video ideas that sell' },
    { id: 'pace', label: 'A realistic pace' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
