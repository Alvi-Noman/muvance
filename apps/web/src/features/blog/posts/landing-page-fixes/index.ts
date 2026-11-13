import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const landingPageFixes: BlogPost = {
  slug: 'landing-page-fixes-ad-clicks-no-sales',
  title: 'People click your ad but do not buy: 10 landing page fixes',
  description:
    'Where ad visitors drop off, why speed matters so much on mobile, what belongs on the first screen, and a 10-point product page audit.',
  category: 'Conversion',
  published: '2026-11-14',
  readMinutes: 7,
  cover: { glyph: 'funnel', tone: 'from-fuchsia-200 via-purple-100 to-indigo-100', label: '10' },
  toc: [
    { id: 'funnel', label: 'Where visitors drop off' },
    { id: 'speed', label: 'Load fast on mobile' },
    { id: 'first-screen', label: 'The first screen' },
    { id: 'fixes', label: 'Fixes 3–10' },
    { id: 'audit', label: 'Score your page' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
