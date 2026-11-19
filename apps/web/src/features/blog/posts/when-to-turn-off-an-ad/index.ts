import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const whenToTurnOffAnAd: BlogPost = {
  slug: 'when-to-turn-off-a-meta-ad',
  title: 'When to turn off an ad: simple rules that stop wasted spend',
  description:
    'A spend rule you can calculate for your own target, the early signals worth watching, and when to leave an ad alone.',
  category: 'Scaling',
  published: '2025-08-14',
  readMinutes: 5,
  cover: { glyph: 'bars', tone: 'from-red-200 via-orange-100 to-amber-100', label: 'Off' },
  toc: [
    { id: 'rule', label: 'A simple spend rule' },
    { id: 'signals', label: 'Earlier signals worth watching' },
    { id: 'not', label: 'When not to turn an ad off' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
