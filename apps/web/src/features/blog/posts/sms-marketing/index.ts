import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const smsMarketing: BlogPost = {
  slug: 'sms-marketing-bangladesh',
  title: 'SMS marketing in Bangladesh: what works and what gets ignored',
  description:
    'Transactional texts, promotional campaigns, sender names and timing. How to use SMS without becoming one more message people delete.',
  category: 'Retention',
  published: '2026-03-02',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-lime-200 via-green-100 to-teal-100', label: 'SMS' },
  toc: [
    { id: 'types', label: 'Two kinds of SMS' },
    { id: 'write', label: 'Writing an SMS that works' },
    { id: 'frequency', label: 'How often' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
