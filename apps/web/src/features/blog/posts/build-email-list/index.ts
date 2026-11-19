import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const buildEmailList: BlogPost = {
  slug: 'build-email-list-from-zero',
  title: 'Building an email or contact list from zero',
  description:
    'Checkout, pop-ups, lead magnets and packaging inserts. Honest ways to collect contacts that actually want to hear from you.',
  category: 'Retention',
  published: '2026-01-28',
  readMinutes: 4,
  cover: { glyph: 'bars', tone: 'from-emerald-200 via-lime-100 to-yellow-100', label: 'List' },
  toc: [
    { id: 'where', label: 'Where to collect contacts' },
    { id: 'reason', label: 'Give a real reason to join' },
    { id: 'keep', label: 'Keep the list healthy' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
