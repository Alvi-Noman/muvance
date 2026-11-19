import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const postPurchaseSurvey: BlogPost = {
  slug: 'post-purchase-survey-questions',
  title: 'The post-purchase survey: three questions that tell you where sales really come from',
  description:
    'A tiny survey after checkout or delivery can reveal which channels drive sales, why people buy and what nearly stopped them. Here is what to ask and how to read it.',
  category: 'Audience',
  published: '2026-10-17',
  readMinutes: 5,
  cover: { glyph: 'bars', tone: 'from-indigo-200 via-violet-100 to-purple-100', label: '3Q' },
  toc: [
    { id: 'questions', label: 'The three questions' },
    { id: 'where', label: 'Where to ask' },
    { id: 'read', label: 'Reading the results' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
