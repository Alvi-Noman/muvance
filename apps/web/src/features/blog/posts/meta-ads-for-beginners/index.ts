import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const metaAdsForBeginners: BlogPost = {
  slug: 'meta-ads-for-beginners-first-campaign',
  title: 'Meta ads for beginners: your first sales campaign, step by step',
  description:
    'What to check before you start, a simple first structure, how much to spend, and how to read the first results.',
  category: 'Campaign setup',
  published: '2025-11-01',
  readMinutes: 7,
  cover: { glyph: 'funnel', tone: 'from-blue-200 via-sky-100 to-cyan-100', label: '1st' },
  toc: [
    { id: 'before', label: 'Before you start' },
    { id: 'setup', label: 'Setting up the campaign' },
    { id: 'budget', label: 'How much to spend at first' },
    { id: 'read', label: 'Reading the first results' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
