import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const becomeMediaBuyer: BlogPost = {
  slug: 'how-to-become-a-media-buyer-bangladesh',
  title: 'How to become a media buyer in Bangladesh: skills, path and practice',
  description:
    'What the job really involves, a realistic learning path, the skills that matter most, and how to get real practice.',
  category: 'Growth',
  published: '2026-04-26',
  readMinutes: 6,
  cover: { glyph: 'funnel', tone: 'from-violet-200 via-purple-100 to-fuchsia-100', label: 'Learn' },
  toc: [
    { id: 'path', label: 'A realistic learning path' },
    { id: 'skills', label: 'Skills that matter most' },
    { id: 'practice', label: 'How to get real practice' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
