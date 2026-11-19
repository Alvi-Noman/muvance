import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const chooseDigitalMarketingAgency: BlogPost = {
  slug: 'how-to-choose-digital-marketing-agency-bangladesh',
  title: 'How to choose a digital marketing agency in Bangladesh for your online store',
  description:
    'Work out what you need, spot red and green flags, check how they get paid, and run a fair trial before you commit.',
  category: 'Agencies',
  published: '2026-10-26',
  readMinutes: 7,
  cover: { glyph: 'grid', tone: 'from-stone-200 via-neutral-100 to-amber-100', label: 'Pick' },
  toc: [
    { id: 'what-you-need', label: 'Start with what you actually need' },
    { id: 'signals', label: 'Green flags and red flags' },
    { id: 'pricing', label: 'Look closely at how they get paid' },
    { id: 'trial', label: 'How to run a fair trial' },
    { id: 'checklist', label: 'Quick checklist before you sign' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
