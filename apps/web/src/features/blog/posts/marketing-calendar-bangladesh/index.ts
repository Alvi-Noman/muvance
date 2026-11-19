import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const marketingCalendarBangladesh: BlogPost = {
  slug: 'marketing-calendar-bangladesh',
  title: 'The Bangladesh marketing calendar: the moments that move sales',
  description:
    'Eid, Pohela Boishakh, Puja, 11.11, winter, weddings and back-to-school. When to start planning each one and what usually sells.',
  category: 'Strategy',
  published: '2026-07-19',
  readMinutes: 6,
  cover: { glyph: 'grid', tone: 'from-red-200 via-green-100 to-emerald-100', label: 'Cal' },
  toc: [
    { id: 'calendar', label: 'The key moments' },
    { id: 'timeline', label: 'A planning timeline for big moments' },
    { id: 'costs', label: 'Expect ad costs to rise' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
