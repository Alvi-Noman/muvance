import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const freeDeliveryThreshold: BlogPost = {
  slug: 'free-delivery-threshold',
  title: 'Free delivery threshold: how to set one that raises order value',
  description:
    'A calculator to find your threshold, inside vs outside Dhaka, and the cart nudges that help people reach it.',
  category: 'Conversion',
  published: '2025-05-17',
  readMinutes: 5,
  cover: { glyph: 'bars', tone: 'from-lime-200 via-emerald-100 to-teal-100', label: 'Free' },
  toc: [
    { id: 'calc', label: 'Find your threshold' },
    { id: 'where', label: 'Inside Dhaka vs outside' },
    { id: 'nudges', label: 'Nudges that help' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
