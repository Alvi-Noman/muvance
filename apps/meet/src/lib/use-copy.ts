import { useEffect, useState } from 'react';

/** Copies text, remembering for two seconds what was copied (to show a tick). */
export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(null), 2000);
    return () => clearTimeout(id);
  }, [copied]);
  const copy = async (text: string, key = text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
    } catch {
      window.prompt('Copy this:', text);
    }
  };
  return { copied, copy };
}
