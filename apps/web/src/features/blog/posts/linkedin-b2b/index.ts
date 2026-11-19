import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const linkedinB2b: BlogPost = {
  slug: 'linkedin-for-b2b-bangladesh',
  title: 'LinkedIn for B2B brands in Bangladesh: what to post and who should post it',
  description:
    'If you sell to businesses, LinkedIn is where buyers pay attention. Why personal profiles beat company pages, and a simple posting plan.',
  category: 'Social media',
  published: '2026-08-26',
  readMinutes: 5,
  cover: { glyph: 'bars', tone: 'from-sky-200 via-blue-100 to-slate-100', label: 'in' },
  toc: [
    { id: 'who', label: 'Who it is for' },
    { id: 'post', label: 'What to post' },
    { id: 'plan', label: 'A simple plan' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
