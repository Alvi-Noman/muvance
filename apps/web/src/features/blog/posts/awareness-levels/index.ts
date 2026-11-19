import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const awarenessLevels: BlogPost = {
  slug: 'customer-awareness-levels-ads',
  title: 'The five stages of customer awareness, and which ad to show at each',
  description:
    'Someone who has never heard of your problem needs a very different ad from someone comparing prices. A simple map of the five awareness stages, with examples.',
  category: 'Audience',
  published: '2025-05-16',
  readMinutes: 6,
  cover: { glyph: 'funnel', tone: 'from-violet-200 via-fuchsia-100 to-pink-100', label: '1→5' },
  toc: [
    { id: 'ladder', label: 'The ladder' },
    { id: 'messages', label: 'What to say at each stage' },
    { id: 'mix', label: 'A healthy mix' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
