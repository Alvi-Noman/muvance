import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const ga4ForEcommerce: BlogPost = {
  slug: 'google-analytics-4-for-ecommerce',
  title: 'Google Analytics 4 for online stores: the five reports that matter',
  description:
    'What to check in the setup, the five GA4 reports that answer most questions, and why GA4 and Meta never match.',
  category: 'Tracking',
  published: '2025-04-29',
  readMinutes: 5,
  cover: { glyph: 'bars', tone: 'from-orange-200 via-amber-100 to-yellow-100', label: 'GA4' },
  toc: [
    { id: 'setup', label: 'Check the setup first' },
    { id: 'reports', label: 'The five reports that matter' },
    { id: 'vs-meta', label: 'Why GA4 and Meta disagree' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
