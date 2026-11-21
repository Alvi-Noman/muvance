import { useEffect, useState } from 'react';

export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or full storage: the form still works, it just isn't remembered.
  }
}

/** Form state that survives a page reload, so a half-filled document isn't lost. */
export function useDraft<T extends object>(key: string, makeDefault: () => T) {
  const [value, setValue] = useState<T>(() => ({
    ...makeDefault(),
    ...readStored<Partial<T>>(key, {}),
  }));

  useEffect(() => {
    writeStored(key, value);
  }, [key, value]);

  const update = <K extends keyof T>(field: K, next: T[K]) =>
    setValue((current) => ({ ...current, [field]: next }));

  return [value, setValue, update] as const;
}
