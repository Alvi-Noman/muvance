import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const crmSmallBrands: BlogPost = {
  slug: 'crm-for-small-online-brands',
  title: 'A CRM for a small online brand: when you need one and what to look for',
  description:
    'From spreadsheet to proper CRM. What a CRM does for an eCommerce brand, the features that matter and how to move without losing data.',
  category: 'Retention',
  published: '2025-07-26',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-slate-200 via-blue-100 to-indigo-100', label: 'CRM' },
  toc: [
    { id: 'need', label: 'Signs you need one' },
    { id: 'features', label: 'Features that matter' },
    { id: 'move', label: 'Moving over' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
