import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const codCheckoutFlow: BlogPost = {
  slug: 'cash-on-delivery-checkout-design',
  title: 'How to design a cash-on-delivery checkout that keeps buyers',
  description:
    'Where checkouts leak, what a tight one-page COD checkout looks like, and how to keep orders real without scaring buyers off.',
  category: 'Conversion',
  published: '2026-04-16',
  readMinutes: 5,
  cover: { glyph: 'funnel', tone: 'from-teal-200 via-emerald-100 to-lime-100', label: 'COD' },
  toc: [
    { id: 'leaks', label: 'Where checkouts leak' },
    { id: 'design', label: 'Long checkout vs short checkout' },
    { id: 'real', label: 'Keeping orders real' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
