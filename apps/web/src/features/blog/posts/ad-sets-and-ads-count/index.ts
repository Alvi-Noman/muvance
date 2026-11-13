import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const adSetsAndAdsCount: BlogPost = {
  slug: 'how-many-ad-sets-and-ads',
  title: 'How many ad sets and ads should one campaign have?',
  description:
    'The 50-a-week rule, a calculator for your own budget, and practical limits on ads per ad set.',
  category: 'Campaign setup',
  published: '2026-11-14',
  readMinutes: 6,
  cover: { glyph: 'grid', tone: 'from-cyan-200 via-sky-100 to-blue-100', label: '50' },
  toc: [
    { id: 'maths', label: 'The 50-a-week rule' },
    { id: 'ads', label: 'How many ads per ad set?' },
    { id: 'rules', label: 'Practical rules' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
