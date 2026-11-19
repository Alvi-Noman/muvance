import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const retargetingCampaigns: BlogPost = {
  slug: 'meta-retargeting-campaigns-ecommerce',
  title: 'Retargeting on Meta: who to show ads to again, and what to show them',
  description:
    'Group warm visitors by how close they came to buying, match the message to each group, and keep budgets and frequency in check.',
  category: 'Campaign setup',
  published: '2025-07-01',
  readMinutes: 6,
  cover: { glyph: 'funnel', tone: 'from-orange-200 via-amber-100 to-yellow-100', label: 'Again' },
  toc: [
    { id: 'who', label: 'Who to retarget' },
    { id: 'what', label: 'What to show each group' },
    { id: 'budget', label: 'How much to spend' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
