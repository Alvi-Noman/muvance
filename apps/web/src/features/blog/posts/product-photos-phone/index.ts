import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const productPhotosPhone: BlogPost = {
  slug: 'product-photos-that-sell-on-a-phone',
  title: 'Product photos that sell, shot on a phone',
  description:
    'A simple window-light setup, the shots every product needs, and the photo mistakes that lead to returns.',
  category: 'Creative',
  published: '2026-07-20',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-stone-200 via-amber-100 to-yellow-100', label: '📷' },
  toc: [
    { id: 'setup', label: 'The simple setup' },
    { id: 'shots', label: 'The shots every product needs' },
    { id: 'mistakes', label: 'Common mistakes' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
