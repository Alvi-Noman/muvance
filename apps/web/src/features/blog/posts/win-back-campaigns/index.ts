import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const winBackCampaigns: BlogPost = {
  slug: 'win-back-campaigns-lapsed-customers',
  title: 'Win-back campaigns: bringing back customers who went quiet',
  description:
    'Customers who bought once and disappeared are cheaper to bring back than new ones are to find. When to reach out, what to say and how much to offer.',
  category: 'Retention',
  published: '2025-03-08',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-orange-200 via-rose-100 to-pink-100', label: '↩' },
  toc: [
    { id: 'when', label: 'When a customer counts as lapsed' },
    { id: 'sequence', label: 'A simple sequence' },
    { id: 'channels', label: 'Channels to use' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
