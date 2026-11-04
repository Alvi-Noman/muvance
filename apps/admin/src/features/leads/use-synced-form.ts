import { useState } from 'react';

/**
 * Form state that follows the server: when the saved values change (our own save, an automatic
 * stage change, a teammate's edit) the form picks them up, unless the user has unsaved edits,
 * which are never overwritten.
 */
export function useSyncedForm<T>(server: T) {
  const [values, setValues] = useState(server);
  const [baseline, setBaseline] = useState(server);

  if (JSON.stringify(server) !== JSON.stringify(baseline)) {
    const hasEdits = JSON.stringify(values) !== JSON.stringify(baseline);
    setBaseline(server);
    if (!hasEdits) setValues(server);
  }

  const dirty = JSON.stringify(values) !== JSON.stringify(server);
  const set = <K extends keyof T>(key: K, value: T[K]) =>
    setValues((v) => ({ ...v, [key]: value }));
  return { values, set, setValues, dirty, reset: () => setValues(server) };
}

/** "" -> null, "12" -> 12 (for optional number fields). */
export const toNumber = (text: string) => (text.trim() === '' ? null : Number(text));
export const fromNumber = (n: number | null) => (n == null ? '' : String(n));
