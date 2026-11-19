import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const repurposingContent: BlogPost = {
  slug: 'repurpose-one-video-ten-ways',
  title: 'One video, ten pieces of content: a repurposing system for busy brands',
  description:
    'How to get a week of posts, ads and emails out of a single shoot. A practical system with examples.',
  category: 'Content',
  published: '2025-08-02',
  readMinutes: 4,
  cover: { glyph: 'split', tone: 'from-orange-200 via-amber-100 to-yellow-100', label: '1→10' },
  toc: [
    { id: 'system', label: 'From one long video' },
    { id: 'list', label: 'The ten pieces' },
    { id: 'ads', label: 'Organic first, then ads' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
