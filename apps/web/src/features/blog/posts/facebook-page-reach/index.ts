import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const facebookPageReach: BlogPost = {
  slug: 'facebook-page-organic-reach',
  title: 'Why your Facebook page reach is so low (and what you can do about it)',
  description:
    'Organic reach on Facebook pages is a fraction of follower count. Why that happens, what still gets seen, and where to spend your effort instead.',
  category: 'Social media',
  published: '2025-04-07',
  readMinutes: 4,
  cover: { glyph: 'bars', tone: 'from-blue-200 via-indigo-100 to-sky-100', label: 'FB' },
  toc: [
    { id: 'why', label: 'Why reach is low' },
    { id: 'what-works', label: 'What still gets seen' },
    { id: 'instead', label: 'Where to put effort instead' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
