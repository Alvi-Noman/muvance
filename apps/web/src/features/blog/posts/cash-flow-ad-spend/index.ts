import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const cashFlowAdSpend: BlogPost = {
  slug: 'cash-flow-and-ad-spend',
  title: 'Cash flow and ad spend: how to grow without running out of money',
  description:
    'Why profitable stores run short of cash while scaling, how to work out your cash cycle, and ways to shorten it.',
  category: 'Scaling',
  published: '2025-10-29',
  readMinutes: 6,
  cover: { glyph: 'line', tone: 'from-teal-200 via-cyan-100 to-sky-100', label: 'Cash' },
  toc: [
    { id: 'gap', label: 'The cash gap, drawn' },
    { id: 'cycle', label: 'Work out your cash cycle' },
    { id: 'shorten', label: 'How to shorten the gap' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
