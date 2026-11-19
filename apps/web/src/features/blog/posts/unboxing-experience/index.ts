import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const unboxingExperience: BlogPost = {
  slug: 'unboxing-experience-packaging',
  title: 'Unboxing and packaging: small touches that make people post about you',
  description:
    'Packaging is the one marketing touchpoint every customer sees. Affordable ideas for a memorable unboxing that protects the product and invites the next order.',
  category: 'Retention',
  published: '2026-07-10',
  readMinutes: 4,
  cover: { glyph: 'grid', tone: 'from-yellow-200 via-orange-100 to-pink-100', label: 'Box' },
  toc: [
    { id: 'basics', label: 'Get the basics right first' },
    { id: 'ideas', label: 'Affordable touches' },
    { id: 'balance', label: 'Keep costs in check' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
