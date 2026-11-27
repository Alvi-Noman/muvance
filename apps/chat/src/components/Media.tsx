import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileArchive,
  FileAudio,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Pause,
  Play,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { ChatAttachmentDto, ChatLinkPreviewDto } from '@muvance/shared';
import { fileUrl } from '@/lib/api';
import { duration, isAudio, isImage, isVideo } from '@/lib/media';
import { cn, fileSize } from '@/lib/utils';

/* Attachments in a message ---------------------------------------------------------------- */

export function Attachments({ files, mine }: { files: ChatAttachmentDto[]; mine?: boolean }) {
  const [viewing, setViewing] = useState<number | null>(null);
  const visual = files.filter((f) => isImage(f) || isVideo(f));
  const voice = files.filter((f) => f.voice);
  const audio = files.filter((f) => !f.voice && isAudio(f));
  const others = files.filter((f) => !isImage(f) && !isVideo(f) && !isAudio(f));
  return (
    <div className="mt-1.5 space-y-1.5">
      {visual.length > 0 && <MediaGrid items={visual} onOpen={setViewing} />}
      {voice.map((f) => (
        <VoicePlayer key={f.id} file={f} mine={mine} />
      ))}
      {audio.map((f) => (
        <AudioPlayer key={f.id} file={f} />
      ))}
      {others.map((f) => (
        <FileCard key={f.id} file={f} />
      ))}
      {viewing !== null && (
        <Lightbox items={visual} start={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}

/** One picture or video: shown at its own shape. Several: a tidy grid, like a phone's chat app. */
function MediaGrid({
  items,
  onOpen,
}: {
  items: ChatAttachmentDto[];
  onOpen: (index: number) => void;
}) {
  if (items.length === 1) {
    const f = items[0]!;
    const ratio = f.width && f.height ? f.width / f.height : 4 / 3;
    const h = ratio >= 1 ? 260 / Math.min(ratio, 1.9) + 40 : 320;
    const height = Math.round(Math.min(320, Math.max(140, h)));
    return (
      <div
        className="max-w-full"
        style={{ width: Math.min(440, Math.max(160, Math.round(height * ratio))) }}
      >
        <Tile file={f} onOpen={() => onOpen(0)} style={{ aspectRatio: `${ratio}` }} />
      </div>
    );
  }
  const shown = items.slice(0, 4);
  const extra = items.length - shown.length;
  return (
    <div
      className={cn(
        'grid w-full max-w-[440px] gap-1 overflow-hidden rounded-xl',
        shown.length === 2 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2',
      )}
      style={{ aspectRatio: shown.length === 2 ? '2 / 1' : '1 / 1' }}
    >
      {shown.map((f, i) => (
        <Tile
          key={f.id}
          file={f}
          onOpen={() => onOpen(i)}
          rounded={false}
          className={cn(shown.length === 3 && i === 0 && 'row-span-2')}
          more={i === shown.length - 1 && extra > 0 ? extra : 0}
        />
      ))}
    </div>
  );
}

function Tile({
  file,
  onOpen,
  className,
  style,
  rounded = true,
  more = 0,
}: {
  file: ChatAttachmentDto;
  onOpen: () => void;
  className?: string;
  style?: React.CSSProperties;
  rounded?: boolean;
  more?: number;
}) {
  const video = isVideo(file);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={video ? `Play video ${file.name}` : `Open picture ${file.name}`}
      className={cn(
        'group/tile relative block size-full overflow-hidden bg-neutral-200',
        rounded && 'rounded-xl border border-line',
        className,
      )}
      style={style}
    >
      {video ? (
        // The first frame, as a poster.
        <video
          src={`${fileUrl(file.id)}#t=0.1`}
          preload="metadata"
          muted
          playsInline
          className="size-full object-cover"
        />
      ) : (
        <img
          src={fileUrl(file.id)}
          alt={file.name}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition duration-300 group-hover/tile:scale-[1.02]"
        />
      )}
      {video && (
        <>
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition group-hover/tile:scale-105">
              <Play className="ml-0.5 size-6 fill-current" />
            </span>
          </span>
          {file.durationMs ? (
            <span className="absolute right-1.5 bottom-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white tabular-nums">
              {duration(file.durationMs)}
            </span>
          ) : null}
        </>
      )}
      {more > 0 && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-2xl font-semibold text-white">
          +{more}
        </span>
      )}
    </button>
  );
}

/* Full-screen viewer ------------------------------------------------------------------------ */

/** Pictures and videos full screen: arrows or swipe between them, zoom, download. */
export function Lightbox({
  items,
  start,
  onClose,
}: {
  items: ChatAttachmentDto[];
  start: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(start);
  const [zoom, setZoom] = useState(false);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const file = items[index]!;
  const go = useCallback(
    (step: number) => {
      setZoom(false);
      setIndex((i) => Math.min(items.length - 1, Math.max(0, i + step)));
    },
    [items.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [go, onClose]);

  const onDown = (e: PointerEvent) => {
    if (!zoom) swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    else if (dy > 110 && Math.abs(dy) > Math.abs(dx)) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-black/95 text-white select-none"
      role="dialog"
      aria-modal
      aria-label={file.name}
    >
      <div className="flex items-center gap-2 p-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:p-3">
        <p className="min-w-0 flex-1 truncate px-2 text-sm">
          {file.name}
          {items.length > 1 && (
            <span className="ml-2 text-white/50">
              {index + 1} of {items.length}
            </span>
          )}
        </p>
        {isImage(file) && (
          <LightButton label={zoom ? 'Zoom out' : 'Zoom in'} onClick={() => setZoom((z) => !z)}>
            {zoom ? <ZoomOut /> : <ZoomIn />}
          </LightButton>
        )}
        <a
          href={fileUrl(file.id, true)}
          className="inline-flex size-10 items-center justify-center rounded-full hover:bg-white/10"
          aria-label="Download"
          title="Download"
        >
          <Download className="size-5" />
        </a>
        <LightButton label="Close" onClick={onClose}>
          <X />
        </LightButton>
      </div>
      <div
        className={cn(
          'relative flex min-h-0 flex-1 items-center justify-center',
          zoom ? 'overflow-auto' : 'overflow-hidden p-2 sm:p-6',
        )}
        onPointerDown={onDown}
        onPointerUp={onUp}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {isVideo(file) ? (
          <video
            key={file.id}
            src={fileUrl(file.id)}
            controls
            autoPlay
            playsInline
            className="max-h-full max-w-full rounded-lg bg-black"
          />
        ) : (
          <img
            key={file.id}
            src={fileUrl(file.id)}
            alt={file.name}
            draggable={false}
            onClick={() => setZoom((z) => !z)}
            className={cn(
              'animate-fade-up',
              zoom
                ? 'max-w-none cursor-zoom-out'
                : 'max-h-full max-w-full cursor-zoom-in rounded-lg object-contain',
            )}
          />
        )}
        {index > 0 && (
          <NavArrow side="left" onClick={() => go(-1)}>
            <ChevronLeft />
          </NavArrow>
        )}
        {index < items.length - 1 && (
          <NavArrow side="right" onClick={() => go(1)}>
            <ChevronRight />
          </NavArrow>
        )}
      </div>
      {items.length > 1 && (
        <div className="flex justify-center gap-1.5 overflow-x-auto p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {items.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setZoom(false);
                setIndex(i);
              }}
              aria-label={`Show ${i + 1}`}
              className={cn(
                'size-12 shrink-0 overflow-hidden rounded-lg ring-2 transition',
                i === index ? 'ring-white' : 'opacity-50 ring-transparent hover:opacity-80',
              )}
            >
              {isVideo(f) ? (
                <span className="flex size-full items-center justify-center bg-white/10">
                  <Play className="size-4 fill-current" />
                </span>
              ) : (
                <img src={fileUrl(f.id)} alt="" className="size-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LightButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex size-10 items-center justify-center rounded-full hover:bg-white/10 [&_svg]:size-5"
    >
      {children}
    </button>
  );
}

function NavArrow({
  side,
  onClick,
  children,
}: {
  side: 'left' | 'right';
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous' : 'Next'}
      className={cn(
        'absolute top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20 max-sm:hidden [&_svg]:size-6',
        side === 'left' ? 'left-4' : 'right-4',
      )}
    >
      {children}
    </button>
  );
}

/* Voice messages and audio ------------------------------------------------------------------ */

const SPEEDS = [1, 1.5, 2];

/** Only one voice message plays at a time. */
let playing: HTMLAudioElement | null = null;

function useAudio(src: string, knownMs: number | null) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(false);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState((knownMs ?? 0) / 1000);
  const [speed, setSpeed] = useState(1);

  const el = () => {
    if (!ref.current) {
      const a = new Audio(src);
      a.preload = 'metadata';
      a.ontimeupdate = () => setTime(a.currentTime);
      a.onloadedmetadata = () => Number.isFinite(a.duration) && setLength(a.duration);
      a.onplay = () => setOn(true);
      a.onpause = () => setOn(false);
      a.onended = () => {
        setOn(false);
        setTime(0);
      };
      ref.current = a;
    }
    return ref.current;
  };

  useEffect(
    () => () => {
      ref.current?.pause();
      ref.current = null;
    },
    [],
  );

  return {
    on,
    time,
    length,
    speed,
    toggle: () => {
      const a = el();
      if (a.paused) {
        if (playing && playing !== a) playing.pause();
        playing = a;
        a.playbackRate = speed;
        void a.play();
      } else a.pause();
    },
    seek: (fraction: number) => {
      const a = el();
      const total = Number.isFinite(a.duration) && a.duration ? a.duration : length;
      if (!total) return;
      a.currentTime = fraction * total;
      setTime(a.currentTime);
    },
    cycleSpeed: () => {
      const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]!;
      setSpeed(next);
      if (ref.current) ref.current.playbackRate = next;
    },
  };
}

export function VoicePlayer({ file, mine }: { file: ChatAttachmentDto; mine?: boolean }) {
  const player = useAudio(fileUrl(file.id), file.durationMs);
  const wave = file.waveform?.length ? file.waveform : Array.from({ length: 40 }, () => 30);
  const progress = player.length ? player.time / player.length : 0;
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    player.seek(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
  };
  return (
    <div
      className={cn(
        'flex w-full max-w-[340px] items-center gap-3 rounded-2xl px-3 py-2.5',
        mine ? 'bg-accent-soft' : 'bg-canvas',
      )}
    >
      <button
        type="button"
        onClick={player.toggle}
        aria-label={player.on ? 'Pause voice message' : 'Play voice message'}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-sm transition hover:bg-accent/90"
      >
        {player.on ? (
          <Pause className="size-4 fill-current" />
        ) : (
          <Play className="ml-0.5 size-4 fill-current" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div
          className="flex h-8 cursor-pointer items-center gap-[2px]"
          onClick={seek}
          role="slider"
          aria-label="Position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') player.seek(Math.min(1, progress + 0.05));
            if (e.key === 'ArrowLeft') player.seek(Math.max(0, progress - 0.05));
          }}
        >
          {wave.map((v, i) => (
            <span
              key={i}
              className={cn(
                'min-w-[2px] flex-1 rounded-full transition-colors',
                i / wave.length < progress ? 'bg-accent' : 'bg-neutral-300',
              )}
              style={{ height: `${Math.max(12, v)}%` }}
            />
          ))}
        </div>
        <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted tabular-nums">
          <span>{duration((player.on || player.time ? player.time : player.length) * 1000)}</span>
          <button
            type="button"
            onClick={player.cycleSpeed}
            className="rounded-full bg-black/[0.06] px-1.5 font-semibold hover:bg-black/10"
            aria-label="Playback speed"
          >
            {player.speed}×
          </button>
        </div>
      </div>
    </div>
  );
}

function AudioPlayer({ file }: { file: ChatAttachmentDto }) {
  const player = useAudio(fileUrl(file.id), file.durationMs);
  const progress = player.length ? player.time / player.length : 0;
  return (
    <div className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-line bg-white p-3">
      <button
        type="button"
        onClick={player.toggle}
        aria-label={player.on ? 'Pause' : 'Play'}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"
      >
        {player.on ? (
          <Pause className="size-4 fill-current" />
        ) : (
          <Play className="ml-0.5 size-4 fill-current" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <div
          className="mt-1.5 h-1.5 cursor-pointer rounded-full bg-black/[0.07]"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            player.seek((e.clientX - r.left) / r.width);
          }}
        >
          <div className="h-full rounded-full bg-accent" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
      <span className="text-xs text-muted tabular-nums">
        {duration((player.time || player.length) * 1000)}
      </span>
      <a href={fileUrl(file.id, true)} aria-label="Download" className="text-muted hover:text-ink">
        <Download className="size-4" />
      </a>
    </div>
  );
}

/* Other files ----------------------------------------------------------------------------- */

function FileIcon({ file }: { file: Pick<ChatAttachmentDto, 'name' | 'contentType'> }) {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (['zip', 'rar', '7z', 'gz', 'tar'].includes(ext)) return <FileArchive className="size-5" />;
  if (['xls', 'xlsx', 'csv', 'numbers'].includes(ext)) {
    return <FileSpreadsheet className="size-5" />;
  }
  if (file.contentType.startsWith('audio/')) return <FileAudio className="size-5" />;
  if (file.contentType.startsWith('video/')) return <FileVideo className="size-5" />;
  return <FileText className="size-5" />;
}

function fileTone(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'bg-red-50 text-red-600';
  if (['doc', 'docx', 'pages', 'txt', 'rtf'].includes(ext)) return 'bg-blue-50 text-blue-600';
  if (['xls', 'xlsx', 'csv', 'numbers'].includes(ext)) return 'bg-emerald-50 text-emerald-600';
  if (['ppt', 'pptx', 'key'].includes(ext)) return 'bg-orange-50 text-orange-600';
  if (['zip', 'rar', '7z', 'gz', 'tar'].includes(ext)) return 'bg-amber-50 text-amber-700';
  return 'bg-accent-soft text-accent';
}

export function FileCard({ file }: { file: ChatAttachmentDto }) {
  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toUpperCase() : 'FILE';
  return (
    <a
      href={fileUrl(file.id, !file.contentType.startsWith('application/pdf'))}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full max-w-sm items-center gap-3 rounded-xl border border-line bg-white p-3 transition hover:border-neutral-300 hover:bg-canvas"
    >
      <span
        className={cn(
          'inline-flex size-10 shrink-0 items-center justify-center rounded-lg',
          fileTone(file.name),
        )}
      >
        <FileIcon file={file} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{file.name}</span>
        <span className="block text-xs text-muted">
          {ext.slice(0, 6)} · {fileSize(file.size)}
        </span>
      </span>
      <Download className="size-4 shrink-0 text-muted" />
    </a>
  );
}

/* Link previews --------------------------------------------------------------------------- */

export function LinkPreview({ preview }: { preview: ChatLinkPreviewDto }) {
  const [imageOk, setImageOk] = useState(true);
  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1.5 flex w-full max-w-md overflow-hidden rounded-xl border border-line bg-white transition hover:border-neutral-300 hover:bg-canvas"
    >
      <span className="w-1 shrink-0 bg-accent/70" />
      <span className="min-w-0 flex-1 p-3">
        {preview.siteName && (
          <span className="block truncate text-xs font-medium text-muted">{preview.siteName}</span>
        )}
        <span className="mt-0.5 line-clamp-2 block text-sm font-semibold text-accent">
          {preview.title}
        </span>
        {preview.description && (
          <span className="mt-0.5 line-clamp-2 block text-xs text-muted">
            {preview.description}
          </span>
        )}
      </span>
      {preview.image && imageOk && (
        <img
          src={preview.image}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageOk(false)}
          className="w-24 shrink-0 object-cover sm:w-32"
        />
      )}
    </a>
  );
}
