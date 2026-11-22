import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  ArrowLeft,
  ChevronDown,
  Download,
  FileText,
  FolderInput,
  Forward,
  ImageOff,
  Inbox,
  Mail,
  OctagonAlert,
  Reply,
  ReplyAll,
  Star,
  Trash2,
} from 'lucide-react';
import type { WebmailMessage } from '@muvance/shared';
import { attachmentUrl, errorMessage } from '@/lib/api';
import { useFolders, useMessage, useMessageActions } from '@/lib/queries';
import { frameDocument, sanitizeEmail } from '@/lib/sanitize';
import { cn, displayName, fileSize, longDate, shortDate, textToHtml } from '@/lib/utils';
import { useMail } from '@/pages/MailApp';
import { Avatar, IconButton, LogoMark, Spinner } from './ui';

const TRUSTED_KEY = 'muvance-mail:trusted-senders';
function trustedSenders(): string[] {
  try {
    return JSON.parse(localStorage.getItem(TRUSTED_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}
function trustSender(address: string) {
  try {
    localStorage.setItem(TRUSTED_KEY, JSON.stringify([...new Set([...trustedSenders(), address])]));
  } catch {
    // Storage blocked: images just stay off next time.
  }
}

export function Reader() {
  const { folder, selected, select, visibleUids, toast, reply, compose } = useMail();
  const folders = useFolders();
  const role = folders.data?.find((f) => f.path === folder)?.role ?? null;
  const message = useMessage(folder, selected);
  const { flags, move, remove } = useMessageActions(folder);

  const goNext = () => {
    const i = selected == null ? -1 : visibleUids.indexOf(selected);
    select(visibleUids[i + 1] ?? visibleUids[i - 1] ?? null);
  };

  const m = message.data;
  const actions = useMemo(() => {
    if (!m) return null;
    return {
      archive: () =>
        move.mutate(
          { uids: [m.uid], to: 'archive' },
          {
            onSuccess: () => toast('Archived'),
            onError: (e) => toast(errorMessage(e)),
          },
        ),
      delete: () =>
        remove.mutate([m.uid], {
          onSuccess: () => toast(role === 'trash' ? 'Deleted forever' : 'Moved to Trash'),
          onError: (e) => toast(errorMessage(e)),
        }),
      spam: () =>
        move.mutate(
          { uids: [m.uid], to: role === 'junk' ? 'inbox' : 'junk' },
          {
            onSuccess: () => toast(role === 'junk' ? 'Moved to Inbox' : 'Marked as spam'),
          },
        ),
      unread: () => {
        flags.mutate({ uids: [m.uid], seen: false });
        select(null);
      },
      star: () => flags.mutate({ uids: [m.uid], flagged: !m.flagged }),
    };
  }, [m, move, remove, flags, role, toast, select]);

  // Opening a draft continues it in the composer.
  useEffect(() => {
    if (role === 'drafts' && m) {
      compose({
        to: m.to.map((t) => t.address),
        cc: m.cc.map((t) => t.address),
        subject: m.subject,
        html: m.html ?? (m.text ? textToHtml(m.text) : ''),
        draftUid: m.uid,
      });
      select(null);
    }
  }, [role, m, compose, select]);

  // Shortcuts while reading: r reply, a reply all, f forward, e archive, # delete, s star, u unread.
  useEffect(() => {
    if (!m || !actions) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, [contenteditable="true"]') || e.metaKey || e.ctrlKey) {
        return;
      }
      const map: Record<string, () => void> = {
        r: () => reply(m, 'reply'),
        a: () => reply(m, 'replyAll'),
        f: () => reply(m, 'forward'),
        e: () => {
          actions.archive();
          goNext();
        },
        '#': () => {
          actions.delete();
          goNext();
        },
        s: actions.star,
        u: actions.unread,
      };
      const run = map[e.key];
      if (run) {
        e.preventDefault();
        run();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (selected == null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
        <LogoMark className="w-12 text-black/[0.07]" />
        <p className="mt-5 text-sm text-muted">Select a message to read it</p>
      </div>
    );
  }

  if (message.isLoading || !m || !actions) {
    return (
      <div className="flex flex-1 items-center justify-center">
        {message.isError ? (
          <p className="text-sm text-muted">{errorMessage(message.error)}</p>
        ) : (
          <Spinner className="size-5 text-muted" />
        )}
      </div>
    );
  }

  return (
    <>
      <header className="flex items-center gap-1 border-b border-line px-2 py-2 sm:px-3">
        <IconButton label="Back" onClick={() => select(null)} className="lg:hidden">
          <ArrowLeft />
        </IconButton>
        {role !== 'archive' && (
          <IconButton
            label="Archive (E)"
            onClick={() => {
              actions.archive();
              goNext();
            }}
          >
            <Archive />
          </IconButton>
        )}
        <IconButton
          label={role === 'trash' ? 'Delete forever (#)' : 'Delete (#)'}
          onClick={() => {
            actions.delete();
            goNext();
          }}
        >
          <Trash2 />
        </IconButton>
        <IconButton
          label={role === 'junk' ? 'Not spam' : 'Spam'}
          onClick={() => {
            actions.spam();
            goNext();
          }}
        >
          {role === 'junk' ? <Inbox /> : <OctagonAlert />}
        </IconButton>
        <span className="mx-1 h-5 w-px bg-line" />
        <IconButton label="Mark as unread (U)" onClick={actions.unread}>
          <Mail />
        </IconButton>
        <MoveMenu
          onMove={(to, name) =>
            move.mutate(
              { uids: [m.uid], to },
              {
                onSuccess: () => {
                  toast(`Moved to ${name}`);
                  goNext();
                },
              },
            )
          }
        />
        <div className="flex-1" />
        <IconButton label={m.flagged ? 'Unstar (S)' : 'Star (S)'} onClick={actions.star}>
          <Star className={cn(m.flagged && 'fill-amber-400 text-amber-400')} />
        </IconButton>
      </header>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        <article className="animate-fade-up mx-auto max-w-[820px] px-4 pt-6 pb-10 sm:px-8">
          <h2 className="text-[22px] leading-snug font-semibold tracking-tight">
            {m.subject || '(no subject)'}
          </h2>
          <Sender message={m} />
          <Body message={m} />
          {m.attachments.length > 0 && <Attachments message={m} />}

          <div className="mt-8 flex flex-wrap gap-2">
            <ReplyButton
              icon={<Reply />}
              label="Reply"
              hint="R"
              onClick={() => reply(m, 'reply')}
            />
            {m.to.length + m.cc.length > 1 && (
              <ReplyButton
                icon={<ReplyAll />}
                label="Reply all"
                hint="A"
                onClick={() => reply(m, 'replyAll')}
              />
            )}
            <ReplyButton
              icon={<Forward />}
              label="Forward"
              hint="F"
              onClick={() => reply(m, 'forward')}
            />
          </div>
        </article>
      </div>
    </>
  );
}

function Sender({ message: m }: { message: WebmailMessage }) {
  const [details, setDetails] = useState(false);
  const name = displayName(m.from);
  return (
    <div className="mt-5 flex items-start gap-3">
      <Avatar name={name} seed={m.from?.address ?? name} className="size-10" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold">{name}</span>
          <span className="truncate text-sm text-muted">{m.from?.address}</span>
        </div>
        <button
          type="button"
          onClick={() => setDetails((d) => !d)}
          className="flex items-center gap-1 text-left text-[13px] text-muted hover:text-ink"
        >
          <span className="truncate">
            to {m.to.map((t) => displayName(t)).join(', ') || 'undisclosed recipients'}
            {m.cc.length > 0 && `, cc ${m.cc.map((t) => displayName(t)).join(', ')}`}
          </span>
          <ChevronDown className={cn('size-3.5 shrink-0 transition', details && 'rotate-180')} />
        </button>
        {details && (
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-xl bg-canvas p-3 text-[13px]">
            <dt className="text-muted">From</dt>
            <dd className="break-all">{m.from ? `${m.from.name} <${m.from.address}>` : '—'}</dd>
            <dt className="text-muted">To</dt>
            <dd className="break-all">{m.to.map((t) => t.address).join(', ') || '—'}</dd>
            {m.cc.length > 0 && (
              <>
                <dt className="text-muted">Cc</dt>
                <dd className="break-all">{m.cc.map((t) => t.address).join(', ')}</dd>
              </>
            )}
            <dt className="text-muted">Date</dt>
            <dd>{longDate(m.date)}</dd>
          </dl>
        )}
      </div>
      <span className="shrink-0 pt-0.5 text-xs text-muted" title={longDate(m.date)}>
        {shortDate(m.date)}
      </span>
    </div>
  );
}

function Body({ message: m }: { message: WebmailMessage }) {
  const sender = m.from?.address ?? '';
  const [allowRemote, setAllowRemote] = useState(() => trustedSenders().includes(sender));
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(200);

  const { html, blockedImages } = useMemo(() => {
    const source =
      m.html ?? (m.text ? `<div style="white-space:normal">${textToHtml(m.text)}</div>` : '');
    return sanitizeEmail(source, { allowRemote });
  }, [m.html, m.text, allowRemote]);

  // Grow the frame to fit the email, so the page scrolls as one.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    let observer: ResizeObserver | undefined;
    const fit = () => {
      const doc = el.contentDocument;
      if (!doc?.body) return;
      setHeight(Math.max(80, doc.documentElement.scrollHeight));
      observer?.disconnect();
      observer = new ResizeObserver(() =>
        setHeight(Math.max(80, doc.documentElement.scrollHeight)),
      );
      observer.observe(doc.body);
    };
    el.addEventListener('load', fit);
    return () => {
      el.removeEventListener('load', fit);
      observer?.disconnect();
    };
  }, [html]);

  return (
    <div className="mt-6">
      {blockedImages > 0 && !allowRemote && (
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-[13px]">
          <ImageOff className="size-4 text-muted" />
          <span className="flex-1 text-muted">
            Images are hidden so the sender can't see when you open this.
          </span>
          <button
            type="button"
            className="font-medium text-accent"
            onClick={() => setAllowRemote(true)}
          >
            Show images
          </button>
          {sender && (
            <button
              type="button"
              className="font-medium text-accent"
              onClick={() => {
                trustSender(sender);
                setAllowRemote(true);
              }}
            >
              Always from this sender
            </button>
          )}
        </div>
      )}
      <iframe
        ref={frame}
        title="Message"
        srcDoc={frameDocument(html)}
        // No scripts can run; same-origin only lets the app measure its height.
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        className="w-full border-0"
        style={{ height }}
      />
    </div>
  );
}

function Attachments({ message: m }: { message: WebmailMessage }) {
  return (
    <div className="mt-6 border-t border-line pt-5">
      <p className="mb-3 text-[13px] font-medium text-muted">
        {m.attachments.length} attachment{m.attachments.length === 1 ? '' : 's'}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {m.attachments.map((a) => (
          <a
            key={a.index}
            href={attachmentUrl(m.folder, m.uid, a.index)}
            className="group flex items-center gap-3 rounded-xl border border-line p-3 transition hover:border-ink/20 hover:bg-canvas"
          >
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-canvas text-muted group-hover:bg-white">
              <FileText className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{a.filename}</span>
              <span className="text-xs text-muted">{fileSize(a.size)}</span>
            </span>
            <Download className="size-4 text-muted opacity-0 transition group-hover:opacity-100" />
          </a>
        ))}
      </div>
    </div>
  );
}

function ReplyButton({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3.5 text-sm font-medium transition hover:bg-canvas [&_svg]:size-4"
    >
      {icon}
      {label}
      <span className="hidden text-xs text-muted sm:inline">{hint}</span>
    </button>
  );
}

function MoveMenu({ onMove }: { onMove: (to: string, name: string) => void }) {
  const { folder } = useMail();
  const folders = useFolders();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <IconButton label="Move to" onClick={() => setOpen((o) => !o)}>
        <FolderInput />
      </IconButton>
      {open && (
        <div className="animate-fade-up absolute top-10 left-0 z-20 w-52 rounded-xl border border-line bg-white p-1.5 shadow-xl">
          <p className="px-2.5 py-1.5 text-[11px] font-medium tracking-wider text-muted uppercase">
            Move to
          </p>
          {folders.data
            ?.filter((f) => f.path !== folder && f.role !== 'drafts' && f.role !== 'sent')
            .map((f) => (
              <button
                key={f.path}
                type="button"
                onClick={() => {
                  setOpen(false);
                  onMove(f.path, f.role === 'junk' ? 'Spam' : f.name);
                }}
                className="flex w-full rounded-lg px-2.5 py-2 text-left text-sm hover:bg-black/[0.04]"
              >
                {f.role === 'junk' ? 'Spam' : f.name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
