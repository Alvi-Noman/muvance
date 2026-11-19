import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const negativeComments: BlogPost = {
  slug: 'handle-negative-comments',
  title: 'How to handle negative comments without making it worse',
  description:
    'A calm, simple process for complaints, trolls and fake claims on your posts and ads. What to reply, what to hide and what never to do.',
  category: 'Social media',
  published: '2026-07-28',
  readMinutes: 5,
  cover: { glyph: 'split', tone: 'from-amber-200 via-red-100 to-rose-100', label: '!' },
  toc: [
    { id: 'types', label: 'Know what you are dealing with' },
    { id: 'reply', label: 'A reply that works' },
    { id: 'never', label: 'What never to do' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
