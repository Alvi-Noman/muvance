import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const creatorsUgcBangladesh: BlogPost = {
  slug: 'ugc-creators-influencers-bangladesh',
  title: 'How to work with UGC creators and influencers in Bangladesh',
  description:
    'Creators vs customers vs influencers, how to brief them, and what to agree in writing before anyone films.',
  category: 'Creative',
  published: '2026-08-06',
  readMinutes: 6,
  cover: { glyph: 'grid', tone: 'from-yellow-200 via-orange-100 to-pink-100', label: 'UGC' },
  toc: [
    { id: 'types', label: 'Creators, customers and influencers' },
    { id: 'brief', label: 'How to brief a creator' },
    { id: 'rights', label: 'Before you pay: the agreement checklist' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
