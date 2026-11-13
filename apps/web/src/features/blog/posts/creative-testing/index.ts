import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const creativeTesting: BlogPost = {
  slug: 'how-to-test-meta-ad-creatives',
  title: 'Creative is the new targeting: how to test Meta ad creatives properly',
  description:
    'A simple weekly system for testing ad creatives: concepts vs iterations, how much to spend before judging, and how to read the results.',
  category: 'Creative',
  published: '2026-11-14',
  readMinutes: 9,
  cover: { glyph: 'grid', tone: 'from-rose-200 via-pink-100 to-orange-100', label: 'Test' },
  toc: [
    { id: 'loop', label: 'The testing loop' },
    { id: 'concepts', label: 'Concepts vs iterations' },
    { id: 'hypothesis', label: 'Write a hypothesis' },
    { id: 'budget', label: 'How much to spend' },
    { id: 'read', label: 'Read metrics in order' },
    { id: 'results', label: 'How to read a result' },
    { id: 'cadence', label: 'A weekly routine' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
