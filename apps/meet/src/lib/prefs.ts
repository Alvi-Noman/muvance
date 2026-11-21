/** Per-browser preferences (name, devices, blur). Storage can be blocked, so every access is guarded. */
export interface MeetPrefs {
  name: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  audioDeviceId: string;
  videoDeviceId: string;
  audioOutputId: string;
  blur: BlurLevel;
  mirror: boolean;
  hideSelf: boolean;
}

export type BlurLevel = 'off' | 'light' | 'strong';

const KEY = 'muvance-meet:prefs';
const defaults: MeetPrefs = {
  name: '',
  audioEnabled: true,
  videoEnabled: true,
  audioDeviceId: '',
  videoDeviceId: '',
  audioOutputId: '',
  blur: 'off',
  mirror: true,
  hideSelf: false,
};

export function loadPrefs(): MeetPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<MeetPrefs>) } : defaults;
  } catch {
    return defaults;
  }
}

export function savePrefs(patch: Partial<MeetPrefs>) {
  const next = { ...loadPrefs(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or blocked storage: preferences just aren't remembered.
  }
  return next;
}

/** A guest's request to join, kept for the tab so a refresh doesn't make them ask again. */
export const joinRequestStore = {
  get(code: string) {
    try {
      return sessionStorage.getItem(`muvance-meet:request:${code}`);
    } catch {
      return null;
    }
  },
  set(code: string, id: string) {
    try {
      sessionStorage.setItem(`muvance-meet:request:${code}`, id);
    } catch {
      // Ignored: they would just ask again after a refresh.
    }
  },
  clear(code: string) {
    try {
      sessionStorage.removeItem(`muvance-meet:request:${code}`);
    } catch {
      // Ignored.
    }
  },
};
