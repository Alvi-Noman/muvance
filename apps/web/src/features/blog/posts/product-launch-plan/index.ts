import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const productLaunchPlan: BlogPost = {
  slug: 'product-launch-plan',
  title: 'Launching a new product: a four-week plan',
  description:
    'Build interest before launch day, sell to warm customers first, then scale. A practical week-by-week plan for small brands.',
  category: 'Strategy',
  published: '2025-03-07',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-fuchsia-200 via-rose-100 to-amber-100', label: 'New' },
  toc: [
    { id: 'plan', label: 'The four weeks' },
    { id: 'curve', label: 'What a launch often looks like' },
    { id: 'ready', label: 'Before you launch' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
