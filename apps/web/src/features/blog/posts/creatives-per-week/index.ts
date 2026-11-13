import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const creativesPerWeek: BlogPost = {
  slug: 'how-many-new-creatives-per-week',
  title: 'How many new creatives a week does your brand actually need?',
  description:
    'Work out your number from spend, how long a winner lasts and your hit rate, then make more ads without a bigger budget.',
  category: 'Creative',
  published: '2026-11-14',
  readMinutes: 6,
  cover: { glyph: 'line', tone: 'from-amber-200 via-orange-100 to-red-100', label: 'Wk' },
  toc: [
    { id: 'calc', label: 'Work out your number' },
    { id: 'fatigue', label: 'What fatigue actually looks like' },
    { id: 'cheap', label: 'Making more ads without blowing the budget' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
