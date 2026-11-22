import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Minimize2,
  Minus,
  Paperclip,
  Quote,
  Send,
  Trash2,
  Underline,
  X,
} from 'lucide-react';
import type { WebmailContact, WebmailMeDto, WebmailMessage } from '@muvance/shared';
import { api, attachmentUrl, errorMessage } from '@/lib/api';
import { sanitizeEmail } from '@/lib/sanitize';
import { useRefresh } from '@/lib/queries';
import {
  cn,
  displayName,
  escapeHtml,
  fileSize,
  fileToBase64,
  longDate,
  textToHtml,
} from '@/lib/utils';
import { useMail } from '@/pages/MailApp';
import { IconButton, Spinner } from './ui';

export interface ComposeAttachment {
  filename: string;
  contentType: string;
  size: number;
  content: string; // base64
}

export interface ComposeDraft {
  key: number;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  html: string;
  attachments: ComposeAttachment[];
  inReplyTo?: string;
  references?: string[];
  replyTo?: { folder: string; uid: number };
  draftUid?: number;
  /** Which of your addresses it's sent from (defaults to your own). */
  from?: string;
}

/** Your signature for an address, as HTML to put at the end of a message. */
export function signatureHtml(me: WebmailMeDto, from?: string) {
  const identity = me.identities.find((i) => i.address === from) ?? me.identities[0];
  const text = identity?.signature ?? me.signature;
  return text ? `<p>—<br>${escapeHtml(text).replace(/\n/g, '<br>')}</p>` : '';
}

/** The address a reply goes out from: the one of yours the message was sent to. */
function replyIdentity(m: WebmailMessage, me: WebmailMeDto) {
  const recipients = [...m.to, ...m.cc].map((r) => r.address.toLowerCase());
  return (me.identities.find((i) => recipients.includes(i.address)) ?? me.identities[0])?.address;
}

const MAX_TOTAL = 25 * 1024 * 1024;

/** Builds the draft for Reply, Reply all or Forward, quoting the original. */
export async function replyDraft(
  m: WebmailMessage,
  mode: 'reply' | 'replyAll' | 'forward',
  me: WebmailMeDto,
): Promise<Partial<ComposeDraft>> {
  const original = sanitizeEmail(m.html ?? (m.text ? textToHtml(m.text) : ''), {
    allowRemote: true,
  }).html;
  const from = replyIdentity(m, me);
  const signature = signatureHtml(me, from);
  const header =
    mode === 'forward'
      ? `<p>---------- Forwarded message ----------<br>From: ${escapeHtml(displayName(m.from))} &lt;${escapeHtml(m.from?.address ?? '')}&gt;<br>Date: ${escapeHtml(longDate(m.date))}<br>Subject: ${escapeHtml(m.subject)}</p>`
      : `<p>On ${escapeHtml(longDate(m.date))}, ${escapeHtml(displayName(m.from))} wrote:</p>`;
  const html = `<p></p>${signature}${header}<blockquote>${original}</blockquote>`;
  const prefix = mode === 'forward' ? 'Fwd: ' : 'Re: ';
  const subject = new RegExp(`^${prefix.trim()}`, 'i').test(m.subject)
    ? m.subject
    : prefix + m.subject;

  if (mode === 'forward') {
    const attachments: ComposeAttachment[] = [];
    for (const a of m.attachments) {
      const blob = await fetch(attachmentUrl(m.folder, m.uid, a.index), {
        credentials: 'include',
      }).then((r) => r.blob());
      attachments.push({
        filename: a.filename,
        contentType: a.contentType,
        size: a.size,
        content: await fileToBase64(blob),
      });
    }
    return { subject, html, attachments, from };
  }

  const mine = new Set(me.identities.map((i) => i.address));
  const replyAddress = (m.replyTo[0] ?? m.from)?.address;
  const to =
    replyAddress && !mine.has(replyAddress)
      ? [replyAddress]
      : m.to.map((t) => t.address).filter((a) => !mine.has(a));
  const cc =
    mode === 'replyAll'
      ? [...m.to, ...m.cc].map((t) => t.address).filter((a) => !mine.has(a) && !to.includes(a))
      : [];
  return {
    to,
    cc,
    subject,
    html,
    inReplyTo: m.messageId ?? undefined,
    references: [...m.references, ...(m.messageId ? [m.messageId] : [])],
    replyTo: { folder: m.folder, uid: m.uid },
    from,
  };
}

