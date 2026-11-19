import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const structuredData: BlogPost = {
  slug: 'structured-data-online-store',
  title: 'Structured data for online stores: labels that help Google and AI understand you',
  description:
    'What schema markup is, which types matter for a store (Product, Organization, FAQ, Breadcrumb), and how to check it is working.',
  category: 'SEO',
  published: '2025-08-22',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-cyan-200 via-teal-100 to-emerald-100', label: '{ }' },
  toc: [
    { id: 'types', label: 'The types that matter most' },
    { id: 'example', label: 'What it looks like' },
    { id: 'check', label: 'Checking it works' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
