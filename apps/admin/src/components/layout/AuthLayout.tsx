import type { ReactNode } from 'react';
import { LogoMark } from '@/components/brand/Logo';

/** Centered card layout for sign-in and invite pages. */
export function AuthLayout({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="hud-enter w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <LogoMark className="w-32 text-hud drop-shadow-[0_0_18px_rgb(92_225_255/0.6)]" />
          <p className="hud-label mt-5 text-hud">Muvance Admin</p>
          <h1 className="mt-3 font-serif text-3xl leading-tight tracking-wider sm:text-4xl">
            {title}
          </h1>
          {description && <p className="mt-2 text-sm text-neutral-500">{description}</p>}
        </div>
        <div className="hud-panel mt-8 rounded-2xl p-6">{children}</div>
      </div>
    </main>
  );
}
