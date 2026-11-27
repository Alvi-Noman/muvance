import { useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Camera, Copy, Link2, Trash2 } from 'lucide-react';
import type { ChatGuestDto, ChatMeDto } from '@muvance/shared';
import { api, errorMessage } from '@/lib/api';
import { squareAvatar } from '@/lib/avatar-image';
import { keys, patchPerson, useChat } from '@/lib/data';
import { notificationsSupported, setSoundOn, soundOn } from '@/lib/notify';
import { cn, shortDate } from '@/lib/utils';
import { PasswordInput } from '@/pages/LoginPage';
import {
  Avatar,
  Badge,
  Button,
  Dialog,
  Field,
  IconButton,
  Input,
  Spinner,
  Switch,
  useToast,
} from './ui';

type Tab = 'profile' | 'notifications' | 'guests';

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { me } = useChat();
  const [tab, setTab] = useState<Tab>('profile');
  const tabs: [Tab, string][] = [
    ['profile', 'Profile'],
    ['notifications', 'Notifications'],
    ...(me.canManage ? ([['guests', 'Guests']] as [Tab, string][]) : []),
  ];
  return (
    <Dialog open={open} onClose={onClose} title="Settings" className="sm:max-w-xl">
      <div className="mb-5 flex gap-1 rounded-xl bg-canvas p-1">
        {tabs.map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-sm font-medium transition',
              tab === t ? 'bg-white shadow-sm' : 'text-muted hover:text-ink',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'profile' && <ProfileTab />}
      {tab === 'notifications' && <NotificationsTab />}
      {tab === 'guests' && me.canManage && <GuestsTab />}
    </Dialog>
  );
}

function ProfileTab() {
  const { me } = useChat();
  const qc = useQueryClient();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(me.name);
  const [company, setCompany] = useState(me.company ?? '');
  const [busy, setBusy] = useState(false);
  const guest = me.kind === 'guest';

  const setPicture = async (file: File | null) => {
    try {
      const updated = file
        ? await api.put<ChatMeDto>('/me/avatar', { image: await squareAvatar(file) })
        : await api.delete<ChatMeDto>('/me/avatar');
      patchPerson(qc, updated);
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      patchPerson(qc, await api.put<ChatMeDto>('/me', { name, company }));
      toast('Saved');
    } catch (error) {
      toast(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="group relative rounded-full"
          aria-label="Change your picture"
        >
          <Avatar person={me} className="size-20 text-2xl" />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition group-hover:opacity-100">
            <Camera className="size-5" />
          </span>
        </button>
        <div className="min-w-0">
          <p className="truncate font-semibold">{me.name}</p>
          <p className="truncate text-sm text-muted">{me.email}</p>
          <div className="mt-2 flex gap-2">
            <Button variant="secondary" className="h-8" onClick={() => fileInput.current?.click()}>
              Change picture
            </Button>
            {me.avatarUrl && (
              <Button variant="ghost" className="h-8" onClick={() => void setPicture(null)}>
                Remove
              </Button>
            )}
          </div>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            void setPicture(e.target.files?.[0] ?? null);
            e.target.value = '';
          }}
        />
      </div>

      {guest ? (
        <>
          <form onSubmit={save} className="space-y-4">
            <Field label="Your name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
              />
            </Field>
            <Field label="Company" hint="Shown next to your name.">
              <Input value={company} onChange={(e) => setCompany(e.target.value)} maxLength={80} />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" disabled={busy}>
                {busy ? <Spinner /> : 'Save'}
              </Button>
            </div>
          </form>
          <ChangePassword />
        </>
      ) : (
        <p className="rounded-xl bg-canvas p-3.5 text-sm text-muted">
          Your name comes from your Muvance email account, and your password is your email password
          (change it in Muvance Mail). Your picture is the same as in Muvance Mail.
        </p>
      )}
    </div>
  );
}

function ChangePassword() {
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put('/me/password', { current, next });
      setCurrent('');
      setNext('');
      toast('Password changed. Other devices were signed out.');
    } catch (error) {
      toast(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-3 border-t border-line pt-5">
      <p className="text-sm font-semibold">Change password</p>
      <label className="block">
        <span className="text-sm">Current password</span>
        <PasswordInput value={current} onChange={setCurrent} autoComplete="current-password" />
      </label>
      <label className="block">
        <span className="text-sm">New password</span>
        <PasswordInput value={next} onChange={setNext} autoComplete="new-password" />
        <span className="mt-1 block text-xs text-muted">At least 8 characters.</span>
      </label>
      <div className="flex justify-end">
        <Button type="submit" variant="secondary" disabled={busy || !current || next.length < 8}>
          {busy ? <Spinner /> : 'Change password'}
        </Button>
      </div>
    </form>
  );
}

function usePermission() {
  return useSyncExternalStore(
    (l) => {
      const t = window.setInterval(l, 1500);
      return () => window.clearInterval(t);
    },
    () => (notificationsSupported() ? Notification.permission : 'unsupported'),
  );
}

