import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const banglaVsEnglishCopy: BlogPost = {
  slug: 'bangla-vs-english-ad-copy',
  title: 'Bangla, English or Banglish: which ad copy works for Bangladeshi buyers?',
  description:
    'The same message three ways, who tends to respond to what, and how to run a fair language test.',
  category: 'Bangladesh',
  published: '2026-11-14',
  readMinutes: 6,
  cover: { glyph: 'grid', tone: 'from-emerald-200 via-green-100 to-lime-100', label: 'বাং' },
  toc: [
    { id: 'examples', label: 'The same message, three ways' },
    { id: 'who', label: 'Who tends to respond to what' },
    { id: 'test', label: 'How to run a language test' },
    { id: 'craft', label: 'Getting Bangla copy right' },
    { id: 'check', label: 'Before you publish' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
