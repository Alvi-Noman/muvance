import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const customerInterviews: BlogPost = {
  slug: 'how-to-interview-customers',
  title: 'How to interview your customers (and the 10 questions we ask)',
  description:
    'Fifteen-minute phone chats with recent buyers will teach you more than any dashboard. How to set them up, what to ask and what to do with the answers.',
  category: 'Audience',
  published: '2025-10-06',
  readMinutes: 6,
  cover: { glyph: 'line', tone: 'from-emerald-200 via-teal-100 to-cyan-100', label: 'Ask' },
  toc: [
    { id: 'who', label: 'Who to call' },
    { id: 'questions', label: 'The 10 questions' },
    { id: 'listen', label: 'How to listen' },
    { id: 'after', label: 'Turning calls into action' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
