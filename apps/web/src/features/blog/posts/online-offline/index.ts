import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const onlineOffline: BlogPost = {
  slug: 'online-and-offline-together',
  title: 'Online and offline together: getting more from a physical shop',
  description:
    'If you have a showroom or stall, it can feed your online sales and the other way round. Practical ways to connect the two.',
  category: 'Strategy',
  published: '2026-04-13',
  readMinutes: 4,
  cover: { glyph: 'split', tone: 'from-amber-200 via-stone-100 to-teal-100', label: '⇄' },
  toc: [
    { id: 'ideas', label: 'Ways to connect them' },
    { id: 'measure', label: 'Measuring the effect' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
