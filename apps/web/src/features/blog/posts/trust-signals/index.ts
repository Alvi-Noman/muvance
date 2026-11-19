import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const trustSignals: BlogPost = {
  slug: 'trust-signals-new-online-store',
  title: 'Trust signals for a new online store: why strangers should believe you',
  description:
    'Shoppers have been burned by fake pages and wrong products. The signals that make a new store feel safe, from reviews to a real phone number.',
  category: 'Conversion',
  published: '2025-05-31',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-emerald-200 via-sky-100 to-slate-100', label: '✓' },
  toc: [
    { id: 'signals', label: 'Signals that build trust' },
    { id: 'where', label: 'Where to show them' },
    { id: 'early', label: 'Getting your first reviews' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
