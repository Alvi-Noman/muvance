import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const brandStorytelling: BlogPost = {
  slug: 'brand-storytelling-that-sells',
  title: 'Brand storytelling that actually sells (and doesn’t sound like a mission statement)',
  description:
    'Stories make people remember and trust you. A simple structure for brand and product stories, with examples you can adapt.',
  category: 'Content',
  published: '2026-03-24',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-rose-200 via-pink-100 to-fuchsia-100', label: 'Story' },
  toc: [
    { id: 'structure', label: 'A simple structure' },
    { id: 'sources', label: 'Where good stories come from' },
    { id: 'use', label: 'Where to use them' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
