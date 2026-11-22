import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { WebmailMeDto, WebmailMessage } from '@muvance/shared';
import { Composer, replyDraft, signatureHtml, type ComposeDraft } from '@/components/Composer';
import { MessageList } from '@/components/MessageList';
import { Reader } from '@/components/Reader';
import { SettingsDialog } from '@/components/SettingsDialog';
import { Sidebar } from '@/components/Sidebar';
import { useFolders } from '@/lib/queries';
import { cn } from '@/lib/utils';

interface Toast {
  id: number;
  text: string;
  action?: { label: string; run: () => void };
}

interface MailContextValue {
  me: WebmailMeDto;
  folder: string;
  setFolder: (path: string) => void;
  selected: number | null;
  select: (uid: number | null) => void;
  query: string;
  setQuery: (q: string) => void;
  compose: (draft?: Partial<ComposeDraft>) => void;
  reply: (message: WebmailMessage, mode: 'reply' | 'replyAll' | 'forward') => void;
  toast: (text: string, action?: Toast['action']) => void;
  openSettings: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  /** Ordered uids of the visible list, for j/k and "next after delete". */
  visibleUids: number[];
  setVisibleUids: (uids: number[]) => void;
}

const MailContext = createContext<MailContextValue | null>(null);

export function useMail() {
  const value = useContext(MailContext);
  if (!value) throw new Error('useMail must be used inside MailApp');
  return value;
}

let toastId = 1;
let draftKey = 1;

export function MailApp({ me }: { me: WebmailMeDto }) {
  const [params, setParams] = useSearchParams();
  const folder = params.get('folder') ?? 'INBOX';
  const selectedParam = params.get('m');
  const selected = selectedParam ? Number(selectedParam) : null;
  const [query, setQueryState] = useState('');
  const [drafts, setDrafts] = useState<ComposeDraft[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [visibleUids, setVisibleUids] = useState<number[]>([]);
  const folders = useFolders();

  // Keep the browser tab title useful: "Inbox (3) · Muvance Mail".
  useEffect(() => {
    const inbox = folders.data?.find((f) => f.role === 'inbox');
    document.title = inbox?.unread ? `Inbox (${inbox.unread}) · Muvance Mail` : 'Muvance Mail';
  }, [folders.data]);

  const setFolder = useCallback(
    (path: string) => {
      setQueryState('');
      setSidebarOpen(false);
      setParams(path === 'INBOX' ? {} : { folder: path });
    },
    [setParams],
  );

  const select = useCallback(
    (uid: number | null) => {
      const next = new URLSearchParams(params);
      if (uid == null) next.delete('m');
      else next.set('m', String(uid));
      setParams(next);
    },
    [params, setParams],
  );

  const toast = useCallback((text: string, action?: Toast['action']) => {
    const id = toastId++;
    setToasts((list) => [...list.slice(-2), { id, text, action }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), action ? 7000 : 4000);
  }, []);

  const compose = useCallback(
    (draft?: Partial<ComposeDraft>) => {
      setDrafts((list) => {
        if (draft?.draftUid && list.some((d) => d.draftUid === draft.draftUid)) return list;
        const next: ComposeDraft = {
          key: draftKey++,
          to: [],
          cc: [],
          bcc: [],
          subject: '',
          html: signatureHtml(me, draft?.from)
            ? `<p></p><p></p>${signatureHtml(me, draft?.from)}`
            : '',
          attachments: [],
          ...draft,
        };
        // One open composer at a time on phones; up to two side by side on desktop.
        return [...list.slice(-1), next];
      });
    },
    [me],
  );

  const reply = useCallback(
    (message: WebmailMessage, mode: 'reply' | 'replyAll' | 'forward') => {
      void replyDraft(message, mode, me).then((draft) => compose(draft));
    },
    [compose, me],
  );

  const value = useMemo<MailContextValue>(
    () => ({
      me,
      folder,
      setFolder,
      selected,
      select,
      query,
      setQuery: setQueryState,
      compose,
      reply,
      toast,
      openSettings: () => setSettingsOpen(true),
      sidebarOpen,
      setSidebarOpen,
      visibleUids,
      setVisibleUids,
    }),
    [
      me,
      folder,
      setFolder,
      selected,
      select,
      query,
      compose,
      reply,
      toast,
      sidebarOpen,
      visibleUids,
    ],
  );

  // Global shortcuts: c compose, / search, Esc closes the message.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, [contenteditable="true"]') || e.metaKey || e.ctrlKey) {
        return;
      }
      if (e.key === 'c') {
        e.preventDefault();
        compose();
      } else if (e.key === '/') {
        e.preventDefault();
        document.getElementById('mail-search')?.focus();
      } else if (e.key === 'Escape' && selected != null) {
        select(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [compose, select, selected]);

  return (
    <MailContext.Provider value={value}>
      <div className="flex h-dvh overflow-hidden">
        <Sidebar />
        <main className="flex min-w-0 flex-1 gap-2 p-0 md:py-2 md:pr-2">
          <section
            className={cn(
              'flex w-full min-w-0 flex-col bg-white md:rounded-2xl md:border md:border-line lg:w-[400px] lg:shrink-0 xl:w-[440px]',
              selected != null && 'hidden lg:flex',
            )}
          >
            {/* A new folder or search starts with a fresh list (selection, search box). */}
            <MessageList key={`${folder}|${query}`} />
          </section>
          <section
            className={cn(
              'min-w-0 flex-1 flex-col bg-white md:rounded-2xl md:border md:border-line',
              selected != null ? 'flex' : 'hidden lg:flex',
            )}
          >
            <Reader />
          </section>
        </main>
      </div>

      {/* Composers dock at the bottom right, like modern mail apps. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-end justify-end gap-3 sm:right-4 sm:left-auto">
        {drafts.map((draft) => (
          <Composer
            key={draft.key}
            initial={draft}
            onClose={() => setDrafts((list) => list.filter((d) => d.key !== draft.key))}
          />
        ))}
      </div>

      {settingsOpen && <SettingsDialog open onClose={() => setSettingsOpen(false)} />}

      <div
        className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-fade-up pointer-events-auto flex items-center gap-3 rounded-xl bg-ink py-2.5 pr-2 pl-4 text-sm text-white shadow-xl"
          >
            <span>{t.text}</span>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action?.run();
                  setToasts((list) => list.filter((x) => x.id !== t.id));
                }}
                className="rounded-lg px-2.5 py-1 font-medium text-[#9db2ff] hover:bg-white/10"
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </MailContext.Provider>
  );
}
