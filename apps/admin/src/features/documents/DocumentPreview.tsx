import { useEffect, useRef, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { whenReady } from './print';

// A4 at 96 dpi.
const PAGE_W = 794;
const PAGE_H = 1123;

/**
 * Live, scaled-down view of the A4 document. Warns when the content no longer fits on the
 * single page (the templates clip anything past the bottom edge).
 */
export function DocumentPreview({ html, title }: { html: string; title: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.6);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setScale(Math.min(1, entry.contentRect.width / PAGE_W));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const checkOverflow = async () => {
    const doc = frameRef.current?.contentDocument;
    const page = doc?.querySelector<HTMLElement>('.page');
    if (!doc || !page) return;
    await whenReady(doc);
    setOverflow(page.scrollHeight > page.clientHeight + 1);
  };

  return (
    <div>
      {overflow && (
        <p className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
          <TriangleAlert className="size-4 shrink-0" aria-hidden />
          The content is longer than one A4 page and the bottom will be cut off. Shorten it a
          little.
        </p>
      )}
      <div ref={wrapRef} className="w-full">
        <div
          className="overflow-hidden rounded-lg bg-white shadow-[0_0_0_1px_rgb(92_225_255/0.15),0_12px_40px_rgb(0_0_0/0.45)]"
          style={{ height: PAGE_H * scale }}
        >
          <iframe
            ref={frameRef}
            title={title}
            srcDoc={html}
            onLoad={checkOverflow}
            sandbox="allow-same-origin"
            style={{
              width: PAGE_W,
              height: PAGE_H,
              border: 0,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              background: '#fff',
            }}
          />
        </div>
      </div>
    </div>
  );
}
