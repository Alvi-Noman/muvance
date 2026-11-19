import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const metaAdLibrary: BlogPost = {
  slug: 'meta-ad-library-competitor-research',
  title: 'Using the Meta Ad Library to learn from competitors',
  description:
    'Every active ad on Facebook and Instagram is public. How to search the Ad Library, spot ads that are working and turn what you see into your own ideas.',
  category: 'Audience',
  published: '2026-07-16',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-blue-200 via-slate-100 to-zinc-100', label: 'Lib' },
  toc: [
    { id: 'how', label: 'How to search it' },
    { id: 'signals', label: 'Spotting ads that probably work' },
    { id: 'use', label: 'Using it without copying' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
