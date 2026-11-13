import type { BlogPost } from '../../types';
import { lazyBody } from '../lazy-body';

export const scaling: BlogPost = {
  slug: 'how-to-scale-winning-meta-ads',
  title: 'How to scale a winning ad without killing its performance',
  description:
    'Vertical vs horizontal scaling, how fast to raise budgets, the guardrails that protect profit, and a step-by-step scaling playbook.',
  category: 'Scaling',
  published: '2026-11-14',
  readMinutes: 8,
  cover: { glyph: 'bars', tone: 'from-lime-200 via-emerald-100 to-teal-100', label: '2×' },
  toc: [
    { id: 'types', label: 'Two ways to scale' },
    { id: 'speed', label: 'Why doubling backfires' },
    { id: 'plan', label: 'Plan your increases' },
    { id: 'guardrails', label: 'Guardrails' },
    { id: 'playbook', label: 'Scaling playbook' },
    { id: 'faq', label: 'Things people ask us' },
  ],
  ...lazyBody(() => import('./Body')),
};
