import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const firstPartyData: BlogPost = {
  slug: 'first-party-data-small-brands',
  title: 'First-party data for small brands: the customer list you actually own',
  description:
    'Platforms change, accounts get restricted and tracking gets weaker. Your own list of customers and their orders is the one asset that stays. How to build and use it.',
  category: 'Audience',
  published: '2025-08-21',
  readMinutes: 6,
  cover: { glyph: 'grid', tone: 'from-slate-200 via-zinc-100 to-stone-100', label: 'Own' },
  toc: [
    { id: 'what', label: 'What to collect' },
    { id: 'store', label: 'Keep it in one place' },
    { id: 'use', label: 'Five ways to use it' },
    { id: 'respect', label: 'Use it with respect' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
