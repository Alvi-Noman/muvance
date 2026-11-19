import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const boostPostVsAdsManager: BlogPost = {
  slug: 'boost-post-vs-ads-manager',
  title: 'Boost post vs Ads Manager: why boosting rarely brings sales',
  description:
    'What boosting optimises for, why likes do not equal orders, and when boosting is still fine.',
  category: 'Campaign setup',
  published: '2025-01-16',
  readMinutes: 5,
  cover: { glyph: 'funnel', tone: 'from-indigo-200 via-blue-100 to-sky-100', label: 'Boost' },
  toc: [
    { id: 'difference', label: 'What actually differs' },
    { id: 'why', label: 'Why engagement does not equal sales' },
    { id: 'when', label: 'When boosting is fine' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
