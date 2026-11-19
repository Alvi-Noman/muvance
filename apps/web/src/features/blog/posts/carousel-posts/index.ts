import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const carouselPosts: BlogPost = {
  slug: 'carousel-posts-that-sell',
  title: 'Carousel posts that people swipe to the end (and then buy)',
  description:
    'Carousels are great for teaching, comparing and showing range. A slide-by-slide structure and design tips for Instagram and Facebook.',
  category: 'Content',
  published: '2026-06-22',
  readMinutes: 4,
  cover: { glyph: 'grid', tone: 'from-fuchsia-200 via-pink-100 to-rose-100', label: '→' },
  toc: [
    { id: 'structure', label: 'A structure that keeps people swiping' },
    { id: 'design', label: 'Design tips' },
    { id: 'ads', label: 'Carousel ads' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
