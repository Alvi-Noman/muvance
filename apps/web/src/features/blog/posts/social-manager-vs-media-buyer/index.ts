import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const socialManagerVsMediaBuyer: BlogPost = {
  slug: 'social-media-manager-vs-media-buyer',
  title: 'Social media manager vs media buyer: who do you actually need?',
  description:
    'Two roles that often get confused. What each one does, what to expect from them and which one to hire first.',
  category: 'Social media',
  published: '2025-07-31',
  readMinutes: 4,
  cover: { glyph: 'split', tone: 'from-stone-200 via-orange-100 to-amber-100', label: '2' },
  toc: [
    { id: 'roles', label: 'What each does' },
    { id: 'first', label: 'Which to hire first' },
    { id: 'together', label: 'Making them work together' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
