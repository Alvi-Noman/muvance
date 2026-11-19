import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const utmParameters: BlogPost = {
  slug: 'utm-parameters-for-meta-ads',
  title: 'UTM parameters for Meta ads: set them once, read results everywhere',
  description:
    'What each UTM part means, a copy-and-paste setup with dynamic values, and what you can do with the data.',
  category: 'Tracking',
  published: '2025-03-15',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-slate-200 via-sky-100 to-cyan-100', label: 'utm' },
  toc: [
    { id: 'parts', label: 'The five parts' },
    { id: 'copy', label: 'Copy-and-paste setup' },
    { id: 'use', label: 'What you can do with them' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
