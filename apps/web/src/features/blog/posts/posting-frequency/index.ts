import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const postingFrequency: BlogPost = {
  slug: 'how-often-to-post-social-media',
  title: 'How often should a brand post on social media?',
  description:
    'Posting more is not always better. A sensible frequency for each platform, and how to tell if you are posting too much or too little.',
  category: 'Social media',
  published: '2025-02-27',
  readMinutes: 4,
  cover: { glyph: 'grid', tone: 'from-emerald-200 via-cyan-100 to-blue-100', label: '/wk' },
  toc: [
    { id: 'guide', label: 'A starting point' },
    { id: 'signs', label: 'Signs to change' },
    { id: 'consistency', label: 'Consistency beats volume' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
