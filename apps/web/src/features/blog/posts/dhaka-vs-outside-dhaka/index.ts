import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const dhakaVsOutsideDhaka: BlogPost = {
  slug: 'selling-inside-vs-outside-dhaka',
  title: 'Inside Dhaka vs outside Dhaka: how buyers differ, and how to sell to both',
  description:
    'Delivery times, trust, payment and what people want all change once you leave the capital. What to adjust in your ads, offers and operations.',
  category: 'Audience',
  published: '2026-05-01',
  readMinutes: 6,
  cover: { glyph: 'split', tone: 'from-green-200 via-emerald-100 to-lime-100', label: 'BD' },
  toc: [
    { id: 'differences', label: 'What usually changes' },
    { id: 'numbers', label: 'Watch the delivered numbers, not just orders' },
    { id: 'adjust', label: 'What to adjust' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
