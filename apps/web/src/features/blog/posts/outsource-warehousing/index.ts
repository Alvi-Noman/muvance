import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const outsourceWarehousing: BlogPost = {
  slug: 'when-to-outsource-warehousing-fulfilment',
  title: 'When should a small brand outsource warehousing and packing?',
  description:
    'In-house vs outsourced fulfilment, signs you are ready, and how to move over without losing stock or customers.',
  category: 'Operations',
  published: '2026-01-07',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-slate-200 via-stone-100 to-amber-100', label: '📦' },
  toc: [
    { id: 'compare', label: 'In-house vs outsourced' },
    { id: 'ready', label: 'Are you ready to outsource?' },
    { id: 'how', label: 'Moving over smoothly' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
