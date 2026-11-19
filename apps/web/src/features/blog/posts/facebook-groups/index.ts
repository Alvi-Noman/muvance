import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const facebookGroups: BlogPost = {
  slug: 'facebook-groups-community-marketing',
  title: 'Facebook groups: building a community around your brand',
  description:
    'Groups get far more engagement than pages. When a brand group makes sense, how to run one without it becoming a spam board, and how it helps sales.',
  category: 'Social media',
  published: '2026-03-31',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-indigo-200 via-blue-100 to-teal-100', label: 'Grp' },
  toc: [
    { id: 'when', label: 'When a group makes sense' },
    { id: 'run', label: 'Running it well' },
    { id: 'value', label: 'How it helps the business' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
