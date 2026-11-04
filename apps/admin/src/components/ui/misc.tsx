import type { ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';

export function Spinner({ className }: { className?: string }) {
  return (
    <LoaderCircle
      className={cn('size-5 animate-spin text-neutral-400', className)}
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <Spinner />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-14 text-center', className)}>
      {icon && (
        <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-neutral-100 text-neutral-500">
          {icon}
        </div>
      )}
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const avatarTones = [
  'bg-amber-100 text-amber-800',
  'bg-sky-100 text-sky-800',
  'bg-emerald-100 text-emerald-800',
  'bg-violet-100 text-violet-800',
  'bg-rose-100 text-rose-800',
  'bg-orange-100 text-orange-800',
];

export function Avatar({ name, className }: { name: string; className?: string }) {
  const tone =
    avatarTones[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % avatarTones.length];
  return (
    <span
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold',
        tone,
        className,
      )}
      aria-hidden
    >
      {initials(name) || '?'}
    </span>
  );
}

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-4xl leading-none tracking-tight">{title}</h1>
        {description && <p className="mt-2 text-sm text-neutral-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
