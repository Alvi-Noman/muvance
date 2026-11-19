import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const aiToolsMarketing: BlogPost = {
  slug: 'ai-tools-small-marketing-team',
  title: 'AI tools for a small marketing team: where they help and where they don’t',
  description:
    'Using AI for research, copy drafts, images, video edits and reporting, without producing generic content or risky claims.',
  category: 'Strategy',
  published: '2026-06-06',
  readMinutes: 6,
  cover: { glyph: 'grid', tone: 'from-violet-200 via-sky-100 to-emerald-100', label: 'AI' },
  toc: [
    { id: 'good', label: 'Where AI helps most' },
    { id: 'careful', label: 'Where to be careful' },
    { id: 'workflow', label: 'A simple workflow' },
    { id: 'faq', label: 'Questions people ask' },
  ],
  ...lazyBody(() => import('./Body')),
};
