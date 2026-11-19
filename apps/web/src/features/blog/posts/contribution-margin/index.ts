import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const contributionMargin: BlogPost = {
  slug: 'contribution-margin-ecommerce',
  title: 'Contribution margin: the number that tells you if ads are really profitable',
  description:
    'What contribution margin is, a calculator for your own month, and how to use it for scaling, product and offer decisions.',
  category: 'Scaling',
  published: '2026-09-21',
  readMinutes: 6,
  cover: { glyph: 'bars', tone: 'from-emerald-200 via-green-100 to-lime-100', label: 'CM2' },
  toc: [
    { id: 'calc', label: 'Calculate yours' },
    { id: 'use', label: 'How to use it' },
    { id: 'vs', label: 'Contribution margin vs ROAS' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
