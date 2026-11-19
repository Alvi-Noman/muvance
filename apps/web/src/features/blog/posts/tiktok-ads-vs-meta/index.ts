import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const tiktokAdsVsMeta: BlogPost = {
  slug: 'tiktok-ads-vs-meta-ads',
  title: 'TikTok ads vs Meta ads: where should your next taka go?',
  description:
    'How the two platforms differ for eCommerce: audience, creative, costs, tracking and when it makes sense to add TikTok alongside Meta.',
  category: 'Social media',
  published: '2025-01-18',
  readMinutes: 6,
  cover: { glyph: 'split', tone: 'from-cyan-200 via-slate-100 to-rose-100', label: 'TT/M' },
  toc: [
    { id: 'compare', label: 'How they compare' },
    { id: 'when', label: 'When to add TikTok' },
    { id: 'judge', label: 'How to judge the test' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
