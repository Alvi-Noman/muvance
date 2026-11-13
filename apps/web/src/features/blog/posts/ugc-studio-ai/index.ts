import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const ugcStudioAi: BlogPost = {
  slug: 'ugc-vs-studio-vs-ai-ads',
  title: 'UGC vs studio vs AI-made ads: which performs best?',
  description:
    'What each style is good at, what it costs, and a simple test to find the right mix for your brand.',
  category: 'Creative',
  published: '2026-11-14',
  readMinutes: 7,
  cover: { glyph: 'grid', tone: 'from-yellow-200 via-amber-100 to-lime-100', label: 'UGC' },
  toc: [
    { id: 'compare', label: 'The three styles at a glance' },
    { id: 'ugc', label: 'Why UGC tends to carry the account' },
    { id: 'studio', label: 'When the studio shoot is worth it' },
    { id: 'ai', label: 'Where AI fits' },
    { id: 'test', label: 'How to find your mix' },
    { id: 'brief', label: 'A quick creator brief checklist' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
