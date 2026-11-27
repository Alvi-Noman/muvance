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
import { FileText, Paperclip, SendHorizontal, Smile, Type, X } from 'lucide-react';
import {
  CHAT_ATTACHMENTS_MAX,
  CHAT_FILE_MAX_BYTES,
  type ChatAttachmentDto,
  type ChatMessageDto,
  type ChatPersonDto,
} from '@muvance/shared';
import { api, errorMessage, uploadFile } from '@/lib/api';
import { patchSpace, upsertMessage, useChat } from '@/lib/data';
import { toStored } from '@/lib/mentions';
import { cn, fileSize } from '@/lib/utils';
import { EmojiPicker } from './EmojiPicker';
import { Avatar, useToast } from './ui';

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

async function imageSize(file: File) {
  if (!file.type.startsWith('image/')) return null;
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return null;
  }
}

export function Composer({
  spaceId,
  threadId,
  placeholder,
  members,
  allowAll,
  autoFocus,
  ref,
}: {
  spaceId: string;
  threadId: string | null;
  placeholder: string;
  /** People who can be @mentioned. */
  members: ChatPersonDto[];
  allowAll: boolean;
  autoFocus?: boolean;
  ref?: Ref<ComposerHandle>;
}) {
  const { me } = useChat();
  const qc = useQueryClient();
  const toast = useToast();
  const draftKey = `${spaceId}:${threadId ?? ''}`;
  const [text, setText] = useState(() => drafts.get(draftKey) ?? '');
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [mention, setMention] = useState<{ query: string; start: number } | null>(null);
  const [mentionIndex, setMentionIndex] = useState(0);
  const area = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
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

  const addFiles = (files: File[]) => {
    const room = CHAT_ATTACHMENTS_MAX - uploadsRef.current.length;
    if (files.length > room) toast(`Up to ${CHAT_ATTACHMENTS_MAX} files per message.`);
    for (const file of files.slice(0, Math.max(0, room))) {
      if (file.size > CHAT_FILE_MAX_BYTES) {
        toast(`${file.name} is too large (25 MB at most).`);
        continue;
      }
      const upload: Upload = {
        key: `${Date.now()}-${Math.random()}`,
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        progress: 0,
        attachment: null,
        error: null,
        controller: new AbortController(),
      };
      const update = (patch: Partial<Upload>) =>
        setUploads((list) => list.map((u) => (u.key === upload.key ? { ...u, ...patch } : u)));
      setUploads((list) => [...list, upload]);
      void imageSize(file)
        .then((dims) =>
          uploadFile(
            spaceId,
            file,
            dims,
            (progress) => update({ progress }),
            upload.controller.signal,
          ),
        )
        .then((attachment) => update({ attachment, progress: 1 }))
        .catch((error: unknown) => {
          if (!upload.controller.signal.aborted) update({ error: errorMessage(error) });
        });
    }
    area.current?.focus();
  };

  useImperativeHandle(ref, () => ({ addFiles, focus: () => area.current?.focus() }));

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

  const send = async () => {
    if (!canSend) return;
    const stored = toStored(text.trim(), members, allowAll);
    const attachmentIds = ready.map((u) => u.attachment!.id);
    const before = { text, uploads };
    setText('');
    setUploads([]);
    setMention(null);
    try {
      const message = await api.post<ChatMessageDto>(`/spaces/${spaceId}/messages`, {
        text: stored,
        threadId,
        attachmentIds,
      });
      upsertMessage(qc, message);
      patchSpace(qc, spaceId, (s) => ({
        ...s,
        lastMessageAt: message.createdAt,
        lastMessage: { authorId: message.authorId, text: message.text },
        unread: 0,
        mentioned: false,
      }));
      for (const u of before.uploads) if (u.preview) URL.revokeObjectURL(u.preview);
    } catch (error) {
      setText(before.text);
      setUploads(before.uploads);
      toast(errorMessage(error));
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
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      // On phones, Enter makes a new line; the send button sends.
      if (window.matchMedia('(hover: none)').matches) return;
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

  return (
    <div className="relative">
      {mention && candidates.length > 0 && (
        <div className="animate-fade-up absolute bottom-full left-0 z-30 mb-2 w-72 rounded-xl border border-line bg-white p-1 shadow-xl">
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

      <div className="rounded-2xl bg-canvas ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-line">
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
                {u.preview ? (
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

        <div className="flex items-end gap-1 p-1.5 pl-2">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            aria-label="Attach files"
            title="Attach files"
            className="mb-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-black/5 hover:text-ink"
          >
            <Paperclip className="size-5" />
          </button>
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
            className="scrollbar-thin max-h-[220px] min-h-10 min-w-0 flex-1 resize-none bg-transparent px-1.5 py-2 text-[15px] leading-6 outline-none placeholder:text-neutral-400"
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
          </div>
        </div>
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
