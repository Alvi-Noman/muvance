import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const hookHoldRate: BlogPost = {
  slug: 'hook-rate-hold-rate-benchmarks',
  title: 'Hook rate and hold rate: what they are and what good looks like',
  description:
    'The two video metrics that show exactly where your ad loses people, how to add them to Ads Manager, and how to fix each problem.',
  category: 'Creative',
  published: '2026-11-14',
  readMinutes: 7,
  cover: { glyph: 'line', tone: 'from-emerald-200 via-teal-100 to-lime-100', label: '3s' },
  toc: [
    { id: 'definitions', label: 'What they measure' },
    { id: 'setup', label: 'Add them to Ads Manager' },
    { id: 'curve', label: 'Read the retention curve' },
    { id: 'benchmarks', label: 'What counts as good' },
    { id: 'diagnose', label: 'Diagnose your ad' },
    { id: 'hooks', label: 'Hook styles to test' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
