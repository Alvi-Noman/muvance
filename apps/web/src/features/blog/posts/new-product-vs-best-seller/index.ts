import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const newProductVsBestSeller: BlogPost = {
  slug: 'launch-new-product-or-push-best-seller',
  title: 'Launch a new product or push your best seller?',
  description:
    'Signs that point each way, ways to squeeze more growth from a winner, and a checklist before launching something new.',
  category: 'Scaling',
  published: '2025-02-18',
  readMinutes: 5,
  cover: { glyph: 'split', tone: 'from-yellow-200 via-lime-100 to-green-100', label: 'New?' },
  toc: [
    { id: 'decide', label: 'Push or launch?' },
    { id: 'squeeze', label: 'Ways to squeeze more from a winner' },
    { id: 'launch', label: 'If you launch, launch carefully' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
