import type { ChatAttachmentDto } from '@muvance/shared';
import type { FileMeta } from './api';

export const isImage = (f: Pick<ChatAttachmentDto, 'contentType'>) =>
  ['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(f.contentType);

export const isVideo = (f: Pick<ChatAttachmentDto, 'contentType'>) =>
  ['video/mp4', 'video/webm', 'video/quicktime'].includes(f.contentType);

export const isAudio = (f: Pick<ChatAttachmentDto, 'contentType'>) =>
  f.contentType.startsWith('audio/');

/** "0:42", "12:05", "1:02:09". */
export function duration(ms: number | null | undefined) {
  const total = Math.max(0, Math.round((ms ?? 0) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}

function mediaMeta(file: File, kind: 'video' | 'audio') {
  return new Promise<FileMeta | null>((resolve) => {
    const el = document.createElement(kind);
    const url = URL.createObjectURL(file);
    const done = (meta: FileMeta | null) => {
      URL.revokeObjectURL(url);
      el.removeAttribute('src');
      resolve(meta);
    };
    const timer = window.setTimeout(() => done(null), 8000);
    el.preload = 'metadata';
    el.muted = true;
    el.onloadedmetadata = () => {
      window.clearTimeout(timer);
      const d = Number.isFinite(el.duration) ? el.duration * 1000 : undefined;
      if (el instanceof HTMLVideoElement) {
        done({
          width: el.videoWidth || undefined,
          height: el.videoHeight || undefined,
          durationMs: d,
        });
      } else {
        done({ durationMs: d });
      }
    };
    el.onerror = () => {
      window.clearTimeout(timer);
      done(null);
    };
    el.src = url;
  });
}

/** Size and length of pictures, videos and audio, so they show at the right shape at once. */
export async function probe(file: File): Promise<FileMeta | null> {
  try {
    if (file.type.startsWith('image/')) {
      const bitmap = await createImageBitmap(file);
      const meta = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return meta;
    }
    if (file.type.startsWith('video/')) return await mediaMeta(file, 'video');
    if (file.type.startsWith('audio/')) return await mediaMeta(file, 'audio');
  } catch {
    // Unreadable: send it without.
  }
  return null;
}

/* Voice messages -------------------------------------------------------------------------- */

const VOICE_TYPES = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm'];

export const canRecord = () =>
  typeof MediaRecorder !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);

export interface Recording {
  /** Seconds so far, and the latest loudness (0–1), for the live display. */
  onTick: (cb: (seconds: number, level: number) => void) => void;
  stop: () => Promise<{ file: File; meta: FileMeta } | null>;
  cancel: () => void;
}

/** Starts recording from the microphone. Throws if the microphone isn't available. */
export async function startRecording(): Promise<Recording> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  });
  const mimeType = VOICE_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
  const recorder = new MediaRecorder(
    stream,
    mimeType ? { mimeType, audioBitsPerSecond: 48_000 } : undefined,
  );
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

  // Loudness, sampled ten times a second, for the waveform.
  const audio = new AudioContext();
  const analyser = audio.createAnalyser();
  analyser.fftSize = 1024;
  audio.createMediaStreamSource(stream).connect(analyser);
  const buffer = new Float32Array(analyser.fftSize);
  const levels: number[] = [];
  const started = performance.now();
  let tick: ((s: number, l: number) => void) | null = null;
  const timer = window.setInterval(() => {
    analyser.getFloatTimeDomainData(buffer);
    let sum = 0;
    for (const v of buffer) sum += v * v;
    const level = Math.min(1, Math.sqrt(sum / buffer.length) * 4);
    levels.push(level);
    tick?.((performance.now() - started) / 1000, level);
  }, 100);

  const cleanup = () => {
    window.clearInterval(timer);
    stream.getTracks().forEach((t) => t.stop());
    void audio.close().catch(() => {});
  };
  recorder.start(250);

  return {
    onTick: (cb) => {
      tick = cb;
    },
    cancel: () => {
      recorder.onstop = null;
      if (recorder.state !== 'inactive') recorder.stop();
      cleanup();
    },
    stop: () =>
      new Promise((resolve) => {
        const durationMs = performance.now() - started;
        recorder.onstop = () => {
          cleanup();
          if (durationMs < 700 || !chunks.length) return resolve(null);
          const type = (recorder.mimeType || mimeType || 'audio/webm').split(';')[0]!;
          const ext = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm';
          const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
          const file = new File(chunks, `Voice message ${stamp}.${ext}`, { type });
          resolve({ file, meta: { voice: true, durationMs, waveform: bars(levels, 48) } });
        };
        if (recorder.state !== 'inactive') recorder.stop();
        else recorder.onstop(new Event('stop'));
      }),
  };
}

/** Squeezes loudness samples into `count` bars of 0–100. */
export function bars(levels: number[], count: number) {
  if (!levels.length) return Array.from({ length: count }, () => 8);
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const from = Math.floor((i * levels.length) / count);
    const to = Math.max(from + 1, Math.floor(((i + 1) * levels.length) / count));
    const slice = levels.slice(from, to);
    out.push(slice.length ? Math.max(...slice) : 0);
  }
  const peak = Math.max(...out, 0.05);
  return out.map((v) => Math.max(6, Math.round((v / peak) * 100)));
}
