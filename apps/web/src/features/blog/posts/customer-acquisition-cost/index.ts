import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const customerAcquisitionCost: BlogPost = {
  slug: 'customer-acquisition-cost-explained',
  title: 'Customer acquisition cost: how to work it out properly (most people get it wrong)',
  description:
    'CAC is not the cost per purchase in Ads Manager. What to include, how to calculate it from delivered orders, and what a healthy number looks like for your margins.',
  category: 'Metrics',
  published: '2026-01-01',
  readMinutes: 6,
  cover: { glyph: 'bars', tone: 'from-emerald-200 via-lime-100 to-yellow-100', label: 'CAC' },
  toc: [
    { id: 'formula', label: 'The honest formula' },
    { id: 'mistakes', label: 'Three common mistakes' },
    { id: 'healthy', label: 'What is a good CAC?' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
