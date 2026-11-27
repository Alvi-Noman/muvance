import type { QueryClient } from '@tanstack/react-query';
import type { ChatBootstrapDto, ChatMessageDto } from '@muvance/shared';
import { keys, personOf, spaceTitle } from './data';
import { plainText } from './format';
import { pushActive } from './push';

/** A soft two-note chime, made with Web Audio (no sound file to load). */
let ctx: AudioContext | undefined;
export function chime() {
  try {
    ctx ??= new AudioContext();
    const audio = ctx;
    if (audio.state === 'suspended') void audio.resume();
    const start = audio.currentTime + 0.02;
    [987.77, 1318.5].forEach((freq, i) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = start + i * 0.09;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.05, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.connect(gain).connect(audio.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  } catch {
    // No audio: stay silent.
  }
}

const PREFS_KEY = 'muvance-chat:sound';
export function soundOn() {
  try {
    return localStorage.getItem(PREFS_KEY) !== 'off';
  } catch {
    return true;
  }
}
export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(PREFS_KEY, on ? 'on' : 'off');
  } catch {
    // Private mode: the choice lasts until the page closes.
  }
}

export const notificationsSupported = () => typeof Notification !== 'undefined';

/** A message's files in words: "🎤 Voice message", "📷 3 photos". */
export function describeFiles(message: Pick<ChatMessageDto, 'attachments'>) {
  const files = message.attachments;
  if (!files.length) return '';
  if (files[0]!.voice) return '🎤 Voice message';
  if (files.every((f) => f.contentType.startsWith('image/'))) {
    return files.length > 1 ? `📷 ${files.length} photos` : '📷 Photo';
  }
  if (files.every((f) => f.contentType.startsWith('video/'))) {
    return files.length > 1 ? `🎬 ${files.length} videos` : '🎬 Video';
  }
  return files.length > 1 ? `📎 ${files.length} files` : `📎 ${files[0]!.name}`;
}

/** Plays a sound, and shows a desktop notification when the app isn't in front. */
export function notifyMessage(qc: QueryClient, message: ChatMessageDto, meId: string) {
  const data = qc.getQueryData<ChatBootstrapDto>(keys.bootstrap);
  if (!data) return;
  // Notifications paused.
  if (data.me.dndUntil && new Date(data.me.dndUntil).getTime() > Date.now()) return;
  const space = data.spaces.find((s) => s.id === message.spaceId);
  const mentionsMe = message.text.includes(`<@${meId}>`) || message.text.includes('<@all>');
  if (space?.muted && !mentionsMe) return;

  const people = new Map(data.people.map((p) => [p.id, p]));
  if (soundOn()) chime();

  const hidden = document.visibilityState !== 'visible' || !document.hasFocus();
  if (!hidden || !notificationsSupported() || Notification.permission !== 'granted') return;
  // This device gets push notifications (even with the app closed): they cover it.
  if (pushActive()) return;
  const author = personOf(people, message.authorId).name;
  const where = space && space.kind === 'space' ? spaceTitle(space, meId, people) : null;
  const names = new Map([...people].map(([id, p]) => [id, p.name]));
  const body = plainText(message.text, names) || describeFiles(message);
  try {
    const n = new Notification(where ? `${author} in ${where}` : author, {
      body: body.slice(0, 180),
      tag: message.spaceId,
      icon: '/favicon.svg',
    });
    n.onclick = () => {
      window.focus();
      window.history.pushState(null, '', `/c/${message.spaceId}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
      n.close();
    };
  } catch {
    // Some browsers only allow notifications from a service worker.
  }
}
