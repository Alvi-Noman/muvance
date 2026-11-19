import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const creativeBrief: BlogPost = {
  slug: 'how-to-write-a-creative-brief',
  title: 'How to write a creative brief your team can actually use',
  description:
    'A copy-and-paste brief template for ads, the mistakes that waste money, and how to turn briefs into a library of what works.',
  category: 'Creative',
  published: '2026-11-02',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-neutral-200 via-stone-100 to-amber-100', label: 'Brief' },
  toc: [
    { id: 'template', label: 'The template' },
    { id: 'mistakes', label: 'Brief mistakes that waste money' },
    { id: 'loop', label: 'Close the loop' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
