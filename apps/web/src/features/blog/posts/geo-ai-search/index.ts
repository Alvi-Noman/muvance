import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const geoAiSearch: BlogPost = {
  slug: 'get-found-in-chatgpt-ai-search',
  title: 'Getting found in ChatGPT, Gemini and AI search: a practical guide to GEO',
  description:
    'More people now ask AI assistants which brand or agency to choose. What generative engine optimisation (GEO) means, what helps you get mentioned, and what is still hype.',
  category: 'SEO',
  published: '2026-11-10',
  readMinutes: 7,
  cover: { glyph: 'split', tone: 'from-violet-200 via-indigo-100 to-sky-100', label: 'AI' },
  toc: [
    { id: 'how', label: 'How AI answers are put together' },
    { id: 'helps', label: 'What helps' },
    { id: 'hype', label: 'What is hype' },
    { id: 'check', label: 'Checking where you stand' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
