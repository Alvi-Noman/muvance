import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const abandonedOrderRecovery: BlogPost = {
  slug: 'recover-abandoned-orders-bangladesh',
  title: 'Recovering abandoned orders with calls, WhatsApp and SMS',
  description:
    'Capture checkout details early, a polite recovery sequence that works in Bangladesh, and which channel to use for what.',
  category: 'Conversion',
  published: '2025-04-14',
  readMinutes: 5,
  cover: { glyph: 'funnel', tone: 'from-orange-200 via-rose-100 to-pink-100', label: 'Back' },
  toc: [
    { id: 'capture', label: 'Capture the details first' },
    { id: 'sequence', label: 'A simple recovery sequence' },
    { id: 'channels', label: 'Which channel for what' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
