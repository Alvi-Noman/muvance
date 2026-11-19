import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const placementsFeedReelsStories: BlogPost = {
  slug: 'meta-ad-placements-feed-reels-stories',
  title: 'Feed, Reels or Stories: which placements should your ads use?',
  description:
    'Why automatic placements usually win, what works in each format, and the few cases where choosing placements yourself makes sense.',
  category: 'Creative',
  published: '2025-11-29',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-fuchsia-200 via-purple-100 to-indigo-100', label: '9:16' },
  toc: [
    { id: 'places', label: 'The main placements, and what works in each' },
    { id: 'auto', label: 'Why automatic usually wins' },
    { id: 'manual', label: 'When to choose placements yourself' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
