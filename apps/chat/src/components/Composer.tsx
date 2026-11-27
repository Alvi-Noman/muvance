import {
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type Ref,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Camera,
  FileText,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Play,
  Plus,
  Quote,
  SendHorizontal,
  Smile,
  Trash2,
  Type,
  X,
} from 'lucide-react';
import {
  CHAT_ATTACHMENTS_MAX,
  CHAT_FILE_MAX_BYTES,
  type ChatAttachmentDto,
  type ChatMessageDto,
  type ChatPersonDto,
} from '@muvance/shared';
import { api, errorMessage, uploadFile, type FileMeta } from '@/lib/api';
import { patchSpace, personOf, upsertMessage, useChat } from '@/lib/data';
import { plainText } from '@/lib/format';
import { canRecord, duration, probe, startRecording, type Recording } from '@/lib/media';
import { toStored } from '@/lib/mentions';
import { describeFiles } from '@/lib/notify';
import { takePendingShare } from '@/lib/share';
import { cn, fileSize } from '@/lib/utils';
import { EmojiPicker } from './EmojiPicker';
import { Avatar, Menu, MenuItem, useToast } from './ui';

export interface ComposerHandle {
  addFiles: (files: File[]) => void;
  focus: () => void;
}

interface Upload {
  key: string;
  file: File;
  preview: string | null;
  progress: number;
  attachment: ChatAttachmentDto | null;
  error: string | null;
  controller: AbortController;
}

// Unsent text per conversation and thread, kept while the app is open.
const drafts = new Map<string, string>();

const isTouch = () => window.matchMedia('(hover: none)').matches;

