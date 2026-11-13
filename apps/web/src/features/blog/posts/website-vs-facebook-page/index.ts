import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const websiteVsFacebookPage: BlogPost = {
  slug: 'website-vs-facebook-page-bangladesh',
  title: 'Should Bangladeshi brands sell from a website or a Facebook page?',
  description:
    'What a page does well, when it starts holding you back, and how to move to a website without losing sales.',
  category: 'Bangladesh',
  published: '2026-11-14',
  readMinutes: 6,
  cover: { glyph: 'split', tone: 'from-sky-200 via-blue-100 to-violet-100', label: 'Web' },
  toc: [
    { id: 'compare', label: 'Page vs website' },
    { id: 'when', label: "Signs it's time for a website" },
    { id: 'move', label: 'How to move without losing sales' },
    { id: 'check', label: 'Website launch checklist' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
