import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const earnBacklinks: BlogPost = {
  slug: 'earn-backlinks-small-brand',
  title: 'Earning links to your site without buying them',
  description:
    'Links from other websites are still one of the strongest trust signals. Practical, safe ways for a small brand in Bangladesh to earn them.',
  category: 'SEO',
  published: '2026-10-25',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-blue-200 via-cyan-100 to-teal-100', label: '↗' },
  toc: [
    { id: 'ideas', label: 'Ideas that work for small brands' },
    { id: 'avoid', label: 'What to avoid' },
    { id: 'mentions', label: 'Mentions count too' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
