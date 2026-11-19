import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const founderLedContent: BlogPost = {
  slug: 'founder-led-content',
  title: 'Founder-led content: why your face may be your best marketing asset',
  description:
    'Customers trust people more than logos. How founders can show up on camera without it eating their week, and what to talk about.',
  category: 'Content',
  published: '2025-04-15',
  readMinutes: 5,
  cover: { glyph: 'split', tone: 'from-amber-200 via-yellow-100 to-lime-100', label: 'Me' },
  toc: [
    { id: 'why', label: 'Why it works' },
    { id: 'topics', label: 'What to talk about' },
    { id: 'time', label: 'Keeping it to an hour a week' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
