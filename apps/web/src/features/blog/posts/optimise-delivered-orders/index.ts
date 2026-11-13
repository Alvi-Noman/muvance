import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const optimiseDeliveredOrders: BlogPost = {
  slug: 'optimise-meta-ads-for-delivered-orders',
  title: 'How to optimise Meta ads for delivered orders, not just placed orders',
  description:
    'Send a Delivered event through the Conversions API, report on it, and eventually let Meta learn from real buyers.',
  category: 'Tracking',
  published: '2026-11-14',
  readMinutes: 7,
  cover: { glyph: 'funnel', tone: 'from-emerald-200 via-teal-100 to-cyan-100', label: '✓' },
  toc: [
    { id: 'flow', label: 'How it works' },
    { id: 'options', label: 'Two ways to use it' },
    { id: 'payload', label: 'What to send' },
    { id: 'effect', label: 'What changes when Meta learns from real buyers' },
    { id: 'steps', label: 'Setting it up' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
