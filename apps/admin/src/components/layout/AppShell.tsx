import { useState } from 'react';
import {
  CalendarDays,
  Columns3,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserCog,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { NavLink, Outlet } from 'react-router';
import { roleLabels, type Permission } from '@muvance/shared';
import { Avatar } from '@/components/ui/misc';
import { useLogout, useMe } from '@/features/auth/auth';
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
  { to: '/meetings', label: 'Meetings', icon: CalendarDays },
  { to: '/team', label: 'Team', icon: UserCog, permission: 'team:manage' },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { data: me } = useMe();
  const logout = useLogout();
  const items = nav.filter((item) => !item.permission || me?.permissions.includes(item.permission));

  return (
    <div className="flex h-full flex-col bg-neutral-950 text-neutral-300">
      <div className="flex h-16 items-center gap-3 px-5">
        <span className="grid size-8 place-items-center rounded-full bg-white font-serif text-lg text-neutral-950">
          M
        </span>
        <span className="font-semibold text-white">Muvance</span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-neutral-300 uppercase">
          CRM
        </span>
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
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white',
              )
            }
          >
            <item.icon className="size-4" aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {me && (
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Avatar name={me.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{me.name}</p>
              <p className="truncate text-xs text-neutral-400">{roleLabels[me.role]}</p>
            </div>
            <button
              type="button"
              onClick={() => logout.mutate()}
              aria-label="Sign out"
              title="Sign out"
              className="grid size-8 place-items-center rounded-lg text-neutral-400 hover:bg-white/10 hover:text-white"
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

  return (
    <div className="min-h-dvh lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile top bar + drawer */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/5 bg-canvas/90 px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-full bg-neutral-950 font-serif text-white">
            M
          </span>
          <span className="font-semibold">Muvance</span>
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
              className="absolute inset-0 bg-neutral-950/40"
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
                className="absolute top-4 right-3 grid size-8 place-items-center rounded-lg text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
