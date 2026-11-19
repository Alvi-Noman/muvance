import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const offersWithoutKillingMargin: BlogPost = {
  slug: 'offers-that-sell-without-killing-margin',
  title: 'Offers that sell without killing your margin',
  description:
    'Discounts vs bundles vs free delivery vs gifts, a calculator to compare profit per order, and rules that keep offers healthy.',
  category: 'Conversion',
  published: '2025-04-19',
  readMinutes: 6,
  cover: { glyph: 'bars', tone: 'from-emerald-200 via-lime-100 to-yellow-100', label: '2 for' },
  toc: [
    { id: 'types', label: 'Offer types compared' },
    { id: 'calc', label: 'Discount or bundle? Do the maths' },
    { id: 'rules', label: 'Rules that keep offers healthy' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
