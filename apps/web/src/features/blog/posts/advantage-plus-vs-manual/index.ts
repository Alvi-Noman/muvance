import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const advantagePlusVsManual: BlogPost = {
  slug: 'advantage-plus-sales-vs-manual-campaigns',
  title: 'Advantage+ sales campaigns vs manual campaigns: which wins for eCommerce?',
  description:
    'What Advantage+ automates, when it beats a manual setup, what to watch inside it, and how to test the two fairly.',
  category: 'Campaign setup',
  published: '2026-11-14',
  readMinutes: 7,
  cover: { glyph: 'split', tone: 'from-indigo-200 via-violet-100 to-fuchsia-100', label: 'A+' },
  toc: [
    { id: 'difference', label: 'What you control in each' },
    { id: 'when', label: 'When each one wins' },
    { id: 'results', label: 'What a typical head-to-head looks like' },
    { id: 'watch', label: 'What to watch inside Advantage+' },
    { id: 'test', label: 'How to test it fairly' },
    { id: 'ready', label: 'Is your account ready?' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
