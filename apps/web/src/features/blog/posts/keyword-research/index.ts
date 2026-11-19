import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const keywordResearch: BlogPost = {
  slug: 'keyword-research-bangla-english',
  title: 'Keyword research in Bangla, English and Banglish: finding what your customers type',
  description:
    'Free ways to find the words people use to search for your products, how to handle mixed-language searches, and how to choose which keywords to target.',
  category: 'SEO',
  published: '2026-02-22',
  readMinutes: 6,
  cover: { glyph: 'bars', tone: 'from-yellow-200 via-lime-100 to-green-100', label: 'Aa' },
  toc: [
    { id: 'sources', label: 'Free places to find keywords' },
    { id: 'languages', label: 'Handling three languages' },
    { id: 'choose', label: 'Choosing which to target' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
