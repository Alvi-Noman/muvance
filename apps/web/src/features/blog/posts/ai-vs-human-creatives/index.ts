import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const aiVsHumanCreatives: BlogPost = {
  slug: 'can-ai-ad-creatives-beat-human',
  title: 'Can AI-made ad creatives actually beat human-made ones?',
  description:
    'Where AI wins, where people still win, a hybrid workflow that uses both, and ground rules for AI ads.',
  category: 'Creative',
  published: '2026-11-14',
  readMinutes: 6,
  cover: { glyph: 'split', tone: 'from-violet-200 via-purple-100 to-pink-100', label: 'AI' },
  toc: [
    { id: 'split', label: "Who's better at what" },
    { id: 'workflow', label: "The hybrid workflow we'd recommend" },
    { id: 'test', label: 'How to test it fairly' },
    { id: 'rules', label: 'Ground rules for AI ads' },
    { id: 'check', label: 'AI ad quality check' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
