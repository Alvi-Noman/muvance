import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const onePageMarketingPlan: BlogPost = {
  slug: 'one-page-marketing-plan',
  title: 'A one-page marketing plan for the next 90 days',
  description:
    'Goals, customers, offer, channels, budget and weekly numbers, all on one page. A template you can fill in this afternoon.',
  category: 'Strategy',
  published: '2026-05-06',
  readMinutes: 6,
  cover: { glyph: 'grid', tone: 'from-stone-200 via-amber-100 to-lime-100', label: '90d' },
  toc: [
    { id: 'template', label: 'The template' },
    { id: 'goals', label: 'Setting a goal you can steer by' },
    { id: 'review', label: 'The review rhythm' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
