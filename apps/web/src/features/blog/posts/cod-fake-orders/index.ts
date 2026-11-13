import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const codFakeOrders: BlogPost = {
  slug: 'reduce-fake-cod-orders-bangladesh',
  title: 'How to reduce fake orders and returns from cash-on-delivery customers',
  description:
    'What failed COD orders really cost, and five practical steps Bangladeshi eCommerce brands use to catch them before they ship.',
  category: 'Bangladesh',
  published: '2026-11-14',
  readMinutes: 8,
  cover: { glyph: 'funnel', tone: 'from-teal-200 via-emerald-100 to-green-100', label: 'COD' },
  toc: [
    { id: 'cost', label: 'What failed orders cost' },
    { id: 'confirm', label: 'Confirm every order' },
    { id: 'history', label: 'Check delivery history' },
    { id: 'advance', label: 'Advance for risky orders' },
    { id: 'prevent', label: 'Prevent refusals' },
    { id: 'meta', label: 'Tell Meta what was real' },
    { id: 'checklist', label: 'Anti-fake-order checklist' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
