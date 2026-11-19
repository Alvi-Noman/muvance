import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const visualIdentity: BlogPost = {
  slug: 'visual-identity-basics',
  title: 'Visual identity basics: logo, colours and fonts that make you recognisable',
  description:
    'You do not need a 60-page brand book. The few visual rules that make your ads, posts and packaging look like they belong to one brand.',
  category: 'Brand',
  published: '2025-01-21',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-pink-200 via-amber-100 to-teal-100', label: 'Aa' },
  toc: [
    { id: 'minimum', label: 'The minimum kit' },
    { id: 'consistency', label: 'Consistency is the whole point' },
    { id: 'ads', label: 'In ads' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
