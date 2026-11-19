import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const upsellCrossSell: BlogPost = {
  slug: 'upsell-cross-sell-ecommerce',
  title: 'Upsells and cross-sells that feel helpful, not pushy',
  description:
    'Where to suggest a better version or a matching item, how to price it, and the timing that lifts order value without annoying customers.',
  category: 'Conversion',
  published: '2026-03-12',
  readMinutes: 5,
  cover: { glyph: 'bars', tone: 'from-lime-200 via-emerald-100 to-cyan-100', label: '+' },
  toc: [
    { id: 'types', label: 'Upsell vs cross-sell' },
    { id: 'where', label: 'Where to suggest' },
    { id: 'rules', label: 'Rules that keep it helpful' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