export function Composer({ initial, onClose }: { initial: ComposeDraft; onClose: () => void }) {
  const { toast, me } = useMail();
  const refresh = useRefresh();
  const [from, setFrom] = useState(initial.from ?? me.address);
  const [to, setTo] = useState(initial.to);
  const [cc, setCc] = useState(initial.cc);
  const [bcc, setBcc] = useState(initial.bcc);
  const [showCc, setShowCc] = useState(initial.cc.length + initial.bcc.length > 0);
  const [subject, setSubject] = useState(initial.subject);
  const [attachments, setAttachments] = useState(initial.attachments);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [draftUid, setDraftUid] = useState(initial.draftUid);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const dirty = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
      Placeholder.configure({ placeholder: 'Write your message…' }),
    ],
    content: initial.html,
    autofocus: initial.to.length ? 'start' : false,
    onUpdate: () => {
      dirty.current = true;
    },
    editorProps: { attributes: { class: 'px-4 py-3' } },
  });

  const payload = useCallback(
    () => ({
      to,
      cc,
      bcc,
      subject,
      html: editor?.getHTML() ?? '',
      text: editor?.getText({ blockSeparator: '\n\n' }) ?? '',
      attachments: attachments.map(({ filename, contentType, content }) => ({
        filename,
        contentType,
        content,
      })),
      inReplyTo: initial.inReplyTo,
      references: initial.references,
      replyTo: initial.replyTo,
      draftUid,
      from,
    }),
    [to, cc, bcc, subject, editor, attachments, initial, draftUid, from],
  );

  const saveDraft = useMutation({
    mutationFn: () => api.post<{ draftUid: number | null }>('/drafts', payload()),
    onSuccess: (r) => {
      dirty.current = false;
      if (r.draftUid) setDraftUid(r.draftUid);
      setSavedAt(new Date());
      refresh();
    },
  });

  const send = useMutation({
    mutationFn: () => api.post('/send', payload()),
    onSuccess: () => {
      toast('Message sent');
      refresh();
      onClose();
    },
    onError: (error) => toast(errorMessage(error)),
  });

  // Autosave every 15 seconds while there are unsaved changes.
  useEffect(() => {
    const id = setInterval(() => {
      if (dirty.current && !saveDraft.isPending && !send.isPending) saveDraft.mutate();
    }, 15_000);
    return () => clearInterval(id);
  }, [saveDraft, send.isPending]);

  useEffect(() => {
    dirty.current = true;
  }, [to, cc, bcc, subject, attachments]);

  const discard = async () => {
    if (draftUid) {
      const drafts = await api.get<{ path: string; role: string | null }[]>('/folders');
      const path = drafts.find((f) => f.role === 'drafts')?.path;
      if (path)
        await api.post('/messages/delete', { folder: path, uids: [draftUid] }).catch(() => {});
      refresh();
    }
    onClose();
  };

  const close = () => {
    if (dirty.current && (editor?.getText().trim() || to.length || subject)) {
      saveDraft.mutate(undefined, { onSettled: onClose });
      toast('Saved to Drafts');
    } else {
      onClose();
    }
  };

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    let total = attachments.reduce((s, a) => s + a.size, 0);
    const added: ComposeAttachment[] = [];
    for (const file of Array.from(files)) {
      if (total + file.size > MAX_TOTAL) {
        toast('Attachments can be 25 MB in total');
        break;
      }
      total += file.size;
      added.push({
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size,
        content: await fileToBase64(file),
      });
    }
    setAttachments((list) => [...list, ...added]);
  };

  const trySend = () => {
    if (!to.length && !cc.length && !bcc.length) {
      toast('Add at least one recipient');
      return;
    }
    if (!subject.trim() && !window.confirm('Send without a subject?')) return;
    send.mutate();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      trySend();
    }
  };

  const title = subject || (initial.inReplyTo ? 'Reply' : 'New message');

  return (
    <div
      onKeyDown={onKeyDown}
      className={cn(
        'animate-slide-in pointer-events-auto flex flex-col overflow-hidden bg-white shadow-[0_12px_48px_rgb(0_0_0/0.18)] ring-1 ring-black/[0.06]',
        minimized
          ? 'h-12 w-full rounded-t-xl sm:w-[320px]'
          : maximized
            ? 'fixed inset-0 z-50 sm:inset-6 sm:rounded-2xl'
            : 'fixed inset-0 z-50 sm:static sm:h-[600px] sm:max-h-[calc(100vh-2rem)] sm:w-[560px] sm:rounded-t-2xl',
      )}
    >
      {/* Title bar */}
      <div
        className={cn(
          'flex h-12 shrink-0 cursor-pointer items-center gap-1 px-4',
          minimized ? 'bg-ink text-white' : 'border-b border-line',
        )}
        onClick={() => minimized && setMinimized(false)}
      >
        <span className="flex-1 truncate text-sm font-medium">{title}</span>
        <IconButton
          label={minimized ? 'Open' : 'Minimize'}
          className={cn(minimized && 'text-white/70 hover:bg-white/10 hover:text-white')}
          onClick={(e) => {
            e.stopPropagation();
            setMinimized((v) => !v);
          }}
        >
          <Minus />
        </IconButton>
        {!minimized && (
          <IconButton
            label={maximized ? 'Exit full screen' : 'Full screen'}
            className="hidden sm:inline-flex"
            onClick={() => setMaximized((v) => !v)}
          >
            {maximized ? <Minimize2 /> : <Maximize2 />}
          </IconButton>
        )}
        <IconButton
          label="Close"
          className={cn(minimized && 'text-white/70 hover:bg-white/10 hover:text-white')}
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
        >
          <X />
        </IconButton>
      </div>

      {!minimized && (
        <>
          <div className="border-b border-line">
            {me.identities.length > 1 && (
              <label className="flex min-h-11 items-center gap-1.5 border-b border-line px-4">
                <span className="w-10 shrink-0 text-sm text-muted">From</span>
                <select
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    dirty.current = true;
                  }}
                  className="h-9 min-w-0 flex-1 cursor-pointer bg-transparent text-sm outline-none"
                >
                  {me.identities.map((i) => (
                    <option key={i.address} value={i.address}>
                      {i.name} &lt;{i.address}&gt;
                    </option>
                  ))}
                </select>
              </label>
            )}
            <RecipientField
              label="To"
              values={to}
              onChange={setTo}
              autoFocus={!initial.to.length}
              extra={
                !showCc && (
                  <button
                    type="button"
                    onClick={() => setShowCc(true)}
                    className="px-1 text-[13px] text-muted hover:text-ink"
                  >
                    Cc Bcc
                  </button>
                )
              }
            />
            {showCc && (
              <>
                <RecipientField label="Cc" values={cc} onChange={setCc} />
                <RecipientField label="Bcc" values={bcc} onChange={setBcc} />
              </>
            )}
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="h-11 w-full border-t border-line px-4 text-[15px] font-medium outline-none placeholder:font-normal placeholder:text-muted"
            />
          </div>

          <Toolbar editor={editor} />
          <div
            className="editor scrollbar-thin min-h-0 flex-1 cursor-text overflow-y-auto"
            onClick={() => editor?.commands.focus()}
          >
            <EditorContent editor={editor} />
          </div>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-line px-4 py-2.5">
              {attachments.map((a, i) => (
                <span
                  key={`${a.filename}-${i}`}
                  className="inline-flex max-w-[220px] items-center gap-2 rounded-lg border border-line bg-canvas py-1 pr-1 pl-2.5 text-xs"
                >
                  <Paperclip className="size-3.5 shrink-0 text-muted" />
                  <span className="truncate font-medium">{a.filename}</span>
                  <span className="shrink-0 text-muted">{fileSize(a.size)}</span>
                  <button
                    type="button"
                    onClick={() => setAttachments((l) => l.filter((_, j) => j !== i))}
                    className="rounded p-0.5 text-muted hover:bg-black/5 hover:text-ink"
                    aria-label={`Remove ${a.filename}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <footer className="flex items-center gap-1 border-t border-line px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={trySend}
              disabled={send.isPending}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-ink pr-2 pl-4 text-sm font-medium text-white transition hover:bg-black/85 disabled:opacity-60"
            >
              {send.isPending ? <Spinner /> : <Send className="size-4" />}
              Send
              <span className="ml-1 hidden rounded bg-white/15 px-1.5 py-0.5 text-[10px] text-white/80 sm:inline">
                Ctrl ↵
              </span>
            </button>
            <IconButton label="Attach files" onClick={() => fileInput.current?.click()}>
              <Paperclip />
            </IconButton>
            <input
              ref={fileInput}
              type="file"
              multiple
              hidden
              onChange={(e) => {
                void addFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <span className="flex-1 truncate px-2 text-xs text-muted">
              {saveDraft.isPending
                ? 'Saving…'
                : savedAt
                  ? `Draft saved ${savedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
                  : ''}
            </span>
            <IconButton label="Discard" onClick={() => void discard()}>
              <Trash2 />
            </IconButton>
          </footer>
        </>
      )}
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;
  const btn = (label: string, icon: React.ReactNode, run: () => void, active: boolean) => (
    <IconButton label={label} active={active} onClick={run} className="size-7 [&_svg]:size-4">
      {icon}
    </IconButton>
  );
  return (
    <div className="flex items-center gap-0.5 border-b border-line px-3 py-1">
      {btn(
        'Bold',
        <Bold />,
        () => editor.chain().focus().toggleBold().run(),
        editor.isActive('bold'),
      )}
      {btn(
        'Italic',
        <Italic />,
        () => editor.chain().focus().toggleItalic().run(),
        editor.isActive('italic'),
      )}
      {btn(
        'Underline',
        <Underline />,
        () => editor.chain().focus().toggleUnderline().run(),
        editor.isActive('underline'),
      )}
      <span className="mx-1 h-4 w-px bg-line" />
      {btn(
        'Bulleted list',
        <List />,
        () => editor.chain().focus().toggleBulletList().run(),
        editor.isActive('bulletList'),
      )}
      {btn(
        'Numbered list',
        <ListOrdered />,
        () => editor.chain().focus().toggleOrderedList().run(),
        editor.isActive('orderedList'),
      )}
      {btn(
        'Quote',
        <Quote />,
        () => editor.chain().focus().toggleBlockquote().run(),
        editor.isActive('blockquote'),
      )}
      <span className="mx-1 h-4 w-px bg-line" />
      {btn(
        'Link',
        <Link2 />,
        () => {
          if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
            return;
          }
          const url = window.prompt('Link address', 'https://');
          if (url && url !== 'https://') editor.chain().focus().setLink({ href: url }).run();
        },
        editor.isActive('link'),
      )}
    </div>
  );
}

/** Email addresses as chips, with suggestions from people you've written to and your team. */
function RecipientField({
  label,
  values,
  onChange,
  autoFocus,
  extra,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  autoFocus?: boolean;
  extra?: React.ReactNode;
}) {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState<WebmailContact[]>([]);
  const [highlight, setHighlight] = useState(0);
  // Only show suggestions while something is typed.
  const shown = text.trim() ? suggestions : [];

  useEffect(() => {
    const q = text.trim();
    if (!q) return;
    const id = setTimeout(() => {
      void api
        .get<WebmailContact[]>(`/contacts?q=${encodeURIComponent(q)}`)
        .then((list) => setSuggestions(list.filter((c) => !values.includes(c.address))))
        .catch(() => setSuggestions([]));
    }, 150);
    return () => clearTimeout(id);
  }, [text, values]);

  const add = (raw: string) => {
    const parts = raw
      .split(/[\s,;]+/)
      .map((p) =>
        p
          .replace(/^.*<|>$/g, '')
          .trim()
          .toLowerCase(),
      )
      .filter(Boolean);
    const valid = parts.filter((p) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p) && !values.includes(p));
    if (valid.length) onChange([...values, ...valid]);
    setText('');
    setSuggestions([]);
    setHighlight(0);
  };

  return (
    <div className="relative flex min-h-11 flex-wrap items-center gap-1.5 px-4 py-1.5 [&+&]:border-t [&+&]:border-line">
      <span className="w-8 shrink-0 text-sm text-muted">{label}</span>
      {values.map((v) => (
        <span
          key={v}
          className="inline-flex items-center gap-1 rounded-full bg-canvas py-0.5 pr-1 pl-2.5 text-[13px]"
        >
          {v}
          <button
            type="button"
            onClick={() => onChange(values.filter((x) => x !== v))}
            className="rounded-full p-0.5 text-muted hover:bg-black/5 hover:text-ink"
            aria-label={`Remove ${v}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={text}
        autoFocus={autoFocus}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => text.trim() && add(text)}
        onPaste={(e) => {
          const pasted = e.clipboardData.getData('text');
          if (/[,;\s]/.test(pasted.trim())) {
            e.preventDefault();
            add(pasted);
          }
        }}
        onKeyDown={(e) => {
          if (shown.length && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            setHighlight(
              (h) => (h + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % shown.length,
            );
          } else if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab' || e.key === ';') {
            if (!text.trim()) return;
            e.preventDefault();
            const pick = shown[highlight];
            add(pick ? pick.address : text);
          } else if (e.key === 'Backspace' && !text && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        className="h-8 min-w-[140px] flex-1 bg-transparent text-sm outline-none"
      />
      {extra}
      {shown.length > 0 && (
        <ul className="absolute top-full left-12 z-20 mt-1 w-72 rounded-xl border border-line bg-white p-1 shadow-xl">
          {shown.map((s, i) => (
            <li key={s.address}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(s.address);
                }}
                className={cn(
                  'flex w-full flex-col rounded-lg px-3 py-2 text-left',
                  i === highlight ? 'bg-canvas' : 'hover:bg-canvas',
                )}
              >
                {s.name && <span className="text-sm font-medium">{s.name}</span>}
                <span className="text-[13px] text-muted">{s.address}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
