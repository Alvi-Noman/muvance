import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const competitorAnalysis: BlogPost = {
  slug: 'competitor-analysis-small-brand',
  title: 'Competitor analysis for small brands: learn from them without copying them',
  description:
    'Which competitors to watch, what to look at (ads, prices, reviews, offers), and how to turn what you see into a sharper position.',
  category: 'Strategy',
  published: '2026-05-07',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-zinc-200 via-orange-100 to-red-100', label: 'Rivals' },
  toc: [
    { id: 'who', label: 'Who to watch' },
    { id: 'what', label: 'What to look at' },
    { id: 'gap', label: 'Finding your gap' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
