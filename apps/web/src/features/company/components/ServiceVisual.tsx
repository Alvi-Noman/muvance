import type { ReactNode } from 'react';
import { Check, Play, Truck } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Small product-style illustrations for each service on the services page. Decorative only:
 * the numbers in them are illustrations, not client results.
 */
export function ServiceVisual({ id }: { id: string }) {
  switch (id) {
    case 'brand-strategy':
      return <BrandVisual />;
    case 'creative-production':
      return <CreativeVisual />;
    case 'website-cro':
      return <WebsiteVisual />;
    case 'online-advertising':
      return <AdsVisual />;
    default:
      return <OperationsVisual />;
  }
}

function Glass({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/90 bg-white/85 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)] backdrop-blur',
        className,
      )}
    >
      {children}
    </div>
  );
}

function BrandVisual() {
  const rows = [
    { k: 'Who', v: 'Working women, 24–35, Dhaka' },
    { k: 'Problem', v: 'No time to shop, worried about fit' },
    { k: 'Promise', v: 'Office wear that fits, delivered in 48h' },
  ];
  return (
    <div className="relative grid h-full place-items-center p-6" aria-hidden>
      <Glass className="w-full max-w-sm p-4">
        <p className="text-[11px] font-medium tracking-[0.14em] text-neutral-400 uppercase">
          Positioning
        </p>
        <dl className="mt-3 space-y-2.5">
          {rows.map((row) => (
            <div key={row.k} className="flex gap-3 text-sm">
              <dt className="w-16 shrink-0 text-neutral-400">{row.k}</dt>
              <dd className="font-medium text-neutral-800">{row.v}</dd>
            </div>
          ))}
        </dl>
      </Glass>
      <Glass className="absolute right-4 bottom-5 flex items-center gap-2 p-2.5 sm:right-8">
        {['bg-neutral-950', 'bg-amber-300', 'bg-rose-200', 'bg-stone-100'].map((c) => (
          <span key={c} className={cn('size-6 rounded-full ring-1 ring-black/5', c)} />
        ))}
        <span className="ml-1 font-serif text-xl italic">Aa</span>
      </Glass>
    </div>
  );
}

function CreativeVisual() {
  const frames = [
    { tone: 'from-violet-300 via-fuchsia-200 to-amber-100', r: '-rotate-6', x: '-translate-x-24' },
    { tone: 'from-amber-200 via-orange-200 to-rose-200', r: 'rotate-0', x: 'translate-x-0' },
    { tone: 'from-sky-200 via-indigo-200 to-violet-300', r: 'rotate-6', x: 'translate-x-24' },
  ];
  return (
    <div className="relative grid h-full place-items-center" aria-hidden>
      {frames.map((f, i) => (
        <div
          key={i}
          className={cn(
            'col-start-1 row-start-1 flex h-52 w-28 flex-col justify-between rounded-[22px] bg-gradient-to-br p-2.5 shadow-xl ring-4 ring-white transition duration-500 group-hover:scale-[1.03]',
            f.tone,
            f.r,
            f.x,
            i === 1 && 'z-10',
          )}
        >
          <div className="flex items-center gap-1.5">
            <span className="size-4 rounded-full bg-white/80" />
            <span className="h-1.5 w-10 rounded-full bg-white/70" />
          </div>
          {i === 1 && (
            <span className="mx-auto grid size-10 place-items-center rounded-full bg-white/90 shadow">
              <Play className="size-4 fill-neutral-950" />
            </span>
          )}
          <div className="space-y-1">
            <span className="block h-1.5 w-16 rounded-full bg-white/80" />
            <span className="block h-1.5 w-10 rounded-full bg-white/60" />
          </div>
        </div>
      ))}
      <span className="absolute top-5 right-5 rounded-full bg-neutral-950 px-3 py-1 text-xs font-medium text-white">
        New this week
      </span>
    </div>
  );
}

