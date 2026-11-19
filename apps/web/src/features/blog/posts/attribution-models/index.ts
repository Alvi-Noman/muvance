import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const attributionModels: BlogPost = {
  slug: 'marketing-attribution-models-explained',
  title: 'Attribution explained: who gets credit for a sale?',
  description:
    'Last click, first click, data-driven, platform-reported. Why every tool shows different numbers, and a practical way to decide where your sales come from.',
  category: 'Metrics',
  published: '2025-05-17',
  readMinutes: 6,
  cover: { glyph: 'split', tone: 'from-fuchsia-200 via-pink-100 to-rose-100', label: 'Credit' },
  toc: [
    { id: 'models', label: 'The common models' },
    { id: 'why-differ', label: 'Why the numbers never match' },
    { id: 'practical', label: 'A practical approach' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
