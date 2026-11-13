import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const eventMatchQuality: BlogPost = {
  slug: 'improve-event-match-quality',
  title: 'What is Event Match Quality, and how do you raise it?',
  description:
    'Why your score is low, which customer details matter most, and how to format Bangladeshi phone numbers correctly.',
  category: 'Tracking',
  published: '2026-11-14',
  readMinutes: 7,
  cover: { glyph: 'funnel', tone: 'from-slate-200 via-zinc-100 to-sky-100', label: 'EMQ' },
  toc: [
    { id: 'where', label: 'Where to find it' },
    { id: 'why-low', label: 'Why scores end up low' },
    { id: 'params', label: 'The details that matter most' },
    { id: 'phone', label: 'Getting Bangladeshi phone numbers right' },
    { id: 'fix', label: 'A step-by-step fix' },
    { id: 'check', label: 'EMQ checklist' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
