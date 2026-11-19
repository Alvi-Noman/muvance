import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const brandVoice: BlogPost = {
  slug: 'find-your-brand-voice',
  title: 'Finding your brand voice: sound like someone, not everyone',
  description:
    'A brand voice is how you sound in captions, ads, replies and packaging. A quick way to define yours and keep it consistent across a team.',
  category: 'Content',
  published: '2026-08-13',
  readMinutes: 4,
  cover: { glyph: 'line', tone: 'from-indigo-200 via-purple-100 to-pink-100', label: 'Voice' },
  toc: [
    { id: 'define', label: 'Define it in three pairs' },
    { id: 'apply', label: 'Where it shows up' },
    { id: 'language', label: 'Choosing your language' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
