import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const seoVsPaidAds: BlogPost = {
  slug: 'seo-vs-paid-ads',
  title: 'SEO or paid ads: where should a growing brand put its money?',
  description:
    'Ads give speed, SEO gives compounding. How they differ in cost, time and risk, and how to split effort between them at different stages.',
  category: 'SEO',
  published: '2026-08-18',
  readMinutes: 5,
  cover: { glyph: 'split', tone: 'from-emerald-200 via-teal-100 to-sky-100', label: 'vs' },
  toc: [
    { id: 'compare', label: 'How they compare' },
    { id: 'cost', label: 'Cost per order over time' },
    { id: 'split', label: 'A sensible split by stage' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
