import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const fullFunnelMarketing: BlogPost = {
  slug: 'full-funnel-marketing-explained',
  title: 'Full-funnel marketing explained (without the jargon)',
  description:
    'Reach new people, help them decide, get the order, bring them back. How the stages fit together and why only fishing at the bottom stops working.',
  category: 'Strategy',
  published: '2025-05-13',
  readMinutes: 5,
  cover: { glyph: 'funnel', tone: 'from-violet-200 via-purple-100 to-fuchsia-100', label: 'TOF' },
  toc: [
    { id: 'stages', label: 'The stages' },
    { id: 'why', label: 'Why bottom-only stops working' },
    { id: 'today', label: 'Full funnel with today’s ad platforms' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
