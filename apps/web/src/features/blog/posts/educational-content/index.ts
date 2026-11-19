import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const educationalContent: BlogPost = {
  slug: 'educational-content-sells',
  title: 'Teach, don’t pitch: why educational content sells more than ads that shout',
  description:
    'People buy from brands that help them understand. How to teach customers something useful and let the sale follow naturally.',
  category: 'Content',
  published: '2025-05-28',
  readMinutes: 4,
  cover: { glyph: 'bars', tone: 'from-sky-200 via-cyan-100 to-emerald-100', label: 'Learn' },
  toc: [
    { id: 'why', label: 'Why teaching works' },
    { id: 'ideas', label: 'Ideas by category' },
    { id: 'balance', label: 'Getting the balance right' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