function WebsiteVisual() {
  return (
    <div className="relative h-full p-5 sm:p-7" aria-hidden>
      <Glass className="h-full overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-black/5 px-3 py-2">
          {['bg-red-300', 'bg-amber-300', 'bg-emerald-300'].map((c) => (
            <span key={c} className={cn('size-2 rounded-full', c)} />
          ))}
          <span className="ml-2 h-4 flex-1 rounded-full bg-neutral-100" />
        </div>
        <div className="grid grid-cols-[0.9fr_1.1fr] gap-3 p-3">
          <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-sky-200 to-indigo-200" />
          <div className="flex flex-col gap-2 py-1">
            <span className="h-2.5 w-4/5 rounded-full bg-neutral-200" />
            <span className="h-2 w-2/5 rounded-full bg-neutral-200" />
            <span className="mt-1 h-3 w-1/3 rounded-full bg-neutral-800" />
            <div className="mt-2 flex gap-1.5">
              {['S', 'M', 'L'].map((s) => (
                <span
                  key={s}
                  className="grid size-6 place-items-center rounded-md border border-black/10 text-[10px]"
                >
                  {s}
                </span>
              ))}
            </div>
            <span className="mt-auto rounded-full bg-neutral-950 py-1.5 text-center text-[10px] font-medium text-white">
              Order now · Cash on delivery
            </span>
          </div>
        </div>
      </Glass>
      <Glass className="absolute right-3 bottom-3 flex items-center gap-2 px-3 py-2 text-xs sm:right-5 sm:bottom-5">
        <span className="relative size-8">
          <svg viewBox="0 0 36 36" className="size-8 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e5e5" strokeWidth="4" />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="#10b981"
              strokeWidth="4"
              strokeDasharray="94"
              strokeDashoffset="10"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span>
          <span className="block font-semibold">Fast on 4G</span>
          <span className="text-neutral-500">Mobile speed</span>
        </span>
      </Glass>
    </div>
  );
}

function AdsVisual() {
  const bars = [28, 34, 31, 42, 47, 55, 61, 72, 80, 92];
  return (
    <div className="relative flex h-full flex-col p-5 sm:p-7" aria-hidden>
      <div className="flex flex-wrap gap-2">
        <Glass className="px-3 py-2 text-xs">
          <span className="text-neutral-500">Testing</span>{' '}
          <span className="font-semibold">6 new ads</span>
        </Glass>
        <Glass className="px-3 py-2 text-xs">
          <span className="text-neutral-500">Budget</span>{' '}
          <span className="font-semibold text-emerald-600">→ winners</span>
        </Glass>
      </div>
      <div className="mt-auto flex h-36 items-end gap-1.5 sm:gap-2">
        {bars.map((h, i) => (
          <span
            key={i}
            style={{ height: `${h}%` }}
            className={cn(
              'flex-1 rounded-t-md transition-all duration-700 group-hover:opacity-100',
              i >= bars.length - 3 ? 'bg-emerald-500' : 'bg-emerald-500/30',
            )}
          />
        ))}
      </div>
      <p className="mt-2 text-[11px] text-neutral-400">Delivered orders by week (illustration)</p>
    </div>
  );
}

function OperationsVisual() {
  const steps = ['Order placed', 'Confirmed by call', 'Packed', 'Delivered'];
  return (
    <div className="grid h-full place-items-center p-5 sm:p-7" aria-hidden>
      <Glass className="w-full max-w-sm p-4">
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={step} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  'grid size-6 place-items-center rounded-full text-white',
                  i < 3 ? 'bg-emerald-500' : 'bg-neutral-950',
                )}
              >
                {i < 3 ? (
                  <Check className="size-3.5" strokeWidth={3} />
                ) : (
                  <Truck className="size-3.5" />
                )}
              </span>
              <span className={cn('font-medium', i === 3 && 'text-neutral-950')}>{step}</span>
              {i < steps.length - 1 && (
                <span className="ml-auto h-px w-10 bg-gradient-to-r from-emerald-300 to-transparent" />
              )}
            </li>
          ))}
        </ol>
      </Glass>
    </div>
  );
}
