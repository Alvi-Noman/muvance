import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const readingCommentsForInsight: BlogPost = {
  slug: 'customer-research-from-comments-and-messages',
  title: 'Your inbox is a research goldmine: turning comments and messages into better ads',
  description:
    'How to collect, tag and use the questions and complaints customers already send you, so your next ads answer them before they are asked.',
  category: 'Audience',
  published: '2025-04-01',
  readMinutes: 5,
  cover: { glyph: 'bars', tone: 'from-sky-200 via-cyan-100 to-teal-100', label: 'DM' },
  toc: [
    { id: 'collect', label: 'Collect a week of messages' },
    { id: 'tag', label: 'Tag it by topic' },
    { id: 'act', label: 'Fix the gap, then make the ad' },
    { id: 'faq', label: 'Questions we get about this' },
  ],
  ...lazyBody(() => import('./Body')),
};
