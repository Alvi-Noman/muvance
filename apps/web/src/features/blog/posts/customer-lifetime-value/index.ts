import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const customerLifetimeValue: BlogPost = {
  slug: 'customer-lifetime-value-ecommerce',
  title: 'Customer lifetime value: how much can you really pay for a customer?',
  description:
    'Work out a profit-based LTV from your own data, what it changes about ad spend, and how to raise it.',
  category: 'Scaling',
  published: '2025-12-16',
  readMinutes: 6,
  cover: { glyph: 'line', tone: 'from-rose-200 via-pink-100 to-fuchsia-100', label: 'LTV' },
  toc: [
    { id: 'calc', label: 'Work out your LTV' },
    { id: 'use', label: 'What it changes' },
    { id: 'raise', label: 'How to raise LTV' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
