import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const categoryPagesSeo: BlogPost = {
  slug: 'category-pages-seo-ecommerce',
  title: 'Category pages: the most underrated SEO pages on your store',
  description:
    'People often search for a type of product, not a single item. How to structure, name and write category pages so they rank and convert.',
  category: 'SEO',
  published: '2026-10-27',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-teal-200 via-cyan-100 to-sky-100', label: 'Cat' },
  toc: [
    { id: 'why', label: 'Why category pages matter' },
    { id: 'structure', label: 'Structure that helps' },
    { id: 'text', label: 'Add a little useful text' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
