import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const abTestingLandingPages: BlogPost = {
  slug: 'ab-testing-landing-pages',
  title: 'A/B testing your store pages: what to test first',
  description:
    'Small stores can test pages too. Which changes are worth testing, how to split traffic and how long to wait before deciding.',
  category: 'Conversion',
  published: '2025-11-03',
  readMinutes: 5,
  cover: { glyph: 'split', tone: 'from-indigo-200 via-sky-100 to-lime-100', label: 'A|B' },
  toc: [
    { id: 'what', label: 'What to test first' },
    { id: 'how', label: 'How to split traffic' },
    { id: 'decide', label: 'Deciding' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
