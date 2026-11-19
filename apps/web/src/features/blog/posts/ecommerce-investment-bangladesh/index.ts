import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const ecommerceInvestmentBangladesh: BlogPost = {
  slug: 'investment-for-ecommerce-brands-bangladesh',
  title: 'How to get investment for your eCommerce brand in Bangladesh',
  description:
    'Common types of funding, a check to see if you are investment-ready, and what investors want to see.',
  category: 'Growth',
  published: '2025-02-07',
  readMinutes: 6,
  cover: { glyph: 'line', tone: 'from-emerald-200 via-green-100 to-teal-100', label: 'Fund' },
  toc: [
    { id: 'types', label: 'Common types of funding' },
    { id: 'ready', label: 'Are you investment-ready?' },
    { id: 'pitch', label: 'What investors want to see' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
