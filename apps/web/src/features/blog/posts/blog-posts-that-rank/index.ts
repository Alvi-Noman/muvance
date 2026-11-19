import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const blogPostsThatRank: BlogPost = {
  slug: 'blog-posts-that-rank-and-get-cited',
  title: 'Writing blog posts that rank on Google and get quoted by AI',
  description:
    'How to pick a topic, structure the article and write it so search engines and AI assistants see it as the clearest answer.',
  category: 'Content',
  published: '2026-04-15',
  readMinutes: 6,
  cover: { glyph: 'bars', tone: 'from-lime-200 via-yellow-100 to-amber-100', label: 'Blog' },
  toc: [
    { id: 'topic', label: 'Pick a question, not a topic' },
    { id: 'structure', label: 'A structure that works for people and machines' },
    { id: 'quality', label: 'What makes it trustworthy' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