function NotificationsTab() {
  const permission = usePermission();
  const [sound, setSound] = useState(soundOn);
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4 rounded-xl bg-canvas p-3.5">
        <div>
          <p className="text-sm font-medium">Desktop notifications</p>
          <p className="text-xs text-muted">
            {permission === 'granted'
              ? 'On. You get a notification for new messages while Muvance Chat is in the background.'
              : permission === 'denied'
                ? 'Blocked in your browser. Allow notifications for chat.muvance.com in the browser’s site settings.'
                : permission === 'unsupported'
                  ? "This browser doesn't support notifications."
                  : 'Get a notification for new messages while Muvance Chat is in the background.'}
          </p>
        </div>
        {permission === 'default' && (
          <Button className="h-8 shrink-0" onClick={() => void Notification.requestPermission()}>
            Turn on
          </Button>
        )}
        {permission === 'granted' && <Badge tone="accent">On</Badge>}
      </div>
      <div className="flex items-start justify-between gap-4 rounded-xl bg-canvas p-3.5">
        <div>
          <p className="text-sm font-medium">Sound</p>
          <p className="text-xs text-muted">A soft chime when a message arrives.</p>
        </div>
        <Switch
          checked={sound}
          onChange={(on) => {
            setSound(on);
            setSoundOn(on);
          }}
          label="Sound"
        />
      </div>
      <p className="px-1 text-xs text-muted">
        Muted conversations stay quiet unless someone @mentions you. Clients also get an email when
        they have messages they haven't read for a while.
      </p>
    </div>
  );
}

function GuestsTab() {
  const qc = useQueryClient();
  const toast = useToast();
  const guests = useQuery({
    queryKey: ['guests'],
    queryFn: () => api.get<ChatGuestDto[]>('/guests'),
  });
  const [link, setLink] = useState<{ id: string; url: string; emailed: boolean } | null>(null);

  const newLink = async (g: ChatGuestDto) => {
    try {
      const res = await api.post<{ inviteUrl: string; emailed: boolean }>(`/guests/${g.id}/link`);
      setLink({ id: g.id, url: res.inviteUrl, emailed: res.emailed });
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  const remove = async (g: ChatGuestDto) => {
    if (
      !window.confirm(
        `Remove ${g.name}'s access? They're taken out of every space and signed out. Their old messages stay.`,
      )
    )
      return;
    try {
      await api.delete(`/guests/${g.id}`);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['guests'] }),
        qc.invalidateQueries({ queryKey: keys.bootstrap }),
      ]);
      toast(`${g.name} no longer has access`);
    } catch (error) {
      toast(errorMessage(error));
    }
  };

  if (guests.isLoading) {
    return (
      <div className="flex justify-center p-6">
        <Spinner className="text-muted" />
      </div>
    );
  }
  if (!guests.data?.length) {
    return (
      <p className="py-6 text-center text-sm text-muted">
        No clients yet. Invite one from a space's members list.
      </p>
    );
  }
  return (
    <div className="-mx-2 space-y-1">
      <p className="px-2 pb-2 text-sm text-muted">
        Clients invited to Muvance Chat. Send a new link if they lost theirs or forgot their
        password.
      </p>
      {guests.data.map((g) => (
        <div key={g.id} className="rounded-xl px-2.5 py-2 hover:bg-black/[0.02]">
          <div className="flex items-center gap-3">
            <Avatar person={g} presence className="size-9 text-sm" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate text-sm font-medium">
                {g.name}
                {g.status === 'invited' && <Badge>Hasn't joined yet</Badge>}
              </p>
              <p className="truncate text-xs text-muted">
                {[g.company, g.email].filter(Boolean).join(' · ')}
              </p>
              <p className="truncate text-xs text-muted">
                {g.spaceNames.length ? g.spaceNames.join(', ') : 'In no spaces'}
                {g.lastSeenAt && ` · Last seen ${shortDate(g.lastSeenAt)}`}
                {g.invitedByName && ` · Invited by ${g.invitedByName}`}
              </p>
            </div>
            <IconButton label="Send a new sign-in link" onClick={() => void newLink(g)}>
              <Link2 />
            </IconButton>
            <IconButton label="Remove access" onClick={() => void remove(g)}>
              <Trash2 />
            </IconButton>
          </div>
          {link?.id === g.id && (
            <div className="mt-2 ml-12 rounded-lg bg-canvas p-2.5 text-xs">
              <p className="text-muted">
                {link.emailed
                  ? 'Emailed to them. You can also share it another way:'
                  : "The email couldn't be sent. Share this link with them (works for 14 days):"}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate">{link.url}</code>
                <IconButton
                  label="Copy link"
                  onClick={() =>
                    void navigator.clipboard.writeText(link.url).then(() => toast('Link copied'))
                  }
                >
                  <Copy />
                </IconButton>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
