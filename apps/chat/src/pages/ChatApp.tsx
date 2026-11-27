import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  BellOff,
  LogOut,
  MessageSquareText,
  Search,
  Settings,
  Smartphone,
  SmilePlus,
  WifiOff,
  X,
} from 'lucide-react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { api } from '@/lib/api';
import { useChat } from '@/lib/data';
import { useConnection, useLiveUpdates } from '@/lib/live';
import { stopPushForSignOut, usePushSetup } from '@/lib/push';
import { takeShared, type SharedItems } from '@/lib/share';
import { cn } from '@/lib/utils';
import { Avatar, IconButton, LogoMark, Menu, MenuItem } from '@/components/ui';
import { Conversation } from '@/components/Conversation';
import { SavedView } from '@/components/SavedView';
import { SearchResults } from '@/components/SearchResults';
import { SettingsDialog, type SettingsTab } from '@/components/SettingsDialog';
import { Sidebar } from '@/components/Sidebar';
import { ShareDialog } from '@/components/dialogs/ShareDialog';
import { StatusDialog } from '@/components/dialogs/StatusDialog';

export function ChatApp() {
  const { me, spaces, pushKey } = useChat();
  const { spaceId } = useParams();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const connection = useConnection();
  const [query, setQuery] = useState('');
  const [settings, setSettings] = useState<SettingsTab | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [shared, setShared] = useState<SharedItems | null>(null);
  const savedPage = location.pathname === '/saved';
  useLiveUpdates(me.id);
  usePushSetup(
    pushKey,
    useCallback((url: string) => navigate(url), [navigate]),
  );

  // Opened from "Share to Muvance Chat" on the phone.
  useEffect(() => {
    if (params.get('shared') !== '1') return;
    setParams({}, { replace: true });
    void takeShared().then((items) => items && setShared(items));
  }, [params, setParams]);

  // "(3) Muvance Chat" while there's something unread, and the count on the app's icon.
  const unread = spaces.reduce((n, s) => n + (s.muted && !s.mentioned ? 0 : s.unread), 0);
  useEffect(() => {
    document.title = unread ? `(${unread}) Muvance Chat` : 'Muvance Chat';
    const nav = navigator as Navigator & {
      setAppBadge?: (n?: number) => Promise<void>;
      clearAppBadge?: () => Promise<void>;
    };
    if (unread) void nav.setAppBadge?.(unread).catch(() => {});
    else void nav.clearAppBadge?.().catch(() => {});
  }, [unread]);

  const searching = query.trim().length >= 2;
  const dndOn = me.dnd;

  const signOut = async () => {
    await stopPushForSignOut();
    await api.post('/logout').catch(() => {});
    qc.clear();
    navigate('/', { replace: true });
    await qc.resetQueries();
  };

  return (
    <div className="flex h-dvh flex-col">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 px-3 sm:px-4">
        <button
          type="button"
          onClick={() => {
            setQuery('');
            navigate('/');
          }}
          className={cn(
            'flex shrink-0 items-center gap-2 rounded-lg px-1.5 py-1 md:w-64',
            searching || spaceId || savedPage ? 'max-md:hidden' : '',
          )}
        >
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-accent text-white">
            <LogoMark className="w-5" />
          </span>
          <span className="font-logo text-[17px] font-semibold tracking-[-0.03em]">Chat</span>
        </button>
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-4 ring-1 ring-line transition focus-within:ring-2 focus-within:ring-accent/40 md:max-w-2xl">
          <Search className="size-4 shrink-0 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
            placeholder="Search messages and files"
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="text-muted hover:text-ink"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1">
          {connection === 'lost' && (
            <span
              className="mr-1 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800"
              title="Reconnecting… new messages will appear when you're back online."
            >
              <WifiOff className="size-3.5" />
              <span className="max-sm:hidden">Reconnecting…</span>
            </span>
          )}
          {dndOn && (
            <button
              type="button"
              onClick={() => setSettings('notifications')}
              className="mr-1 inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"
              title="Notifications are paused"
            >
              <BellOff className="size-3.5" />
              <span className="max-sm:hidden">Do not disturb</span>
            </button>
          )}
          <IconButton
            label="Settings"
            onClick={() => setSettings('profile')}
            className="max-sm:hidden"
          >
            <Settings />
          </IconButton>
          <Menu
            trigger={(_open, toggle) => (
              <button
                type="button"
                onClick={toggle}
                aria-label="Your account"
                className="rounded-full p-0.5 transition hover:ring-4 hover:ring-black/5"
              >
                <Avatar person={{ ...me, online: true }} presence className="size-8 text-sm" />
              </button>
            )}
          >
            {(close) => (
              <>
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar person={me} className="size-10 text-base" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{me.name}</p>
                    <p className="truncate text-xs text-muted">{me.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    setStatusOpen(true);
                  }}
                  className="mx-1.5 mb-1 flex w-[calc(100%-0.75rem)] items-center gap-2.5 rounded-lg border border-line px-3 py-2 text-left text-sm hover:bg-black/[0.03]"
                >
                  {me.customStatus ? (
                    <>
                      <span>{me.customStatus.emoji}</span>
                      <span className="min-w-0 flex-1 truncate">{me.customStatus.text}</span>
                    </>
                  ) : (
                    <>
                      <SmilePlus className="size-4 text-muted" />
                      <span className="text-muted">Set a status</span>
                    </>
                  )}
                </button>
                <div className="my-1 h-px bg-line" />
                <MenuItem
                  icon={<BellOff />}
                  onClick={() => {
                    close();
                    setSettings('notifications');
                  }}
                >
                  {dndOn ? 'Notifications paused' : 'Pause notifications'}
                </MenuItem>
                <MenuItem
                  icon={<Smartphone />}
                  onClick={() => {
                    close();
                    setSettings('app');
                  }}
                >
                  Get the app
                </MenuItem>
                <MenuItem
                  icon={<Settings />}
                  onClick={() => {
                    close();
                    setSettings('profile');
                  }}
                >
                  Settings
                </MenuItem>
                <MenuItem icon={<LogOut />} onClick={() => void signOut()}>
                  Sign out
                </MenuItem>
              </>
            )}
          </Menu>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-2 px-0 pb-0 sm:px-2 sm:pb-2">
        <Sidebar
          className={cn(
            'w-full md:w-72 md:shrink-0',
            (spaceId || searching || savedPage) && 'max-md:hidden',
          )}
          onNavigate={() => setQuery('')}
        />
        <main
          className={cn(
            'flex min-w-0 flex-1 overflow-hidden bg-white sm:rounded-2xl sm:shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:ring-1 sm:ring-line',
            !spaceId && !searching && !savedPage && 'max-md:hidden',
          )}
        >
          {searching ? (
            <SearchResults query={query.trim()} onOpen={() => setQuery('')} />
          ) : savedPage ? (
            <SavedView />
          ) : spaceId ? (
            <Conversation key={spaceId} spaceId={spaceId} />
          ) : (
            <Welcome name={me.name} />
          )}
        </main>
      </div>

      <SettingsDialog
        open={settings !== null}
        initialTab={settings ?? 'profile'}
        onClose={() => setSettings(null)}
      />
      <StatusDialog
        key={String(statusOpen)}
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
      />
      {shared && <ShareDialog items={shared} onClose={() => setShared(null)} />}
    </div>
  );
}

function Welcome({ name }: { name: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-accent-soft text-accent">
        <MessageSquareText className="size-8" />
      </span>
      <h2 className="mt-5 font-serif text-4xl tracking-tight">Hi, {name.split(' ')[0]}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Pick a conversation on the left, or start a new one with the{' '}
        <span className="font-medium text-ink">New chat</span> button.
      </p>
    </div>
  );
}
