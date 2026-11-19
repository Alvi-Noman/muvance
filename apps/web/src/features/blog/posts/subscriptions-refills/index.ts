import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const subscriptionsRefills: BlogPost = {
  slug: 'subscriptions-and-refill-reminders',
  title: 'Subscriptions and refill reminders for products people run out of',
  description:
    'If your product gets used up, you can predict the next order. How to set up reminders or simple subscriptions that customers actually like.',
  category: 'Retention',
  published: '2025-11-17',
  readMinutes: 4,
  cover: { glyph: 'line', tone: 'from-green-200 via-teal-100 to-cyan-100', label: '↻' },
  toc: [
    { id: 'reminder', label: 'Start with reminders' },
    { id: 'subscriptions', label: 'When to offer a subscription' },
    { id: 'value', label: 'Why it matters' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
