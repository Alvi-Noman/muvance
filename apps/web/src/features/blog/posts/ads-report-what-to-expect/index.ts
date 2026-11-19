import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const adsReportWhatToExpect: BlogPost = {
  slug: 'what-a-good-ads-report-shows',
  title: 'What a good monthly ads report should show you (and what is fluff)',
  description:
    'The business results that belong at the top, the tests and lessons in the middle, and the vanity numbers you can ignore.',
  category: 'Agencies',
  published: '2025-03-29',
  readMinutes: 5,
  cover: { glyph: 'bars', tone: 'from-slate-200 via-zinc-100 to-stone-100', label: 'Report' },
  toc: [
    { id: 'top', label: 'The top of the report: business results' },
    { id: 'middle', label: 'The middle: what we tested and learned' },
    { id: 'fluff', label: 'Signal vs fluff' },
    { id: 'rhythm', label: 'How often to report' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
