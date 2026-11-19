import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const seoBasicsEcommerce: BlogPost = {
  slug: 'seo-for-online-stores-where-to-start',
  title: 'SEO for online stores: where to start when you have no time',
  description:
    'A realistic SEO plan for a small Bangladeshi online store: the few things that matter first, what can wait, and how long it takes to see results.',
  category: 'SEO',
  published: '2025-06-21',
  readMinutes: 7,
  cover: { glyph: 'line', tone: 'from-green-200 via-lime-100 to-yellow-100', label: 'SEO' },
  toc: [
    { id: 'order', label: 'The order we would do things in' },
    { id: 'time', label: 'How long it takes' },
    { id: 'skip', label: 'What can wait' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
