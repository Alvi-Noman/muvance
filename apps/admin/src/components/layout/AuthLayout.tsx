import type { ReactNode } from 'react';

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
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-neutral-950 font-serif text-xl text-white">
            M
          </span>
          <span className="text-sm font-medium text-neutral-500">Muvance Admin</span>
        </div>
        <h1 className="font-serif text-5xl leading-[0.95] tracking-tight">{title}</h1>
        {description && <p className="mt-3 text-sm text-neutral-500">{description}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
