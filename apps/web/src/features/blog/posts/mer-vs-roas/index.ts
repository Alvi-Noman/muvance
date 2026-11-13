import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const merVsRoas: BlogPost = {
  slug: 'mer-vs-roas',
  title: 'MER vs ROAS: why smart brands track both',
  description:
    'The difference between what Meta claims and what your business earned, with a calculator and a weekly routine.',
  category: 'Scaling',
  published: '2026-11-14',
  readMinutes: 6,
  cover: { glyph: 'line', tone: 'from-teal-200 via-cyan-100 to-sky-100', label: 'MER' },
  toc: [
    { id: 'calc', label: 'Work out both for your store' },
    { id: 'why', label: 'Why ROAS can mislead you' },
    { id: 'scaling', label: 'The classic scaling trap' },
    { id: 'routine', label: 'A simple weekly routine' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
