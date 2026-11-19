import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const adFrequency: BlogPost = {
  slug: 'ad-frequency-how-many-times',
  title: 'Ad frequency: how many times is too many?',
  description:
    'What frequency tells you, what ad fatigue looks like in the numbers, and the order of fixes that actually work.',
  category: 'Creative',
  published: '2025-04-26',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-amber-200 via-orange-100 to-rose-100', label: '3.6×' },
  toc: [
    { id: 'signs', label: 'What fatigue looks like' },
    { id: 'fix', label: 'What to do when frequency climbs' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
