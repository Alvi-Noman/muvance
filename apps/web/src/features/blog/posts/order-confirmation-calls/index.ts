import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const orderConfirmationCalls: BlogPost = {
  slug: 'order-confirmation-call-script',
  title: 'Order confirmation calls: a script that cuts fake COD orders',
  description:
    'Why a one-minute call before dispatch pays for itself, a simple script, and what to listen for on the call.',
  category: 'Operations',
  published: '2025-04-08',
  readMinutes: 5,
  cover: { glyph: 'funnel', tone: 'from-emerald-200 via-teal-100 to-cyan-100', label: 'Call' },
  toc: [
    { id: 'why', label: 'Where confirmation calls help' },
    { id: 'script', label: 'A simple script' },
    { id: 'listen', label: 'What to listen for' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
