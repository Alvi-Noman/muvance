/** Waits until the document's fonts and images are ready, so nothing prints half-loaded. */
export async function whenReady(doc: Document) {
  const images = Array.from(doc.images).map((img) =>
    img.complete ? Promise.resolve() : img.decode().catch(() => undefined),
  );
  await Promise.all([doc.fonts?.ready, ...images]);
}

/**
 * Opens the browser's print dialog for a complete HTML document. Choose "Save as PDF" as the
 * destination; the suggested file name comes from `fileName`. The page size (A4, no margins)
 * is set by the document's own @page rule.
 */
export function printHtml(html: string, fileName: string) {
  return new Promise<void>((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText =
      'position:fixed;right:0;bottom:0;width:210mm;height:297mm;border:0;opacity:0;pointer-events:none;';
    const originalTitle = document.title;

    const cleanup = () => {
      document.title = originalTitle;
      frame.remove();
    };

    frame.onload = async () => {
      const win = frame.contentWindow;
      const doc = frame.contentDocument;
      if (!win || !doc) {
        cleanup();
        reject(new Error('Could not prepare the document for printing.'));
        return;
      }
      try {
        await whenReady(doc);
        // Browsers name the PDF after the page title.
        document.title = fileName;
        doc.title = fileName;
        win.focus();
        win.print();
        resolve();
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      } finally {
        // print() blocks until the dialog closes on desktop browsers; a delay covers the rest.
        setTimeout(cleanup, 1000);
      }
    };

    frame.srcdoc = html;
    document.body.appendChild(frame);
  });
}
