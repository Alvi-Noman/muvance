import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Archive,
  ChevronsUpDown,
  FileText,
  Folder,
  Inbox,
  LogOut,
  OctagonAlert,
  PenSquare,
  Send,
  Settings,
  Trash2,
} from 'lucide-react';
import type { WebmailFolderRole } from '@muvance/shared';
import { api } from '@/lib/api';
import { useFolders } from '@/lib/queries';
import { cn } from '@/lib/utils';
import { useMail } from '@/pages/MailApp';
import { Avatar, Kbd, LogoMark } from './ui';

const icons: Record<Exclude<WebmailFolderRole, null>, typeof Inbox> = {
  inbox: Inbox,
  drafts: FileText,
  sent: Send,
  archive: Archive,
  junk: OctagonAlert,
  trash: Trash2,
};
const labels: Partial<Record<Exclude<WebmailFolderRole, null>, string>> = {
  junk: 'Spam',
};

export function Sidebar() {
  const { folder, setFolder, compose, sidebarOpen, setSidebarOpen } = useMail();
  const folders = useFolders();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/25 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-canvas px-3 pt-4 pb-3 transition-transform md:static md:z-auto md:w-[232px] md:translate-x-0',
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-2 px-2.5 pb-5">
          <LogoMark className="w-7 text-ink" />
          <span className="font-logo text-[17px] font-semibold tracking-[-0.03em]">
            Muvance <span className="font-sans font-normal text-muted">Mail</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setSidebarOpen(false);
            compose();
          }}
          className="group mb-4 flex h-10 items-center justify-between rounded-xl bg-ink px-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-black/85"
        >
          <span className="flex items-center gap-2">
            <PenSquare className="size-4" /> New message
          </span>
          <span className="hidden rounded border border-white/20 px-1.5 text-[11px] text-white/60 md:inline">
            C
          </span>
        </button>

        <nav className="scrollbar-thin -mx-1 flex-1 space-y-0.5 overflow-y-auto px-1">
          {folders.isLoading &&
            Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-black/[0.03]" />
            ))}
          {folders.data?.map((f, i) => {
            const Icon = (f.role && icons[f.role]) || Folder;
            const active = f.path === folder;
            const showCount = f.role === 'drafts' ? f.total : f.role === 'trash' ? 0 : f.unread;
            const firstCustom = !f.role && folders.data?.[i - 1]?.role;
            return (
              <div key={f.path}>
                {firstCustom && (
                  <p className="px-3 pt-4 pb-1.5 text-[11px] font-medium tracking-wider text-muted uppercase">
                    Folders
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setFolder(f.path)}
                  className={cn(
                    'flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition',
                    active
                      ? 'bg-white font-medium text-ink shadow-[0_1px_2px_rgb(0_0_0/0.06)]'
                      : 'text-[#3f3f3c] hover:bg-black/[0.04]',
                  )}
                >
                  <Icon className={cn('size-[17px]', active ? 'text-ink' : 'text-muted')} />
                  <span className="flex-1 truncate">{(f.role && labels[f.role]) || f.name}</span>
                  {showCount > 0 && (
                    <span
                      className={cn(
                        'text-xs tabular-nums',
                        f.role === 'inbox' ? 'font-semibold text-accent' : 'text-muted',
                      )}
                    >
                      {showCount}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        <div className="mt-3 hidden px-3 pb-3 text-[11px] leading-5 text-muted md:block">
          <Kbd>C</Kbd> compose · <Kbd>/</Kbd> search · <Kbd>J</Kbd>
          <Kbd>K</Kbd> move
        </div>
        <AccountMenu />
      </aside>
    </>
  );
}

function AccountMenu() {
  const { me, openSettings } = useMail();
  const queryClient = useQueryClient();
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
      {open && (
        <div className="animate-fade-up absolute bottom-14 left-0 w-full rounded-xl border border-line bg-white p-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              openSettings();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-black/[0.04]"
          >
            <Settings className="size-4 text-muted" /> Settings
          </button>
          <button
            type="button"
            onClick={async () => {
              await api.post('/logout').catch(() => {});
              queryClient.clear();
              queryClient.setQueryData(['me'], null);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-black/[0.04]"
          >
            <LogOut className="size-4 text-muted" /> Sign out
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition hover:bg-black/[0.04]"
      >
        <Avatar name={me.displayName} seed={me.address} src={me.avatarUrl} className="size-8" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{me.displayName}</span>
          <span className="block truncate text-xs text-muted">{me.address}</span>
        </span>
        <ChevronsUpDown className="size-4 text-muted" />
      </button>
    </div>
  );
}
