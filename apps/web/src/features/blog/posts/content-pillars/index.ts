import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const contentPillars: BlogPost = {
  slug: 'content-pillars-for-brands',
  title: 'Content pillars: never stare at a blank posting schedule again',
  description:
    'Pick three to five themes your brand always talks about, and posting ideas start writing themselves. How to choose pillars and turn them into a weekly rhythm.',
  category: 'Content',
  published: '2025-11-17',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-pink-200 via-fuchsia-100 to-violet-100', label: '4' },
  toc: [
    { id: 'what', label: 'What a pillar is' },
    { id: 'choose', label: 'Choosing yours' },
    { id: 'rhythm', label: 'Turning pillars into a rhythm' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
