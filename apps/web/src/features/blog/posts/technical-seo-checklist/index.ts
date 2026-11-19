import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const technicalSeoChecklist: BlogPost = {
  slug: 'technical-seo-checklist-small-store',
  title: 'A technical SEO checklist for small stores (no developer jargon)',
  description:
    'The technical basics that stop Google finding or trusting your pages: indexing, speed, mobile, duplicates, redirects and broken links, explained simply.',
  category: 'SEO',
  published: '2025-01-27',
  readMinutes: 6,
  cover: { glyph: 'grid', tone: 'from-slate-200 via-gray-100 to-zinc-100', label: '</>' },
  toc: [
    { id: 'checklist', label: 'The checklist' },
    { id: 'speed', label: 'Speed: what usually helps' },
    { id: 'duplicates', label: 'Duplicates and redirects' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
