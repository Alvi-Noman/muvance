import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const npsCsat: BlogPost = {
  slug: 'nps-and-csat-for-small-brands',
  title: 'NPS and customer satisfaction scores: are they worth it for a small brand?',
  description:
    'What NPS and CSAT measure, how to run them cheaply by SMS or WhatsApp, and how to turn the answers into fixes instead of a number in a slide.',
  category: 'Metrics',
  published: '2025-04-21',
  readMinutes: 5,
  cover: { glyph: 'bars', tone: 'from-green-200 via-teal-100 to-cyan-100', label: '0–10' },
  toc: [
    { id: 'what', label: 'Two common scores' },
    { id: 'run', label: 'Running it cheaply' },
    { id: 'act', label: 'Acting on it' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
