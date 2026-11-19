import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const productPageSeo: BlogPost = {
  slug: 'product-page-seo-guide',
  title: 'Product page SEO: getting individual products found on Google',
  description:
    'Titles, descriptions, images, reviews and structured data for product pages. The changes that help Google understand and rank what you sell.',
  category: 'SEO',
  published: '2026-05-14',
  readMinutes: 6,
  cover: { glyph: 'grid', tone: 'from-lime-200 via-emerald-100 to-teal-100', label: 'Item' },
  toc: [
    { id: 'checklist', label: 'The product page checklist' },
    { id: 'titles', label: 'Writing titles people click' },
    { id: 'unique', label: 'Why copied descriptions hurt' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
