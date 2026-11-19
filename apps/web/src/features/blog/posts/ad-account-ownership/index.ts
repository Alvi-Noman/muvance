import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const adAccountOwnership: BlogPost = {
  slug: 'who-should-own-your-ad-account',
  title: 'Who should own your ad account, Pixel and page?',
  description:
    'What your business should own, how to give an agency access without giving away control, and a five-minute ownership check.',
  category: 'Agencies',
  published: '2025-10-04',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-red-200 via-rose-100 to-orange-100', label: 'Own' },
  toc: [
    { id: 'what', label: 'What you should own' },
    { id: 'how', label: 'How to give an agency access the right way' },
    { id: 'check', label: 'Five-minute ownership check' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
