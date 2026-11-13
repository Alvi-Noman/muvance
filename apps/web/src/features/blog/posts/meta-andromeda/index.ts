import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const metaAndromeda: BlogPost = {
  slug: 'meta-andromeda-campaign-structure',
  title: "How Meta's Andromeda changes the way you should structure campaigns",
  description:
    'Meta rebuilt how it picks which ads people see. What Andromeda is, why creative is now your targeting, and the simple account structure that works with it.',
  category: 'Campaign setup',
  published: '2026-11-14',
  readMinutes: 8,
  cover: { glyph: 'grid', tone: 'from-violet-200 via-indigo-100 to-sky-100', label: 'AI' },
  toc: [
    { id: 'what', label: 'What Andromeda does' },
    { id: 'creative', label: 'Creative is your targeting' },
    { id: 'consolidate', label: 'Consolidate to learn' },
    { id: 'structure', label: 'A structure that works' },
    { id: 'diversity', label: "What 'different' means" },
    { id: 'audit', label: 'Quick account audit' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
