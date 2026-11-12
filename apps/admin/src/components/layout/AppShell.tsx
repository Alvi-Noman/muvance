import { useState } from 'react';
import {
  CalendarDays,
  Columns3,
  Hourglass,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserCog,
  Users,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { roleLabels, type Permission } from '@muvance/shared';
import { LogoMark } from '@/components/brand/Logo';
import { ApiStatus, HudStatusBar } from '@/components/hud/HudStatusBar';
import { Avatar } from '@/components/ui/misc';
import { useLogout, useMe } from '@/features/auth/auth';
import { usePushNotifications } from '@/features/notifications/push';
import { cn } from '@/lib/cn';

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  permission?: Permission;
  end?: boolean;
};

const nav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/leads', label: 'Leads', icon: Users },
  { to: '/pipeline', label: 'Pipeline', icon: Columns3 },
  { to: '/unfinished', label: 'Unfinished', icon: Hourglass },
  { to: '/meetings', label: 'Meetings', icon: CalendarDays },
  { to: '/recordings', label: 'Recordings', icon: Video },
  { to: '/team', label: 'Team', icon: UserCog, permission: 'team:manage' },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { data: me } = useMe();
  const logout = useLogout();
  const items = nav.filter((item) => !item.permission || me?.permissions.includes(item.permission));

  return (
    <div className="flex h-full flex-col border-r border-hud/15 bg-void/85 text-neutral-500 backdrop-blur-md">
      <div className="flex h-20 items-center gap-3 border-b border-hud/15 px-5">
        <LogoMark className="w-11 text-hud drop-shadow-[0_0_10px_rgb(92_225_255/0.55)]" />
        <div>
          <p className="font-serif text-sm tracking-[0.18em] text-neutral-950">Muvance</p>
          <p className="hud-label mt-0.5 text-[10px] text-hud">CRM</p>
        </div>
      </div>

      <nav aria-label="Main" className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium tracking-wide transition-all',
                isActive
                  ? 'bg-hud/10 text-hud shadow-[inset_2px_0_0_var(--color-hud),0_0_18px_-6px_rgb(92_225_255/0.6)]'
                  : 'hover:bg-hud/5 hover:text-neutral-950',
              )
            }
          >
            <item.icon className="size-4" aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="hud-label px-5 pb-3 text-[10px] lg:hidden">
        <ApiStatus />
      </div>

      {me && (
        <div className="border-t border-hud/15 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Avatar name={me.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-950">{me.name}</p>
              <p className="hud-label truncate text-[10px] text-neutral-400">
                {roleLabels[me.role]}
              </p>
            </div>
            <button
              type="button"
              onClick={() => logout.mutate()}
              aria-label="Sign out"
              title="Sign out"
              className="grid size-8 place-items-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppShell() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  usePushNotifications();
  const section = nav.find((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to),
  );

  return (
    <div className="min-h-dvh lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile top bar + drawer */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-hud/15 bg-void/90 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2.5">
          <LogoMark className="w-8 text-hud drop-shadow-[0_0_10px_rgb(92_225_255/0.55)]" />
          <span className="font-serif text-sm tracking-[0.18em]">Muvance</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="grid size-9 place-items-center rounded-lg hover:bg-black/5"
        >
          <Menu className="size-5" />
        </button>
      </header>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-void/75"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw]"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <Sidebar onNavigate={() => setOpen(false)} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="absolute top-6 right-3 grid size-8 place-items-center rounded-lg text-neutral-400 hover:bg-hud/10 hover:text-neutral-950"
              >
                <X className="size-4" />
              </button>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <HudStatusBar section={section?.label ?? 'Muvance'} />
        {/* Keyed so each page powers on as you arrive. */}
        <div key={pathname} className="hud-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
