import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const conversionRate: BlogPost = {
  slug: 'good-ecommerce-conversion-rate',
  title: 'What is a good conversion rate for an online store?',
  description:
    'Why “2 to 3%” is a misleading benchmark, how traffic source changes everything, and how to tell if your conversion rate is the real problem.',
  category: 'Metrics',
  published: '2025-07-29',
  readMinutes: 5,
  cover: { glyph: 'funnel', tone: 'from-cyan-200 via-sky-100 to-blue-100', label: 'CVR' },
  toc: [
    { id: 'depends', label: 'What it depends on' },
    { id: 'compare', label: 'The only comparison that counts' },
    { id: 'problem', label: 'Is conversion rate your real problem?' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
