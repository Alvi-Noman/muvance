import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const brandVsStore: BlogPost = {
  slug: 'build-a-brand-not-just-a-store',
  title: 'Brand vs store: why the brands that last do not just sell products',
  description:
    'The difference between a store and a brand, why brands get cheaper to grow over time, and where a small brand starts.',
  category: 'Brand',
  published: '2025-03-12',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-neutral-200 via-stone-100 to-rose-100', label: 'Brand' },
  toc: [
    { id: 'difference', label: 'Store vs brand' },
    { id: 'cost', label: 'Why brands get cheaper to grow' },
    { id: 'start', label: 'Where a small brand starts' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
