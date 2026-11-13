import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const seasonalPerformanceBangladesh: BlogPost = {
  slug: 'meta-ads-eid-seasonal-performance',
  title: 'Why ads perform worse (or better) in some months: Eid, Boishakh and sale season',
  description:
    'The yearly rhythm of ad costs in Bangladesh, courier cut-offs, and a playbook for every big season.',
  category: 'Bangladesh',
  published: '2026-11-14',
  readMinutes: 7,
  cover: { glyph: 'line', tone: 'from-rose-200 via-red-100 to-amber-100', label: 'Eid' },
  toc: [
    { id: 'year', label: 'What a typical year can look like' },
    { id: 'calendar', label: 'The moments that matter' },
    { id: 'plan', label: 'A simple season playbook' },
    { id: 'check', label: 'Pre-Eid checklist' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
