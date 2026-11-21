import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { LogOut } from 'lucide-react';
import { useMe, useSignOut } from '@/lib/auth';
import { Avatar, Logo, buttonStyles } from './ui';

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function Header() {
  const now = useClock();
  const { data: me } = useMe();
  const signOut = useSignOut();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
      <Link to="/" aria-label="Muvance Meet home">
        <Logo />
      </Link>
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-neutral-600 md:inline">
          {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} ·{' '}
          {now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        {me ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Account"
              className="rounded-full ring-black/10 transition hover:ring-4"
            >
              <Avatar name={me.name} seed={me.id} className="size-9 text-sm" />
            </button>
            {menuOpen && (
              <div className="animate-fade-up absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-black/5 bg-white p-2 shadow-xl">
                <div className="px-3 py-2">
                  <p className="font-medium">{me.name}</p>
                  <p className="text-sm text-neutral-500">
                    {me.email ?? me.username} · Muvance team
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    signOut.mutate();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-black/5"
                >
                  <LogOut className="size-4" /> Sign out
                </button>
              </div>
            )}
          </div>
        ) : me === null ? (
          <Link to="/signin" className={buttonStyles('secondary', 'sm')}>
            Team sign in
          </Link>
        ) : null}
      </div>
    </header>
  );
}
