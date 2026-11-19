import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const inHouseVsAgency: BlogPost = {
  slug: 'in-house-media-buyer-vs-freelancer-vs-agency',
  title: 'In-house media buyer, freelancer or agency: which should you hire?',
  description:
    'What each option is good at, what usually fits each stage of growth, and a quick check to see if you are ready to hire in-house.',
  category: 'Agencies',
  published: '2026-03-11',
  readMinutes: 6,
  cover: { glyph: 'split', tone: 'from-sky-200 via-indigo-100 to-violet-100', label: '1·2·3' },
  toc: [
    { id: 'compare', label: 'The three options side by side' },
    { id: 'stage', label: 'What usually fits each stage' },
    { id: 'test', label: 'Are you ready to hire in-house?' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
