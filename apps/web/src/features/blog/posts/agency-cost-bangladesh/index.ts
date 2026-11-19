import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const agencyCostBangladesh: BlogPost = {
  slug: 'facebook-ads-agency-cost-bangladesh',
  title: 'How much does a Facebook ads agency cost in Bangladesh?',
  description:
    'The four ways agencies charge, a calculator to compare them at your own spend and sales, and the hidden costs people forget.',
  category: 'Agencies',
  published: '2026-04-20',
  readMinutes: 6,
  cover: { glyph: 'bars', tone: 'from-amber-200 via-yellow-100 to-lime-100', label: '৳' },
  toc: [
    { id: 'models', label: 'The four ways agencies charge' },
    { id: 'compare', label: 'Compare them with your own numbers' },
    { id: 'hidden', label: 'The costs people forget' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
