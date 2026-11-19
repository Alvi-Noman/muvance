import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const postPurchaseExperience: BlogPost = {
  slug: 'post-purchase-experience',
  title: 'The post-purchase experience: what happens after “Order placed” decides the next order',
  description:
    'Confirmation, updates, delivery, unboxing and follow-up. How to turn the days after an order into trust, reviews and repeat sales.',
  category: 'Retention',
  published: '2026-07-23',
  readMinutes: 5,
  cover: { glyph: 'funnel', tone: 'from-teal-200 via-sky-100 to-indigo-100', label: 'After' },
  toc: [
    { id: 'timeline', label: 'The post-purchase timeline' },
    { id: 'anxiety', label: 'Reduce the anxiety' },
    { id: 'follow-up', label: 'The follow-up' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
