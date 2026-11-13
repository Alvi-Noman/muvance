import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const dailyBudgetNewBrand: BlogPost = {
  slug: 'how-much-to-spend-on-meta-ads-per-day',
  title: 'How much should a new eCommerce brand spend on Meta ads per day?',
  description:
    'Work out a starting budget from your price, margin and expected cost per sale, then spend in three phases.',
  category: 'Scaling',
  published: '2026-11-14',
  readMinutes: 6,
  cover: { glyph: 'bars', tone: 'from-lime-200 via-green-100 to-emerald-100', label: '৳/day' },
  toc: [
    { id: 'calc', label: 'Work out your starting budget' },
    { id: 'phases', label: 'Spend in three phases' },
    { id: 'small', label: 'If your budget is small' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
