import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const messengerChatbots: BlogPost = {
  slug: 'messenger-chatbot-automation',
  title: 'Messenger and WhatsApp chatbots: what to automate and what to keep human',
  description:
    'Auto-replies and simple bots can answer price and delivery questions instantly. How to set them up without frustrating customers.',
  category: 'Conversion',
  published: '2026-08-22',
  readMinutes: 5,
  cover: { glyph: 'split', tone: 'from-blue-200 via-violet-100 to-pink-100', label: 'Bot' },
  toc: [
    { id: 'automate', label: 'What to automate' },
    { id: 'setup', label: 'A simple setup' },
    { id: 'measure', label: 'Is it helping?' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
