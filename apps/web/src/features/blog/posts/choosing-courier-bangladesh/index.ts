import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const choosingCourierBangladesh: BlogPost = {
  slug: 'choosing-a-courier-service-bangladesh',
  title: 'Choosing a courier in Bangladesh: what to compare and what to ask',
  description:
    'The factors that matter more than price per parcel, how to run a fair trial, and a checklist before you sign.',
  category: 'Operations',
  published: '2026-04-14',
  readMinutes: 5,
  cover: { glyph: 'funnel', tone: 'from-stone-200 via-orange-100 to-amber-100', label: '🚚' },
  toc: [
    { id: 'compare', label: 'What to compare' },
    { id: 'test', label: 'Run a small trial' },
    { id: 'check', label: 'Before you sign' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
