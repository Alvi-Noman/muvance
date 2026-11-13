import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Copy link plus WhatsApp, Facebook and LinkedIn share links. */
export function ShareBar({ title, className }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === 'undefined' ? '' : window.location.href.split('#')[0]!;
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };

  const pill =
    'inline-flex h-9 items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3.5 text-xs font-medium text-neutral-700 backdrop-blur transition hover:bg-white hover:text-neutral-950';

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <button type="button" onClick={copy} className={pill}>
        {copied ? (
          <Check className="size-3.5" aria-hidden />
        ) : (
          <Link2 className="size-3.5" aria-hidden />
        )}
        {copied ? 'Copied' : 'Copy link'}
      </button>
      <a className={pill} target="_blank" rel="noreferrer" href={`https://wa.me/?text=${t}%20${u}`}>
        WhatsApp
      </a>
      <a
        className={pill}
        target="_blank"
        rel="noreferrer"
        href={`https://www.facebook.com/sharer/sharer.php?u=${u}`}
      >
        Facebook
      </a>
      <a
        className={pill}
        target="_blank"
        rel="noreferrer"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`}
      >
        LinkedIn
      </a>
    </div>
  );
}
