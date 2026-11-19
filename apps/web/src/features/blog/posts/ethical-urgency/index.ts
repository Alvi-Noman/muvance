import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const ethicalUrgency: BlogPost = {
  slug: 'ethical-urgency-scarcity',
  title: 'Urgency and scarcity without lying to customers',
  description:
    'Fake countdown timers and “only 2 left” banners damage trust. Real reasons to act now that work just as well, and stay honest.',
  category: 'Conversion',
  published: '2025-08-22',
  readMinutes: 4,
  cover: { glyph: 'line', tone: 'from-red-200 via-amber-100 to-yellow-100', label: '⏱' },
  toc: [
    { id: 'real', label: 'Real reasons to act now' },
    { id: 'fake', label: 'Why fake urgency backfires' },
    { id: 'better', label: 'Often better than urgency' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
