import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const cacPaybackPeriod: BlogPost = {
  slug: 'cac-payback-period-ecommerce',
  title: 'Payback period: how long until a new customer pays back what they cost you',
  description:
    'Why payback time matters for cash flow, how to calculate it from your repeat-purchase data, and what a sensible target is for a growing online brand.',
  category: 'Metrics',
  published: '2025-05-24',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-teal-200 via-cyan-100 to-sky-100', label: 'Days' },
  toc: [
    { id: 'what', label: 'What payback means' },
    { id: 'cash', label: 'Why it matters for cash' },
    { id: 'target', label: 'A sensible target' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
