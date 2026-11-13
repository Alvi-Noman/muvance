import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const capiSetup: BlogPost = {
  slug: 'meta-pixel-conversions-api-setup',
  title: 'How to set up Meta Pixel and Conversions API correctly, step by step',
  description:
    'Why the Pixel alone is not enough, which setup method fits your store, the exact data to send, and a go-live checklist.',
  category: 'Tracking',
  published: '2026-11-14',
  readMinutes: 10,
  cover: { glyph: 'funnel', tone: 'from-slate-200 via-sky-100 to-indigo-100', label: 'CAPI' },
  toc: [
    { id: 'how', label: 'How they work together' },
    { id: 'options', label: 'Pick your setup method' },
    { id: 'steps', label: 'Step-by-step setup' },
    { id: 'payload', label: 'A good Purchase event' },
    { id: 'emq', label: 'Raise Event Match Quality' },
    { id: 'golive', label: 'Go-live checklist' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
