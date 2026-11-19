import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const scalingTo1LakhADay: BlogPost = {
  slug: 'scaling-meta-ads-to-1-lakh-a-day',
  title: 'Going from ৳10,000 to ৳1,00,000 a day: what has to change',
  description:
    'Why costs rise with spend, what creative, products, operations and cash need at each level, and how to step up safely.',
  category: 'Scaling',
  published: '2026-10-06',
  readMinutes: 7,
  cover: { glyph: 'line', tone: 'from-sky-200 via-indigo-100 to-violet-100', label: '10×' },
  toc: [
    { id: 'curve', label: 'What happens to costs as you scale' },
    { id: 'what-changes', label: 'What has to change at each level' },
    { id: 'how', label: 'How to step up safely' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
