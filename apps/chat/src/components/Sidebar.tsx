import { useState, useSyncExternalStore } from 'react';
import { Bell, BellOff, Compass, Globe, MessageCirclePlus, Plus, Users, X } from 'lucide-react';
import { NavLink } from 'react-router';
import type { ChatPersonDto, ChatSpaceDto } from '@muvance/shared';
import { dmPartner, hasGuests, useChat } from '@/lib/data';
import { notificationsSupported } from '@/lib/notify';
import { avatarTone, cn, initials } from '@/lib/utils';
import { Avatar, Menu, MenuItem } from './ui';
import { BrowseSpacesDialog, NewSpaceDialog, StartChatDialog } from './dialogs/NewDialogs';

export function SpaceIcon({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-[30%] font-semibold select-none',
        avatarTone(name),
        className,
      )}
      aria-hidden
    >
      {initials(name).slice(0, 2)}
    </span>
  );
}

/** Notification permission, kept in step when the person answers the browser's prompt. */
function usePermission() {
  return useSyncExternalStore(
    (l) => {
      const t = window.setInterval(l, 2000);
      return () => window.clearInterval(t);
    },
    () => (notificationsSupported() ? Notification.permission : 'denied'),
  );
}

export function Sidebar({ className, onNavigate }: { className?: string; onNavigate: () => void }) {
  const { me, spaces, people } = useChat();
  const [dialog, setDialog] = useState<'dm' | 'space' | 'browse' | null>(null);
  const permission = usePermission();
  const [hideBanner, setHideBanner] = useState(false);

  const dms = spaces.filter((s) => s.kind === 'dm');
  const groups = spaces.filter((s) => s.kind === 'space');

  return (
    <nav className={cn('flex min-h-0 flex-col', className)}>
      <div className="px-3 pb-2">
        <Menu
          align="left"
          trigger={(_open, toggle) => (
            <button
              type="button"
              onClick={toggle}
              className="inline-flex h-12 items-center gap-2.5 rounded-2xl bg-white px-5 text-sm font-medium shadow-[0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-line transition hover:shadow-md"
            >
              <MessageCirclePlus className="size-5" />
              New chat
            </button>
          )}
        >
          {(close) => (
            <>
              <MenuItem
                icon={<Users />}
                onClick={() => {
                  close();
                  setDialog('dm');
                }}
              >
                Message someone
              </MenuItem>
              {me.canManage && (
                <>
                  <MenuItem
                    icon={<Plus />}
                    onClick={() => {
                      close();
                      setDialog('space');
                    }}
                  >
                    Create a space
                  </MenuItem>
                  <MenuItem
                    icon={<Compass />}
                    onClick={() => {
                      close();
                      setDialog('browse');
                    }}
                  >
                    Browse spaces
                  </MenuItem>
                </>
              )}
            </>
          )}
        </Menu>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        <Section title="Direct messages" onAdd={() => setDialog('dm')} addLabel="Message someone">
          {dms.length ? (
            dms.map((s) => (
              <SpaceLink
                key={s.id}
                space={s}
                onClick={onNavigate}
                person={dmPartner(s, me.id, people)}
              />
            ))
          ) : (
            <Empty>No direct messages yet.</Empty>
          )}
        </Section>
        <Section
          title="Spaces"
          onAdd={me.canManage ? () => setDialog('space') : undefined}
          addLabel="Create a space"
        >
          {groups.length ? (
            groups.map((s) => (
              <SpaceLink
                key={s.id}
                space={s}
                onClick={onNavigate}
                external={hasGuests(s, people)}
              />
            ))
          ) : (
            <Empty>
              {me.canManage
                ? 'Create a space for a project or a client.'
                : "Spaces you're added to will appear here."}
            </Empty>
          )}
          {me.canManage && (
            <button
              type="button"
              onClick={() => setDialog('browse')}
              className="mt-0.5 flex w-full items-center gap-3 rounded-full px-3 py-2 text-sm text-muted transition hover:bg-black/[0.04] hover:text-ink"
            >
              <Compass className="size-4" />
              Browse spaces
            </button>
          )}
        </Section>
      </div>

      {permission === 'default' && !hideBanner && (
        <div className="mx-3 mb-3 rounded-2xl bg-white p-3.5 text-sm ring-1 ring-line max-md:mb-4">
          <div className="flex items-start gap-2.5">
            <Bell className="mt-0.5 size-4 shrink-0 text-accent" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">Get notified of new messages</p>
              <button
                type="button"
                onClick={() => void Notification.requestPermission()}
                className="mt-1 font-medium text-accent hover:underline"
              >
                Turn on notifications
              </button>
            </div>
            <button
              type="button"
              onClick={() => setHideBanner(true)}
              aria-label="Not now"
              className="text-muted hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <StartChatDialog open={dialog === 'dm'} onClose={() => setDialog(null)} />
      <NewSpaceDialog open={dialog === 'space'} onClose={() => setDialog(null)} />
      <BrowseSpacesDialog open={dialog === 'browse'} onClose={() => setDialog(null)} />
    </nav>
  );
}

function Section({
  title,
  children,
  onAdd,
  addLabel,
}: {
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel: string;
}) {
  return (
    <section className="mt-3">
      <div className="flex items-center justify-between px-3 pb-1">
        <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">{title}</h3>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            aria-label={addLabel}
            title={addLabel}
            className="rounded-md p-1 text-muted transition hover:bg-black/5 hover:text-ink"
          >
            <Plus className="size-4" />
          </button>
        )}
      </div>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-3 py-1.5 text-sm text-muted">{children}</p>;
}

function SpaceLink({
  space,
  person,
  external,
  onClick,
}: {
  space: ChatSpaceDto;
  person?: ChatPersonDto;
  external?: boolean;
  onClick: () => void;
}) {
  const unread = space.unread > 0 && !(space.muted && !space.mentioned);
  const title = person ? person.name : space.name;
  return (
    <NavLink
      to={`/c/${space.id}`}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-full py-1.5 pr-3 pl-2 text-sm transition',
          isActive ? 'bg-accent-soft text-accent' : 'hover:bg-black/[0.04]',
        )
      }
    >
      {person ? (
        <Avatar person={person} presence className="size-7 text-[11px]" />
      ) : (
        <SpaceIcon name={space.name} className="size-7 text-[11px]" />
      )}
      <span className={cn('min-w-0 flex-1 truncate', unread && 'font-semibold text-ink')}>
        {title}
        {person?.kind === 'guest' && <span className="font-normal text-muted"> · Guest</span>}
      </span>
      {external && (
        <span title="Includes guests (clients)">
          <Globe className="size-3.5 shrink-0 text-amber-600" />
        </span>
      )}
      {space.muted && !unread && <BellOff className="size-3.5 shrink-0 text-muted" />}
      {space.mentioned && unread ? (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-white">
          @
        </span>
      ) : unread ? (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-[11px] font-semibold text-white">
          {space.unread >= 100 ? '99+' : space.unread}
        </span>
      ) : null}
    </NavLink>
  );
}
