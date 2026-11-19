import { useEffect } from 'react';

type PageMeta = {
  title: string;
  description: string;
  /** Absolute canonical URL for this page. */
  canonical: string;
  /** Structured data (JSON-LD) describing the page. */
  jsonLd?: object;
};

/** Finds or creates a <meta>/<link> tag in <head>, returning a function that restores it. */
function setHeadTag(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector);
  const existed = !!el;
  const previous = el?.getAttribute(attr) ?? null;
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
  return () => {
    if (!existed) el.remove();
    else if (previous !== null) el.setAttribute(attr, previous);
  };
}

const meta = (key: 'name' | 'property', name: string) => () => {
  const el = document.createElement('meta');
  el.setAttribute(key, name);
  return el;
};

/**
 * Sets the page title, description, canonical link, social-sharing tags and optional
 * JSON-LD, and restores the previous values when the page unmounts.
 */
export function usePageMeta({ title, description, canonical, jsonLd }: PageMeta) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const restore = [
      setHeadTag('meta[name="description"]', meta('name', 'description'), 'content', description),
      setHeadTag('meta[property="og:title"]', meta('property', 'og:title'), 'content', title),
      setHeadTag(
        'meta[property="og:description"]',
        meta('property', 'og:description'),
        'content',
        description,
      ),
      setHeadTag('meta[property="og:url"]', meta('property', 'og:url'), 'content', canonical),
      setHeadTag(
        'link[rel="canonical"]',
        () => {
          const el = document.createElement('link');
          el.rel = 'canonical';
          return el;
        },
        'href',
        canonical,
      ),
    ];

    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.title = prevTitle;
      restore.forEach((fn) => fn());
      script?.remove();
    };
  }, [title, description, canonical, jsonLd]);
}
