import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const privacyFirstMarketing: BlogPost = {
  slug: 'privacy-first-marketing-tracking',
  title: 'Privacy-first marketing: tracking that still works as browsers and phones block more',
  description:
    'Ad blockers, iOS privacy changes and cookie limits make tracking less complete. What still works: server-side events, first-party data and better measurement habits.',
  category: 'Strategy',
  published: '2026-05-31',
  readMinutes: 6,
  cover: { glyph: 'line', tone: 'from-slate-200 via-teal-100 to-emerald-100', label: 'Priv' },
  toc: [
    { id: 'why', label: 'Why tracking got weaker' },
    { id: 'works', label: 'What still works' },
    { id: 'respect', label: 'Respecting privacy' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
