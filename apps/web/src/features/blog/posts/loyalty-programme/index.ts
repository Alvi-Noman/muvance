import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const loyaltyProgramme: BlogPost = {
  slug: 'loyalty-programme-small-brand',
  title: 'Does a small brand need a loyalty programme?',
  description:
    'Points, tiers, VIP perks or nothing at all. When loyalty programmes pay off, simple versions that work, and the mistakes that turn them into discount machines.',
  category: 'Retention',
  published: '2025-08-12',
  readMinutes: 5,
  cover: { glyph: 'bars', tone: 'from-amber-200 via-yellow-100 to-orange-100', label: 'VIP' },
  toc: [
    { id: 'when', label: 'When it is worth it' },
    { id: 'types', label: 'Simple versions that work' },
    { id: 'measure', label: 'How to know it works' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
