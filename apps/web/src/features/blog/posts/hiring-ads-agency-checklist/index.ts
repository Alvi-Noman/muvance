import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const hiringAdsAgencyChecklist: BlogPost = {
  slug: 'what-to-check-before-hiring-meta-ads-agency',
  title: 'What to check before hiring a Meta ads agency or freelancer',
  description:
    'Red flags, green flags, how to structure a fair trial, and the questions to ask before you sign anything.',
  category: 'Agencies',
  published: '2026-11-14',
  readMinutes: 6,
  cover: { glyph: 'grid', tone: 'from-stone-200 via-amber-100 to-orange-100', label: '?' },
  toc: [
    { id: 'options', label: 'Agency, freelancer or in-house?' },
    { id: 'flags', label: 'Green flags and red flags' },
    { id: 'trial', label: 'How to structure a fair trial' },
    { id: 'questions', label: 'Questions to ask before you sign' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
