import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

const toc = [
  { id: 'the-gap', label: 'Why a gap is normal' },
  { id: 'how-each-counts', label: 'How each side counts a sale' },
  { id: 'attribution', label: 'Reason 1: attribution windows' },
  { id: 'dates', label: 'Reason 2: different dates' },
  { id: 'modelled', label: 'Reason 3: modelled and cross-device sales' },
  { id: 'duplicates', label: 'Reason 4: duplicate events' },
  { id: 'cod', label: 'Reason 5: cash-on-delivery orders' },
  { id: 'fix', label: 'The 7-step fix' },
  { id: 'mer', label: 'The number to trust: MER' },
  { id: 'faq', label: 'Things people ask us' },
];

export const metaVsStoreSales: BlogPost = {
  slug: 'meta-ads-manager-vs-store-sales',
  title: 'Why Meta Ads Manager and your store show different sales numbers',
  description:
    'Ads Manager says 142 sales, your store says 97. The five real reasons the numbers differ, and a 7-step checklist to close the gap.',
  category: 'Tracking',
  published: '2026-11-14',
  readMinutes: 9,
  cover: { glyph: 'split', tone: 'from-amber-200 via-orange-100 to-rose-100', label: '−45' },
  toc,
  ...lazyBody(() => import('./Body')),
};
