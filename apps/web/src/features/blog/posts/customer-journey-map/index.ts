import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const customerJourneyMap: BlogPost = {
  slug: 'customer-journey-map-ecommerce',
  title: 'Mapping the customer journey, from first scroll to second order',
  description:
    'A simple way to draw your customer’s path, spot where people drop off and decide what to fix first. With an example for a Bangladeshi online store.',
  category: 'Audience',
  published: '2025-08-09',
  readMinutes: 6,
  cover: { glyph: 'funnel', tone: 'from-teal-200 via-emerald-100 to-green-100', label: 'Map' },
  toc: [
    { id: 'stages', label: 'The stages' },
    { id: 'drop', label: 'Where people drop off' },
    { id: 'feel', label: 'Add what the customer feels' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
