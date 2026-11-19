import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const agencyFirstCallQuestions: BlogPost = {
  slug: 'questions-to-ask-ads-agency',
  title: '12 questions to ask on your first call with an ads agency',
  description:
    'Questions about people, process, money and proof that separate serious agencies from the rest, plus a scorecard for after the call.',
  category: 'Agencies',
  published: '2025-06-20',
  readMinutes: 6,
  cover: { glyph: 'grid', tone: 'from-rose-200 via-orange-100 to-amber-100', label: '12?' },
  toc: [
    { id: 'people', label: 'About the people' },
    { id: 'process', label: 'About the process' },
    { id: 'pay', label: 'About money' },
    { id: 'proof', label: 'About proof and honesty' },
    { id: 'score', label: 'Score the call' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
