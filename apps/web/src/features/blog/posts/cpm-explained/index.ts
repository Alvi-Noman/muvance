import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const cpmExplained: BlogPost = {
  slug: 'cpm-explained-why-ad-costs-change',
  title: 'CPM explained: why the cost of reaching people goes up and down',
  description:
    'What CPM is, why it jumps during Eid and 11.11, what you can and cannot control, and why a cheap CPM is not always a good sign.',
  category: 'Metrics',
  published: '2026-08-03',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-stone-200 via-amber-100 to-orange-100', label: 'CPM' },
  toc: [
    { id: 'why', label: 'Why it changes' },
    { id: 'control', label: 'What you can influence' },
    { id: 'cheap', label: 'Cheap CPM is not the goal' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
