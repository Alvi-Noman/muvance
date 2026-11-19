import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const videoMarketing: BlogPost = {
  slug: 'video-marketing-small-budget',
  title: 'Video marketing on a small budget: what you need and what you don’t',
  description:
    'A phone, natural light and a plan beat expensive gear. The minimum kit, the shots that matter and a simple workflow for consistent video.',
  category: 'Content',
  published: '2025-04-01',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-red-200 via-rose-100 to-pink-100', label: '▶' },
  toc: [
    { id: 'kit', label: 'The minimum kit' },
    { id: 'shots', label: 'Shots that sell' },
    { id: 'workflow', label: 'A weekly workflow' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
