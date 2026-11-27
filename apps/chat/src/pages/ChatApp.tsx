import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LogOut, MessageSquareText, Search, Settings, WifiOff, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { api } from '@/lib/api';
import { useChat } from '@/lib/data';
import { useConnection, useLiveUpdates } from '@/lib/live';
import { cn } from '@/lib/utils';
import { Avatar, IconButton, LogoMark, Menu, MenuItem } from '@/components/ui';
import { Conversation } from '@/components/Conversation';
import { SearchResults } from '@/components/SearchResults';
import { SettingsDialog } from '@/components/SettingsDialog';
import { Sidebar } from '@/components/Sidebar';

export function ChatApp() {
  const { me, spaces } = useChat();
  const { spaceId } = useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const connection = useConnection();
  const [query, setQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  useLiveUpdates(me.id);

  // "(3) Muvance Chat" while there's something unread.
  const unread = spaces.reduce((n, s) => n + (s.muted && !s.mentioned ? 0 : s.unread), 0);
  useEffect(() => {
    document.title = unread ? `(${unread}) Muvance Chat` : 'Muvance Chat';
  }, [unread]);

  const searching = query.trim().length >= 2;

  const signOut = async () => {
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
            searching || spaceId ? 'max-md:hidden' : '',
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
          <IconButton
            label="Settings"
            onClick={() => setSettingsOpen(true)}
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
                <Avatar person={me} className="size-8 text-sm" />
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
                <div className="my-1 h-px bg-line" />
                <MenuItem
                  icon={<Settings />}
                  onClick={() => {
                    close();
                    setSettingsOpen(true);
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
          className={cn('w-full md:w-72 md:shrink-0', (spaceId || searching) && 'max-md:hidden')}
          onNavigate={() => setQuery('')}
        />
        <main
          className={cn(
            'flex min-w-0 flex-1 overflow-hidden bg-white sm:rounded-2xl sm:shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:ring-1 sm:ring-line',
            !spaceId && !searching && 'max-md:hidden',
          )}
        >
          {searching ? (
            <SearchResults query={query.trim()} onOpen={() => setQuery('')} />
          ) : spaceId ? (
            <Conversation key={spaceId} spaceId={spaceId} />
          ) : (
            <Welcome name={me.name} />
          )}
        </main>
      </div>

      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
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
