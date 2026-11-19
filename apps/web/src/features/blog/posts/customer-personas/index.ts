import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const customerPersonas: BlogPost = {
  slug: 'customer-personas-from-real-data',
  title: 'Customer personas that are actually useful (built from real orders, not guesses)',
  description:
    'Most personas are made up in a meeting and never used again. Here is how to build two or three from your own orders, messages and reviews, and put them to work in ads.',
  category: 'Audience',
  published: '2026-08-17',
  readMinutes: 7,
  cover: { glyph: 'grid', tone: 'from-rose-200 via-orange-100 to-amber-100', label: 'Who' },
  toc: [
    { id: 'sources', label: 'Start with what customers already told you' },
    { id: 'group', label: 'Group people by the reason they buy' },
    { id: 'template', label: 'A one-page persona that the team will use' },
    { id: 'use', label: 'Putting personas to work' },
    { id: 'faq', label: 'A few more questions' },
  ],
  ...lazyBody(() => import('./Body')),
};
