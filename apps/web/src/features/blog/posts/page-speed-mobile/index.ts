import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const pageSpeedMobile: BlogPost = {
  slug: 'product-page-speed-mobile',
  title: 'How fast does a product page need to load on mobile data?',
  description:
    "Google's speed targets, a quick reality check for your page, what makes pages heavy, and fixes in order of impact.",
  category: 'Conversion',
  published: '2026-11-14',
  readMinutes: 6,
  cover: { glyph: 'bars', tone: 'from-fuchsia-200 via-pink-100 to-rose-100', label: '2.5s' },
  toc: [
    { id: 'targets', label: 'How fast is fast enough?' },
    { id: 'calc', label: 'Quick reality check' },
    { id: 'weight', label: 'What usually makes a product page heavy' },
    { id: 'fixes', label: 'Fixes, in order of impact' },
    { id: 'check', label: 'Speed checklist' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
