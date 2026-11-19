import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const contentCalendar: BlogPost = {
  slug: 'content-calendar-small-team',
  title: 'A content calendar a two-person team can actually keep',
  description:
    'Plan a month of posts in one afternoon, batch the shooting, and leave room for trends. A simple template and the routine around it.',
  category: 'Content',
  published: '2025-11-28',
  readMinutes: 5,
  cover: { glyph: 'grid', tone: 'from-amber-200 via-orange-100 to-rose-100', label: 'Cal' },
  toc: [
    { id: 'template', label: 'The template' },
    { id: 'routine', label: 'The monthly routine' },
    { id: 'flex', label: 'Leave room' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
