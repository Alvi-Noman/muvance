import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const hireFirstMarketer: BlogPost = {
  slug: 'hire-your-first-marketer',
  title: 'Hiring your first marketer: what to look for and what to avoid',
  description:
    'Generalist or specialist, junior or experienced, employee or agency. How to choose, what to ask in interviews and how to set them up to succeed.',
  category: 'Strategy',
  published: '2026-04-28',
  readMinutes: 6,
  cover: { glyph: 'split', tone: 'from-yellow-200 via-orange-100 to-rose-100', label: 'Hire' },
  toc: [
    { id: 'type', label: 'Generalist or specialist?' },
    { id: 'interview', label: 'Questions worth asking' },
    { id: 'setup', label: 'Setting them up to succeed' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
