import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const emailMarketing: BlogPost = {
  slug: 'email-marketing-for-online-stores',
  title: 'Email marketing for online stores: is it worth it in Bangladesh?',
  description:
    'Email is cheap, owned and underused here. Which emails to send first, how to grow the list and what results to realistically expect.',
  category: 'Retention',
  published: '2026-09-30',
  readMinutes: 6,
  cover: { glyph: 'line', tone: 'from-sky-200 via-cyan-100 to-emerald-100', label: '@' },
  toc: [
    { id: 'first', label: 'The first emails to set up' },
    { id: 'expect', label: 'What to expect' },
    { id: 'tools', label: 'Tools and basics' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
