import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const jobsToBeDone: BlogPost = {
  slug: 'jobs-to-be-done-ecommerce',
  title: 'Why people really buy: the jobs-to-be-done idea for online brands',
  description:
    'People do not buy products, they hire them to make progress in their lives. A plain explanation of jobs-to-be-done and how it sharpens ads, offers and product pages.',
  category: 'Audience',
  published: '2025-07-02',
  readMinutes: 6,
  cover: { glyph: 'split', tone: 'from-amber-200 via-yellow-100 to-lime-100', label: 'Job' },
  toc: [
    { id: 'job', label: 'Finding the job' },
    { id: 'competitors', label: 'Your real competitors are not who you think' },
    { id: 'use', label: 'Using the job in your marketing' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
