import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const catalogAds: BlogPost = {
  slug: 'meta-catalog-ads-product-feed',
  title: 'Catalogue ads: when a product feed beats hand-made ads',
  description:
    'When Advantage+ catalogue ads work best, how to set up a clean feed, and the mistakes that quietly break them.',
  category: 'Campaign setup',
  published: '2026-02-24',
  readMinutes: 6,
  cover: { glyph: 'grid', tone: 'from-lime-200 via-green-100 to-emerald-100', label: 'Feed' },
  toc: [
    { id: 'when', label: 'When a feed beats hand-made ads' },
    { id: 'setup', label: 'Setting it up properly' },
    { id: 'mistakes', label: 'Common mistakes' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
