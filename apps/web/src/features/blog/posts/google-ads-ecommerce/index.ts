import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const googleAdsEcommerce: BlogPost = {
  slug: 'google-ads-for-online-stores',
  title: 'Google Ads for online stores: Search, Performance Max and YouTube explained',
  description:
    'How Google Ads differs from Meta, which campaign types suit eCommerce, and how to start without wasting money on the wrong searches.',
  category: 'Strategy',
  published: '2025-09-30',
  readMinutes: 6,
  cover: { glyph: 'bars', tone: 'from-blue-200 via-green-100 to-yellow-100', label: 'G' },
  toc: [
    { id: 'difference', label: 'The key difference' },
    { id: 'types', label: 'Campaign types for eCommerce' },
    { id: 'start', label: 'Starting without waste' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
