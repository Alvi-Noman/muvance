import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const campaignObjectives: BlogPost = {
  slug: 'which-meta-campaign-objective',
  title: 'Sales, traffic or engagement: which Meta campaign objective should you choose?',
  description:
    'Which objective fits which goal, why cheap clicks can mean expensive sales, and what to do if you cannot track purchases yet.',
  category: 'Campaign setup',
  published: '2026-04-29',
  readMinutes: 5,
  cover: { glyph: 'bars', tone: 'from-violet-200 via-indigo-100 to-blue-100', label: 'Goal' },
  toc: [
    { id: 'which', label: 'Which objective for which goal' },
    { id: 'cheap-clicks', label: 'The trap of cheap clicks' },
    { id: 'no-purchase', label: 'What if you cannot track purchases yet?' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
