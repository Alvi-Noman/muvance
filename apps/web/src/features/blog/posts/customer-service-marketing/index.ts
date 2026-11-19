import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const customerServiceMarketing: BlogPost = {
  slug: 'customer-service-as-marketing',
  title: 'Customer service is marketing: how good support grows sales',
  description:
    'Fast replies, fair returns and kind fixes turn problems into loyalty. How to set up support that a small team can actually run.',
  category: 'Retention',
  published: '2026-09-21',
  readMinutes: 5,
  cover: { glyph: 'line', tone: 'from-cyan-200 via-emerald-100 to-lime-100', label: 'Help' },
  toc: [
    { id: 'speed', label: 'Speed matters most' },
    { id: 'setup', label: 'A setup a small team can run' },
    { id: 'turn', label: 'Turning problems into fans' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
