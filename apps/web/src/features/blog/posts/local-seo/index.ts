import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const localSeo: BlogPost = {
  slug: 'google-business-profile-local-seo',
  title: 'Google Business Profile: getting found on Maps, even as an online brand',
  description:
    'If you have a shop, a pickup point or an office, a Google Business Profile can bring calls, visits and trust. How to set it up and keep it working.',
  category: 'SEO',
  published: '2025-08-21',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-red-200 via-orange-100 to-yellow-100', label: 'Map' },
  toc: [
    { id: 'who', label: 'Who should have one' },
    { id: 'setup', label: 'Setting it up well' },
    { id: 'measure', label: 'What to watch' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
