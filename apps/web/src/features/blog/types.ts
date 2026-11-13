import type { ComponentType } from 'react';

export type BlogCategory =
  'Campaign setup' | 'Creative' | 'Tracking' | 'Scaling' | 'Conversion' | 'Bangladesh' | 'Agencies';

/** The little chart drawn on a post's cover, so every card has a visual even without photos. */
export type CoverGlyph = 'split' | 'bars' | 'funnel' | 'line' | 'grid';

export type BlogPost = {
  slug: string;
  title: string;
  /** One or two sentences: used on cards and as the meta description. */
  description: string;
  category: BlogCategory;
  /** ISO date, e.g. "2026-11-14". */
  published: string;
  readMinutes: number;
  cover: { glyph: CoverGlyph; tone: string; label: string };
  /** Chapters shown in the table of contents; each id must match a section in the body. */
  toc: { id: string; label: string }[];
  /** Loads the article text and charts only when the post is opened. */
  Body: ComponentType;
  /** Starts downloading the article early, e.g. when its card is hovered. */
  preload: () => Promise<unknown>;
};
