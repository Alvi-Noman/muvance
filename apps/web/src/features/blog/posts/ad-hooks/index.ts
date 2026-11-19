import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const adHooks: BlogPost = {
  slug: 'ad-hooks-that-stop-the-scroll',
  title: 'Ad hooks that stop the scroll, with Bangla examples',
  description:
    'Eight hook patterns that work for online stores, how language changes a hook, and how to test hooks properly.',
  category: 'Creative',
  published: '2025-01-06',
  readMinutes: 6,
  cover: { glyph: 'split', tone: 'from-pink-200 via-fuchsia-100 to-violet-100', label: 'Hook' },
  toc: [
    { id: 'patterns', label: 'Hook patterns that work' },
    { id: 'bangla', label: 'Bangla, English or Banglish hooks' },
    { id: 'test', label: 'How to test hooks properly' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
