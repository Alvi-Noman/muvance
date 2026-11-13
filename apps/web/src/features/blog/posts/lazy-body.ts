import { lazy, type ComponentType } from 'react';

/**
 * Wraps a post's article module so it downloads only when the post is opened
 * (or when a reader hovers its card, via `preload`).
 */
export function lazyBody(load: () => Promise<{ Body: ComponentType }>) {
  const preload = () => load();
  const Body = lazy(() => load().then((m) => ({ default: m.Body })));
  return { Body, preload };
}
