import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const whatsappVsWebsiteAds: BlogPost = {
  slug: 'click-to-whatsapp-vs-website-ads',
  title: 'Click-to-WhatsApp and Messenger ads vs website ads: which sells more?',
  description:
    'How chat sales work, when they beat website ads, what they could bring in, and how to track them.',
  category: 'Bangladesh',
  published: '2026-11-14',
  readMinutes: 7,
  cover: { glyph: 'funnel', tone: 'from-green-200 via-emerald-100 to-teal-100', label: 'Chat' },
  toc: [
    { id: 'how', label: 'How a chat sale works' },
    { id: 'compare', label: 'Side by side' },
    { id: 'calc', label: 'What chat ads could bring in' },
    { id: 'tracking', label: "Don't fly blind on tracking" },
    { id: 'check', label: 'Are you ready for message ads?' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
