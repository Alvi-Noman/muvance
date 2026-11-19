import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const adAccountRestricted: BlogPost = {
  slug: 'meta-ad-account-restricted-what-to-do',
  title: 'Ad account restricted or disabled: what to do, step by step',
  description:
    'Find out exactly what is restricted, fix the cause, request a review the right way, and lower the risk next time.',
  category: 'Campaign setup',
  published: '2026-06-26',
  readMinutes: 6,
  cover: { glyph: 'split', tone: 'from-red-200 via-rose-100 to-pink-100', label: '!' },
  toc: [
    { id: 'first', label: 'First, find out what is actually restricted' },
    { id: 'fix', label: 'Fix the cause, then ask for a review' },
    { id: 'prevent', label: 'How to avoid it next time' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
