import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const whatsappBroadcasts: BlogPost = {
  slug: 'whatsapp-marketing-broadcasts',
  title: 'WhatsApp marketing: broadcasts, catalogues and staying out of the spam folder',
  description:
    'How brands use WhatsApp Business for repeat sales: broadcast lists, the catalogue, the API, and the rules that keep your number safe.',
  category: 'Retention',
  published: '2025-04-07',
  readMinutes: 6,
  cover: { glyph: 'split', tone: 'from-green-200 via-emerald-100 to-teal-100', label: 'WA' },
  toc: [
    { id: 'options', label: 'Your options' },
    { id: 'use', label: 'What to send' },
    { id: 'safe', label: 'Keeping your number safe' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
