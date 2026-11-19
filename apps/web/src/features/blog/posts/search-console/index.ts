import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const searchConsole: BlogPost = {
  slug: 'google-search-console-beginners',
  title: 'Google Search Console for beginners: the four reports worth checking',
  description:
    'Set up Search Console in fifteen minutes and learn the reports that show what people search, which pages are indexed and what is broken.',
  category: 'SEO',
  published: '2025-09-06',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-sky-200 via-indigo-100 to-violet-100', label: 'GSC' },
  toc: [
    { id: 'setup', label: 'Setting it up' },
    { id: 'reports', label: 'The four reports that matter' },
    { id: 'quick-win', label: 'A quick win to try' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