export function Composer({
  spaceId,
  threadId,
  placeholder,
  members,
  allowAll,
  autoFocus,
  quote,
  onClearQuote,
  ref,
}: {
  spaceId: string;
  threadId: string | null;
  placeholder: string;
  /** People who can be @mentioned. */
  members: ChatPersonDto[];
  allowAll: boolean;
  autoFocus?: boolean;
  /** A message being quoted in reply, shown above the box. */
  quote?: ChatMessageDto | null;
  onClearQuote?: () => void;
  ref?: Ref<ComposerHandle>;
}) {
  const { me, people } = useChat();
  const qc = useQueryClient();
  const toast = useToast();
  const draftKey = `${spaceId}:${threadId ?? ''}`;
  // Something shared from another app ("Share to Muvance Chat") lands here.
  const [shared] = useState(() => (threadId ? null : takePendingShare(spaceId)));
  const [text, setText] = useState(() => {
    const draft = drafts.get(draftKey) ?? '';
    if (!shared?.text) return draft;
    return draft ? `${draft}\n${shared.text}` : shared.text;
  });
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [mention, setMention] = useState<{ query: string; start: number } | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [recording, setRecording] = useState<Recording | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const mediaInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const lastTyping = useRef(0);
  const uploadsRef = useRef(uploads);

  useEffect(() => {
    uploadsRef.current = uploads;
  }, [uploads]);
  // Stop uploads and free previews when leaving.
  useEffect(
    () => () => {
      for (const u of uploadsRef.current) {
        u.controller.abort();
        if (u.preview) URL.revokeObjectURL(u.preview);
      }
    },
    [],
  );

  useEffect(() => {
    drafts.set(draftKey, text);
  }, [draftKey, text]);

  // Grow with the text, up to a limit.
  useLayoutEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [text]);

  useEffect(() => {
    if (quote) area.current?.focus();
  }, [quote]);

  const addFiles = (files: File[]) => {
    const room = CHAT_ATTACHMENTS_MAX - uploadsRef.current.length;
    if (files.length > room) toast(`Up to ${CHAT_ATTACHMENTS_MAX} files per message.`);
    for (const file of files.slice(0, Math.max(0, room))) {
      if (file.size > CHAT_FILE_MAX_BYTES) {
        toast(`${file.name} is too large (100 MB at most).`);
        continue;
      }
      const upload: Upload = {
        key: `${Date.now()}-${Math.random()}`,
        file,
        preview:
          file.type.startsWith('image/') || file.type.startsWith('video/')
            ? URL.createObjectURL(file)
            : null,
        progress: 0,
        attachment: null,
        error: null,
        controller: new AbortController(),
      };
      const update = (patch: Partial<Upload>) =>
        setUploads((list) => list.map((u) => (u.key === upload.key ? { ...u, ...patch } : u)));
      setUploads((list) => [...list, upload]);
      void probe(file)
        .then((meta) =>
          uploadFile(
            spaceId,
            file,
            meta,
            (progress) => update({ progress }),
            upload.controller.signal,
          ),
        )
        .then((attachment) => update({ attachment, progress: 1 }))
        .catch((error: unknown) => {
          if (!upload.controller.signal.aborted) update({ error: errorMessage(error) });
        });
    }
    if (!isTouch()) area.current?.focus();
  };

  useImperativeHandle(ref, () => ({ addFiles, focus: () => area.current?.focus() }));

  // Shared files start uploading at once.
  const sharedTaken = useRef(false);
  useEffect(() => {
    if (sharedTaken.current || !shared?.files.length) return;
    sharedTaken.current = true;
    addFiles(shared.files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shared]);

  const removeUpload = (key: string) => {
    setUploads((list) => {
      const u = list.find((x) => x.key === key);
      u?.controller.abort();
      if (u?.preview) URL.revokeObjectURL(u.preview);
      return list.filter((x) => x.key !== key);
    });
  };

  const pending = uploads.some((u) => !u.attachment && !u.error);
  const ready = uploads.filter((u) => u.attachment);
  const canSend = !pending && (text.trim().length > 0 || ready.length > 0);
  const showMic = !text.trim() && !uploads.length && canRecord();

  const afterSend = (message: ChatMessageDto) => {
    upsertMessage(qc, message);
    patchSpace(qc, spaceId, (s) => ({
      ...s,
      lastMessageAt: message.createdAt,
      lastMessage: { authorId: message.authorId, text: message.text || describeFiles(message) },
      unread: 0,
      mentioned: false,
    }));
  };

  const send = async () => {
    if (!canSend) return;
    const stored = toStored(text.trim(), members, allowAll);
    const attachmentIds = ready.map((u) => u.attachment!.id);
    const before = { text, uploads };
    setText('');
    setUploads([]);
    setMention(null);
    onClearQuote?.();
    try {
      const message = await api.post<ChatMessageDto>(`/spaces/${spaceId}/messages`, {
        text: stored,
        threadId,
        attachmentIds,
        quoteId: quote?.id ?? null,
      });
      afterSend(message);
      for (const u of before.uploads) if (u.preview) URL.revokeObjectURL(u.preview);
    } catch (error) {
      setText(before.text);
      setUploads(before.uploads);
      toast(errorMessage(error));
    }
  };

  /* Voice messages -------------------------------------------------------------------- */

  const record = async () => {
    try {
      setRecording(await startRecording());
    } catch (error) {
      const denied = error instanceof DOMException && error.name === 'NotAllowedError';
      toast(
        denied
          ? 'Allow the microphone for Muvance Chat to record voice messages.'
          : "Couldn't start the microphone.",
      );
    }
  };

  const sendVoice = async (file: File, meta: FileMeta) => {
    try {
      const attachment = await uploadFile(spaceId, file, meta, () => {});
      const message = await api.post<ChatMessageDto>(`/spaces/${spaceId}/messages`, {
        text: '',
        threadId,
        attachmentIds: [attachment.id],
        quoteId: quote?.id ?? null,
      });
      onClearQuote?.();
      afterSend(message);
    } catch (error) {
      toast(`The voice message wasn't sent: ${errorMessage(error)}`);
    }
  };

  const pingTyping = () => {
    if (Date.now() - lastTyping.current < 3000) return;
    lastTyping.current = Date.now();
    void api.post(`/spaces/${spaceId}/typing`, { threadId }).catch(() => {});
  };

  /* @mentions ------------------------------------------------------------------------ */

  const candidates = mention
    ? [
        ...(allowAll && 'all'.startsWith(mention.query.toLowerCase())
          ? [{ id: 'all', name: 'all', label: 'Notify everyone here' }]
          : []),
        ...members
          .filter(
            (p) =>
              p.id !== me.id &&
              p.name
                .toLowerCase()
                .split(/\s+/)
                .some((w) => w.startsWith(mention.query.toLowerCase())),
          )
          .slice(0, 8)
          .map((p) => ({ id: p.id, name: p.name, label: p.kind === 'guest' ? 'Guest' : '' })),
      ]
    : [];

  const findMention = (value: string, caret: number) => {
    const before = value.slice(0, caret);
    const match = /(?:^|\s)@([\p{L}\p{N}._-]{0,30})$/u.exec(before);
    setMention(match ? { query: match[1]!, start: caret - match[1]!.length - 1 } : null);
    setMentionIndex(0);
  };

  const pickMention = (name: string) => {
    if (!mention || !area.current) return;
    const caret = area.current.selectionStart;
    const next = `${text.slice(0, mention.start)}@${name} ${text.slice(caret)}`;
    setText(next);
    setMention(null);
    const pos = mention.start + name.length + 2;
    requestAnimationFrame(() => {
      area.current?.focus();
      area.current?.setSelectionRange(pos, pos);
    });
  };

  const insert = (value: string) => {
    const el = area.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    setText(text.slice(0, start) + value + text.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + value.length, start + value.length);
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mention && candidates.length) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const step = e.key === 'ArrowDown' ? 1 : -1;
        setMentionIndex((i) => (i + step + candidates.length) % candidates.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        pickMention(candidates[mentionIndex]!.name);
        return;
      }
      if (e.key === 'Escape') {
        setMention(null);
        return;
      }
    }
    if (e.key === 'Escape' && quote) {
      onClearQuote?.();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      // On phones, Enter makes a new line; the send button sends.
      if (isTouch()) return;
      e.preventDefault();
      void send();
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = [...e.clipboardData.files];
    if (files.length) {
      e.preventDefault();
      addFiles(files);
    }
  };

  const names = new Map([...people].map(([id, p]) => [id, p.name]));
  const pickFiles = (input: HTMLInputElement | null) => input?.click();

  return (
    <div className="relative">
      {mention && candidates.length > 0 && (
        <div className="animate-fade-up absolute bottom-full left-0 z-30 mb-2 w-72 max-w-full rounded-xl border border-line bg-white p-1 shadow-xl">
          {candidates.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                pickMention(c.name);
              }}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm',
                i === mentionIndex ? 'bg-accent-soft' : 'hover:bg-black/[0.04]',
              )}
            >
              {c.id === 'all' ? (
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-black/5 text-xs font-semibold">
                  @
                </span>
              ) : (
                <Avatar
                  person={members.find((m) => m.id === c.id)!}
                  className="size-7 text-[11px]"
                />
              )}
              <span className="min-w-0 flex-1 truncate font-medium">{c.name}</span>
              {c.label && <span className="text-xs text-muted">{c.label}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Hidden pickers: any file, photos and videos, and the camera (phones). */}
      <input
        ref={fileInput}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          addFiles([...(e.target.files ?? [])]);
          e.target.value = '';
        }}
      />
      <input
        ref={mediaInput}
        type="file"
        multiple
        accept="image/*,video/*"
        hidden
        onChange={(e) => {
          addFiles([...(e.target.files ?? [])]);
          e.target.value = '';
        }}
      />
      <input
        ref={cameraInput}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        hidden
        onChange={(e) => {
          addFiles([...(e.target.files ?? [])]);
          e.target.value = '';
        }}
      />

      <div className="rounded-2xl bg-canvas ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-line">
        {quote && (
          <div className="flex items-start gap-2 px-3 pt-3">
            <Quote className="mt-1 size-4 shrink-0 text-accent" />
            <div className="min-w-0 flex-1 rounded-lg border-l-[3px] border-accent/60 bg-black/[0.035] px-3 py-1.5">
              <p className="text-xs font-semibold text-accent">
                Replying to {personOf(people, quote.authorId).name}
              </p>
              <p className="truncate text-sm text-ink/75">
                {plainText(quote.text, names) || describeFiles(quote) || 'Message'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClearQuote}
              aria-label="Cancel quote"
              className="inline-flex size-7 items-center justify-center rounded-full text-muted hover:bg-black/5 hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {uploads.length > 0 && (
          <div className="flex flex-wrap gap-2 px-3 pt-3">
            {uploads.map((u) => (
              <div
                key={u.key}
                className={cn(
                  'relative flex h-16 items-center gap-2 overflow-hidden rounded-xl border bg-white pr-8',
                  u.error ? 'border-red-300' : 'border-line',
                  u.preview ? 'w-16 pr-0' : 'max-w-60 pl-2.5',
                )}
                title={u.error ?? u.file.name}
              >
                {u.preview && u.file.type.startsWith('video/') ? (
                  <>
                    <video src={u.preview} muted className="size-full object-cover" />
                    <Play className="absolute top-1/2 left-1/2 size-5 -translate-1/2 fill-white text-white drop-shadow" />
                  </>
                ) : u.preview ? (
                  <img src={u.preview} alt="" className="size-full object-cover" />
                ) : (
                  <>
                    <FileText className="size-6 shrink-0 text-accent" />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium">{u.file.name}</span>
                      <span
                        className={cn('block text-[11px]', u.error ? 'text-red-600' : 'text-muted')}
                      >
                        {u.error ?? fileSize(u.file.size)}
                      </span>
                    </span>
                  </>
                )}
                {u.error && u.preview && (
                  <span className="absolute inset-0 flex items-center justify-center bg-red-600/70 text-[10px] font-semibold text-white">
                    Failed
                  </span>
                )}
                {!u.attachment && !u.error && (
                  <span className="absolute inset-x-0 bottom-0 h-1 bg-black/5">
                    <span
                      className="block h-full bg-accent transition-[width]"
                      style={{ width: `${Math.round(u.progress * 100)}%` }}
                    />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeUpload(u.key)}
                  aria-label={`Remove ${u.file.name}`}
                  className="absolute top-1 right-1 inline-flex size-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {recording ? (
          <RecordingBar
            recording={recording}
            onCancel={() => {
              recording.cancel();
              setRecording(null);
            }}
            onSend={async () => {
              const result = await recording.stop();
              setRecording(null);
              if (!result) return toast('Hold on a little longer to record a voice message.');
              await sendVoice(result.file, result.meta);
            }}
          />
        ) : (
          <div className="flex items-end gap-1 p-1.5 pl-2">
            <Menu
              align="left"
              className="top-auto bottom-full mt-0 mb-2"
              trigger={(open, toggle) => (
                <button
                  type="button"
                  onClick={toggle}
                  aria-label="Add photos, videos or files"
                  title="Add photos, videos or files"
                  className={cn(
                    'mb-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-black/5 hover:text-ink',
                    open && 'rotate-45 bg-black/5 text-ink',
                  )}
                >
                  <Plus className="size-5 transition" />
                </button>
              )}
            >
              {(close) => (
                <>
                  <MenuItem
                    icon={<ImageIcon />}
                    onClick={() => {
                      close();
                      pickFiles(mediaInput.current);
                    }}
                  >
                    Photos & videos
                  </MenuItem>
                  {isTouch() && (
                    <MenuItem
                      icon={<Camera />}
                      onClick={() => {
                        close();
                        pickFiles(cameraInput.current);
                      }}
                    >
                      Camera
                    </MenuItem>
                  )}
                  <MenuItem
                    icon={<Paperclip />}
                    onClick={() => {
                      close();
                      pickFiles(fileInput.current);
                    }}
                  >
                    File
                  </MenuItem>
                  {canRecord() && (
                    <MenuItem
                      icon={<Mic />}
                      onClick={() => {
                        close();
                        void record();
                      }}
                    >
                      Voice message
                    </MenuItem>
                  )}
                </>
              )}
            </Menu>
            <textarea
              ref={area}
              value={text}
              rows={1}
              autoFocus={autoFocus}
              placeholder={placeholder}
              onChange={(e) => {
                setText(e.target.value);
                findMention(e.target.value, e.target.selectionStart);
                if (e.target.value) pingTyping();
              }}
              onKeyDown={onKeyDown}
              onPaste={onPaste}
              onBlur={() => setMention(null)}
              enterKeyHint={isTouch() ? 'enter' : 'send'}
              className="scrollbar-thin max-h-[220px] min-h-10 min-w-0 flex-1 resize-none bg-transparent px-1.5 py-2 text-base leading-6 outline-none placeholder:text-neutral-400 sm:text-[15px]"
            />
            <div className="relative mb-0.5 flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => setShowHelp((s) => !s)}
                aria-label="Formatting"
                title="Formatting"
                className={cn(
                  'inline-flex size-9 items-center justify-center rounded-full text-muted transition hover:bg-black/5 hover:text-ink max-sm:hidden',
                  showHelp && 'text-ink',
                )}
              >
                <Type className="size-[18px]" />
              </button>
              <button
                type="button"
                onClick={() => setEmojiOpen((o) => !o)}
                aria-label="Emoji"
                title="Emoji"
                className="inline-flex size-9 items-center justify-center rounded-full text-muted transition hover:bg-black/5 hover:text-ink"
              >
                <Smile className="size-5" />
              </button>
              {emojiOpen && (
                <EmojiPicker
                  onPick={(e) => insert(e)}
                  onClose={() => setEmojiOpen(false)}
                  className="absolute right-0 bottom-11"
                />
              )}
              {showMic ? (
                <button
                  type="button"
                  onClick={() => void record()}
                  aria-label="Record a voice message"
                  title="Record a voice message"
                  className="ml-0.5 inline-flex size-9 items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent/90"
                >
                  <Mic className="size-[18px]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={!canSend}
                  aria-label="Send"
                  title="Send"
                  className="ml-0.5 inline-flex size-9 items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent/90 disabled:bg-transparent disabled:text-neutral-300"
                >
                  <SendHorizontal className="size-[18px]" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {showHelp && (
        <p className="mt-1.5 px-2 text-xs text-muted">
          <b>*bold*</b> · <i>_italic_</i> · <s>~strike~</s> · <code>`code`</code> ·{' '}
          <code>```block```</code> · @ to mention · Shift+Enter for a new line
        </p>
      )}
    </div>
  );
}

/** While recording: time, a live level meter, and cancel or send. */
function RecordingBar({
  recording,
  onCancel,
  onSend,
}: {
  recording: Recording;
  onCancel: () => void;
  onSend: () => Promise<void>;
}) {
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>([]);
  const [sending, setSending] = useState(false);
  const sendRef = useRef(onSend);
  const done = useRef(false);

  useEffect(() => {
    sendRef.current = onSend;
  }, [onSend]);

  useEffect(() => {
    recording.onTick((s, level) => {
      setSeconds(s);
      setLevels((l) => [...l.slice(-59), level]);
      // Voice messages stop (and send) at 15 minutes.
      if (s >= 900 && !done.current) {
        done.current = true;
        setSending(true);
        void sendRef.current();
      }
    });
  }, [recording]);

  return (
    <div className="flex items-center gap-2 p-1.5 pl-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={sending}
        aria-label="Cancel recording"
        title="Cancel"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-red-600 transition hover:bg-red-50"
      >
        <Trash2 className="size-5" />
      </button>
      <span className="size-2.5 shrink-0 animate-pulse rounded-full bg-red-500" />
      <span className="w-12 shrink-0 text-sm font-medium tabular-nums">
        {duration(seconds * 1000)}
      </span>
      <div className="flex h-8 min-w-0 flex-1 items-center justify-end gap-[2px] overflow-hidden">
        {levels.map((v, i) => (
          <span
            key={i}
            className="w-[3px] shrink-0 rounded-full bg-accent/70"
            style={{ height: `${Math.max(10, Math.min(100, v * 100))}%` }}
          />
        ))}
      </div>
      <button
        type="button"
        disabled={sending}
        onClick={() => {
          if (done.current) return;
          done.current = true;
          setSending(true);
          void onSend();
        }}
        aria-label="Send voice message"
        title="Send"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent/90 disabled:opacity-60"
      >
        <SendHorizontal className="size-[18px]" />
      </button>
    </div>
  );
}
