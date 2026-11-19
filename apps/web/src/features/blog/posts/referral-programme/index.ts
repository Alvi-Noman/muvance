import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const referralProgramme: BlogPost = {
  slug: 'referral-programme-ecommerce',
  title: 'Referral programmes: turning happy customers into your best salespeople',
  description:
    'Word of mouth is powerful in Bangladesh. How to design a simple “give and get” referral offer, track it and avoid abuse.',
  category: 'Retention',
  published: '2025-03-10',
  readMinutes: 5,
  cover: { glyph: 'split', tone: 'from-rose-200 via-pink-100 to-purple-100', label: '+1' },
  toc: [
    { id: 'design', label: 'The classic design' },
    { id: 'reward', label: 'Choosing the reward' },
    { id: 'abuse', label: 'Preventing abuse' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
