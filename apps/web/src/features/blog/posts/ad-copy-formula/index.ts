import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const adCopyFormula: BlogPost = {
  slug: 'meta-ad-copy-formula',
  title: 'Ad copy that sells: a simple formula for text, headline and button',
  description:
    'What each part of a Meta ad’s text is for, a four-step formula, and the same product written weakly and well.',
  category: 'Creative',
  published: '2025-02-05',
  readMinutes: 5,
  cover: { glyph: 'split', tone: 'from-sky-200 via-cyan-100 to-teal-100', label: 'Aa' },
  toc: [
    { id: 'formula', label: 'The formula for primary text' },
    { id: 'example', label: 'One product, written well and badly' },
    { id: 'headline', label: 'Headlines and buttons' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
