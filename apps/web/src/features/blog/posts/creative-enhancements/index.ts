import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const creativeEnhancements: BlogPost = {
  slug: 'advantage-plus-creative-enhancements',
  title: 'Advantage+ creative enhancements: when to trust them and when to turn them off',
  description:
    'What each automatic enhancement does to your ads, where they help, where they hurt, and how to review them.',
  category: 'Creative',
  published: '2026-11-14',
  readMinutes: 6,
  cover: { glyph: 'grid', tone: 'from-pink-200 via-rose-100 to-orange-100', label: 'Auto' },
  toc: [
    { id: 'types', label: 'The main types of enhancements' },
    { id: 'risks', label: 'Where they help and where they hurt' },
    { id: 'test', label: 'How to decide for your account' },
    { id: 'check', label: 'Your review routine' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
