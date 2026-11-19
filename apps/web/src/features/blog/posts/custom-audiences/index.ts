import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const customAudiences: BlogPost = {
  slug: 'meta-custom-and-lookalike-audiences',
  title: 'Custom and lookalike audiences: how they still help, even with broad targeting',
  description:
    'Meta now finds buyers well without detailed targeting. Where custom and lookalike audiences still earn their place: exclusions, retargeting, signals and testing.',
  category: 'Audience',
  published: '2026-06-22',
  readMinutes: 6,
  cover: { glyph: 'grid', tone: 'from-blue-200 via-sky-100 to-cyan-100', label: 'LAL' },
  toc: [
    { id: 'types', label: 'The audiences you can build' },
    { id: 'today', label: 'Where they help today' },
    { id: 'broad', label: 'Lookalike vs broad: what we often see' },
    { id: 'quality', label: 'Feeding good seed data' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
