import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const bounceVsEngagementRate: BlogPost = {
  slug: 'bounce-rate-vs-engagement-rate-ga4',
  title: 'Bounce rate vs engagement rate in GA4: what changed and what to watch',
  description:
    'GA4 measures engaged sessions instead of the old bounce rate. What counts as engaged, how to read it for ad traffic, and which pages to fix first.',
  category: 'Metrics',
  published: '2025-09-18',
  readMinutes: 5,
  cover: { glyph: 'funnel', tone: 'from-orange-200 via-red-100 to-pink-100', label: 'GA4' },
  toc: [
    { id: 'definitions', label: 'The definitions' },
    { id: 'read', label: 'Reading it for ad traffic' },
    { id: 'fix', label: 'Where to look first' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
