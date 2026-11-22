import DOMPurify from 'dompurify';

/**
 * Makes an email's HTML safe to show: no scripts, forms or event handlers, links open in a new
 * tab, and (unless allowed) remote images are held back so senders can't track opens.
 */
export function sanitizeEmail(html: string, { allowRemote }: { allowRemote: boolean }) {
  let blocked = 0;
  const purify = DOMPurify();
  purify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
    if (!allowRemote) {
      for (const attr of ['src', 'background', 'srcset']) {
        const value = node.getAttribute(attr);
        if (value && /^(https?:)?\/\//i.test(value.trim())) {
          node.removeAttribute(attr);
          blocked += 1;
        }
      }
      const style = node.getAttribute('style');
      if (style && /url\(\s*['"]?(https?:)?\/\//i.test(style)) {
        node.setAttribute('style', style.replace(/url\([^)]*\)/gi, 'none'));
        blocked += 1;
      }
    }
  });
  const clean = purify.sanitize(html, {
    WHOLE_DOCUMENT: false,
    FORBID_TAGS: [
      'script',
      'iframe',
      'object',
      'embed',
      'form',
      'input',
      'button',
      'meta',
      'base',
      'link',
    ],
    FORBID_ATTR: ['onerror', 'onload', 'onclick'],
    ADD_ATTR: ['target'],
  });
  return { html: clean, blockedImages: blocked };
}

/** Wraps sanitized email HTML in a document with calm defaults for the reading frame. */
export function frameDocument(body: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><base target="_blank">
<style>
  html,body{margin:0;padding:0;background:#fff;color:#1a1a1a;}
  body{font:14.5px/1.6 Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;word-wrap:break-word;overflow-wrap:anywhere;}
  img{max-width:100%;height:auto;}
  table{max-width:100%;}
  a{color:#2f5bff;}
  blockquote{margin:0.6em 0;padding-left:0.9em;border-left:3px solid #e7e6e2;color:#6b6b68;}
  pre{white-space:pre-wrap;}
</style></head><body>${body}</body></html>`;
}
