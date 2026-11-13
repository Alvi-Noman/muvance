import { useEffect, useState } from 'react';
import { Check, Eye, Globe, MousePointerClick, Server, ShoppingBag, Store, X } from 'lucide-react';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/cn';

/** Counts up from 0 to `to` once the element is on screen. */
function useCountUp(to: number, run: boolean, ms = 1100) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    // With reduced motion the first frame jumps straight to the final number.
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = duration ? Math.min(1, (now - start) / duration) : 1;
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, run, ms]);
  return n;
}

/* ------------------------------------------------------------------ */
/* 1. Two dashboards that disagree                                     */
/* ------------------------------------------------------------------ */

export function DashboardsDisagree() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const meta = useCountUp(142, inView);
  const store = useCountUp(97, inView);

  return (
    <div ref={ref} className="relative grid gap-3 sm:grid-cols-2">
      <MiniDashboard
        icon={<Globe className="size-4" aria-hidden />}
        name="Meta Ads Manager"
        metric="Purchases"
        value={meta}
        sub="Last 7 days · 7-day click, 1-day view"
        spark={[30, 42, 38, 55, 61, 58, 72]}
        dark
      />
      <MiniDashboard
        icon={<Store className="size-4" aria-hidden />}
        name="Your store"
        metric="Orders"
        value={store}
        sub="Last 7 days · all orders placed"
        spark={[22, 30, 26, 37, 40, 41, 48]}
      />
      <div className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-amber-100 px-4 py-2 text-center shadow-xl shadow-black/10 sm:block">
        <p className="font-serif text-2xl leading-none text-neutral-950">{meta - store}</p>
        <p className="text-[10px] text-amber-900">sales unaccounted for</p>
      </div>
      <p className="rounded-2xl bg-amber-100 px-4 py-2.5 text-center text-sm text-amber-950 sm:hidden">
        <strong className="font-semibold">{meta - store}</strong> sales unaccounted for
      </p>
    </div>
  );
}

function MiniDashboard({
  icon,
  name,
  metric,
  value,
  sub,
  spark,
  dark,
}: {
  icon: React.ReactNode;
  name: string;
  metric: string;
  value: number;
  sub: string;
  spark: number[];
  dark?: boolean;
}) {
  const max = Math.max(...spark);
  return (
    <div
      className={cn(
        'rounded-3xl p-5',
        dark ? 'bg-neutral-950 text-white' : 'border border-black/5 bg-neutral-50 text-neutral-950',
      )}
    >
      <p
        className={cn(
          'flex items-center gap-2 text-xs',
          dark ? 'text-neutral-400' : 'text-neutral-500',
        )}
      >
        {icon}
        {name}
      </p>
      <p className={cn('mt-5 text-xs', dark ? 'text-neutral-400' : 'text-neutral-500')}>{metric}</p>
      <p className="font-serif text-6xl leading-none tabular-nums">{value}</p>
      <div className="mt-5 flex h-12 items-end gap-1.5">
        {spark.map((v, i) => (
          <span
            key={i}
            className={cn('flex-1 rounded-t', dark ? 'bg-white/80' : 'bg-neutral-950/70')}
            style={{ height: `${(v / max) * 100}%` }}
          />
        ))}
      </div>
      <p className={cn('mt-3 text-[11px]', dark ? 'text-neutral-500' : 'text-neutral-400')}>
        {sub}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Where the gap comes from (waterfall)                             */
/* ------------------------------------------------------------------ */

const GAP = [
  {
    label: 'Meta reports',
    value: 142,
    total: true,
    note: 'Every purchase Meta credits to your ads under its default setting.',
  },
  {
    label: 'View-through credit',
    value: -21,
    note: 'People who saw an ad, didn’t click, and bought within a day. Meta counts them; your store credits Google, direct or WhatsApp instead.',
  },
  {
    label: 'Modelled & cross-device',
    value: -11,
    note: 'Sales Meta estimates for people it can’t track directly (iPhone opt-outs, ad blockers), or who saw the ad on their phone and bought on a laptop.',
  },
  {
    label: 'Duplicate events',
    value: -7,
    note: 'The same purchase sent twice, by the Pixel and by the Conversions API without a shared event ID, or when the thank-you page reloads.',
  },
  {
    label: 'Date & time zone',
    value: -6,
    note: 'Meta books a sale on the day of the ad click; your store books it on the day of the order. Different time zones shift sales across days too.',
  },
  {
    label: 'Store shows',
    value: 97,
    total: true,
    note: 'Orders your store recorded in the same seven days.',
  },
] as const;

// Each gap bar starts where the previous ones left off, floating like a waterfall.
const GAP_MAX = 142;
const GAP_ROWS = GAP.map((g, i) => {
  if ('total' in g && g.total) return { ...g, start: 0, width: g.value / GAP_MAX };
  const after = GAP.slice(0, i + 1).reduce(
    (sum, x) => ('total' in x ? sum : sum + x.value),
    GAP_MAX,
  );
  return { ...g, start: after / GAP_MAX, width: -g.value / GAP_MAX };
});

export function GapWaterfall() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [active, setActive] = useState(1);
  const rows = GAP_ROWS;

  return (
    <div ref={ref}>
      <ul className="space-y-2">
        {rows.map((r, i) => {
          const total = 'total' in r && r.total;
          return (
            <li key={r.label}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={cn(
                  // Phones: label and value on one line, full-width bar underneath. Wider: one row.
                  'grid w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 rounded-xl px-2 py-2 text-left transition sm:grid-cols-[10rem_1fr_3rem] sm:py-1.5',
                  active === i ? 'bg-neutral-100' : 'hover:bg-neutral-50',
                )}
              >
                <span className="col-start-1 row-start-1 text-sm leading-tight text-neutral-600">
                  {r.label}
                </span>
                <span className="relative col-span-2 row-start-2 h-6 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:h-7">
                  <span
                    className={cn(
                      'absolute inset-y-0 rounded-md transition-all duration-1000 ease-out',
                      total ? 'bg-neutral-950' : 'bg-amber-400',
                    )}
                    style={{
                      left: `${r.start * 100}%`,
                      width: inView ? `${r.width * 100}%` : '0%',
                      transitionDelay: `${i * 120}ms`,
                    }}
                  />
                </span>
                <span className="col-start-2 row-start-1 text-right text-sm font-semibold text-neutral-950 tabular-nums sm:col-start-3">
                  {total ? r.value : `−${-r.value}`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p
        className="mt-4 min-h-[4.5rem] rounded-2xl bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-600"
        aria-live="polite"
      >
        <strong className="font-semibold text-neutral-950">{GAP[active]!.label}: </strong>
        {GAP[active]!.note}
      </p>
      <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-neutral-950" /> Reported total
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-amber-400" /> Part of the gap
        </span>
        <span>Tap or hover a row for the explanation.</span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. One customer, two dates                                          */
/* ------------------------------------------------------------------ */

const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export function OneCustomerTwoDates() {
  const events: Record<number, { icon: typeof Eye; label: string }> = {
    0: { icon: Eye, label: 'Sees your Reel' },
    2: { icon: MousePointerClick, label: 'Clicks the ad' },
    5: { icon: ShoppingBag, label: 'Places the order' },
  };
  return (
    <>
      <MobileTimeline />
      <div className="hidden sm:block">
        <div>
          <div className="grid grid-cols-[8rem_repeat(7,1fr)] gap-1.5 text-center text-xs text-neutral-500">
            <span />
            {DAYS.map((d) => (
              <span key={d} className="py-1 font-medium">
                {d}
              </span>
            ))}
          </div>
          <Row label="Customer">
            {DAYS.map((d, i) => {
              const e = events[i];
              return (
                <Cell key={d} on={!!e} tone="neutral">
                  {e && (
                    <>
                      <e.icon className="mx-auto size-4" aria-hidden />
                      <span className="mt-1 block text-[10px] leading-tight">{e.label}</span>
                    </>
                  )}
                </Cell>
              );
            })}
          </Row>
          <Row label="Meta books it on">
            {DAYS.map((d, i) => (
              <Cell key={d} on={i === 2} tone="dark">
                {i === 2 && <span className="text-[11px] font-semibold">1 sale</span>}
              </Cell>
            ))}
          </Row>
          <Row label="Store books it on">
            {DAYS.map((d, i) => (
              <Cell key={d} on={i === 5} tone="amber">
                {i === 5 && <span className="text-[11px] font-semibold">1 order</span>}
              </Cell>
            ))}
          </Row>
        </div>
      </div>
    </>
  );
}

/** Phone version: the same story as a vertical timeline, no sideways scrolling. */
function MobileTimeline() {
  const steps = [
    {
      day: 'Saturday',
      icon: Eye,
      what: 'Sees your Reel',
      tags: [] as { text: string; tone: string }[],
    },
    {
      day: 'Monday',
      icon: MousePointerClick,
      what: 'Clicks the ad',
      tags: [{ text: 'Meta books the sale today', tone: 'bg-neutral-950 text-white' }],
    },
    {
      day: 'Thursday',
      icon: ShoppingBag,
      what: 'Places the order',
      tags: [{ text: 'Your store books the order today', tone: 'bg-amber-300 text-neutral-950' }],
    },
  ];
  return (
    <ol className="relative space-y-4 border-l-2 border-dashed border-neutral-200 pl-6 sm:hidden">
      {steps.map((s) => (
        <li key={s.day} className="relative">
          <span className="absolute top-0.5 -left-[2.3rem] grid size-8 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/10">
            <s.icon className="size-4" aria-hidden />
          </span>
          <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">{s.day}</p>
          <p className="mt-0.5 font-semibold text-neutral-950">{s.what}</p>
          {s.tags.map((t) => (
            <span
              key={t.text}
              className={cn(
                'mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold',
                t.tone,
              )}
            >
              {t.text}
            </span>
          ))}
        </li>
      ))}
    </ol>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-1.5 grid grid-cols-[8rem_repeat(7,1fr)] items-stretch gap-1.5">
      <span className="flex items-center text-xs font-medium text-neutral-600">{label}</span>
      {children}
    </div>
  );
}

function Cell({
  on,
  tone,
  children,
}: {
  on: boolean;
  tone: 'neutral' | 'dark' | 'amber';
  children?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'grid min-h-14 place-items-center rounded-xl px-1 py-2 text-center',
        !on && 'bg-neutral-100/70',
        on && tone === 'neutral' && 'bg-white text-neutral-900 shadow-sm ring-1 ring-black/5',
        on && tone === 'dark' && 'bg-neutral-950 text-white',
        on && tone === 'amber' && 'bg-amber-300 text-neutral-950',
      )}
    >
      <span>{children}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Attribution setting switcher                                     */
/* ------------------------------------------------------------------ */

const SETTINGS = [
  {
    id: '7c1v',
    label: '7-day click + 1-day view',
    value: 142,
    hint: 'Meta’s default. Most generous: counts views as well as clicks.',
  },
  {
    id: '7c',
    label: '7-day click',
    value: 121,
    hint: 'Drops view-through sales. A fairer comparison with your store.',
  },
  {
    id: '1c',
    label: '1-day click',
    value: 94,
    hint: 'Strictest. Only sales within 24 hours of a click.',
  },
] as const;

export function AttributionSwitcher() {
  const [id, setId] = useState<(typeof SETTINGS)[number]['id']>('7c1v');
  const s = SETTINGS.find((x) => x.id === id)!;
  const store = 97;
  const max = 150;
  const diff = s.value - store;

  return (
    <div>
      <div role="radiogroup" aria-label="Attribution setting" className="flex flex-wrap gap-2">
        {SETTINGS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={id === opt.id}
            onClick={() => setId(opt.id)}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-medium transition sm:text-sm',
              id === opt.id
                ? 'bg-neutral-950 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <Meter label="Meta reports" value={s.value} max={max} tone="bg-neutral-950" />
        <Meter label="Your store" value={store} max={max} tone="bg-neutral-300" />
      </div>

      <div className="mt-5 flex flex-col gap-1 rounded-2xl bg-neutral-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="text-neutral-600">{s.hint}</span>
        <span className="shrink-0 font-semibold text-neutral-950 tabular-nums">
          Gap: {diff > 0 ? `+${diff}` : diff}
        </span>
      </div>
    </div>
  );
}

function Meter({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-neutral-600">{label}</span>
        <span className="font-semibold text-neutral-950 tabular-nums">{value}</span>
      </div>
      <div className="mt-1.5 h-3 rounded-full bg-neutral-100">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', tone)}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Pixel + Conversions API deduplication                            */
/* ------------------------------------------------------------------ */

export function DedupDiagram() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <DedupCase
        title="Without a shared event ID"
        ids={['ord_1042-a', 'ord_1042-b']}
        result="Meta counts 2 purchases"
        ok={false}
      />
      <DedupCase
        title="With the same event ID"
        ids={['ord_1042', 'ord_1042']}
        result="Meta counts 1 purchase"
        ok
      />
    </div>
  );
}

function DedupCase({
  title,
  ids,
  result,
  ok,
}: {
  title: string;
  ids: [string, string];
  result: string;
  ok: boolean;
}) {
  return (
    <div className="rounded-3xl border border-black/5 bg-neutral-50 p-4">
      <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">{title}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Source icon={<Globe className="size-4" aria-hidden />} name="Browser Pixel" id={ids[0]} />
        <Source icon={<Server className="size-4" aria-hidden />} name="Server (CAPI)" id={ids[1]} />
      </div>
      <div className="mx-auto h-6 w-px bg-neutral-300" aria-hidden />
      <div
        className={cn(
          'flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold',
          ok ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900',
        )}
      >
        {ok ? <Check className="size-4" aria-hidden /> : <X className="size-4" aria-hidden />}
        {result}
      </div>
    </div>
  );
}

function Source({ icon, name, id }: { icon: React.ReactNode; name: string; id: string }) {
  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
      <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-800">
        {icon}
        {name}
      </p>
      <p className="mt-2 truncate rounded-md bg-neutral-100 px-2 py-1 font-mono text-[10px] text-neutral-600">
        event_id: {id}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Cash-on-delivery funnel                                          */
/* ------------------------------------------------------------------ */

const COD = [
  { label: 'Orders placed', value: 100, note: 'What the Pixel reports as Purchase' },
  { label: 'Confirmed by phone', value: 84, note: 'Fake numbers and prank orders drop out' },
  { label: 'Shipped', value: 80, note: 'Out of stock or changed minds' },
  { label: 'Delivered & paid', value: 71, note: 'Real revenue in your bank' },
];

export function CodFunnel() {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className="space-y-2.5">
      {COD.map((s, i) => (
        <div key={s.label} className="grid grid-cols-[1fr_auto] items-center gap-x-4">
          <div className="relative h-12 overflow-hidden rounded-2xl bg-neutral-100">
            <div
              className={cn(
                'absolute inset-y-0 left-0 rounded-2xl transition-all duration-1000 ease-out',
                i === COD.length - 1 ? 'bg-emerald-500' : 'bg-neutral-950',
              )}
              style={{ width: inView ? `${s.value}%` : '0%', transitionDelay: `${i * 150}ms` }}
            />
            <span className="relative flex h-full items-center px-4 text-sm font-medium text-white mix-blend-difference">
              {s.label}
            </span>
          </div>
          <span className="w-12 text-right font-serif text-3xl leading-none text-neutral-950 tabular-nums">
            {s.value}
          </span>
          <span className="col-span-2 px-1 pt-1 text-xs text-neutral-500">{s.note}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 7. MER calculator                                                   */
/* ------------------------------------------------------------------ */

export function MerCalculator() {
  const [revenue, setRevenue] = useState(600000);
  const [spend, setSpend] = useState(150000);
  const mer = spend > 0 ? revenue / spend : 0;
  const pct = Math.min(100, (mer / 8) * 100);

  return (
    <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
      <div className="grid gap-3 sm:grid-cols-2">
        <MoneyInput label="Total revenue this month" value={revenue} onChange={setRevenue} />
        <MoneyInput label="Total ad spend, all channels" value={spend} onChange={setSpend} />
      </div>
      <div className="rounded-3xl bg-neutral-950 px-6 py-4 text-white sm:min-w-44">
        <p className="text-xs text-neutral-400">Your MER</p>
        <p className="font-serif text-5xl leading-none tabular-nums" aria-live="polite">
          {mer.toFixed(1)}×
        </p>
      </div>
      <div className="sm:col-span-2">
        <div className="h-2 rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Every 1 taka of advertising brings in {mer.toFixed(2)} taka of sales across your whole
          business.
        </p>
      </div>
    </div>
  );
}

function MoneyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs text-neutral-500">{label}</span>
      <span className="mt-1 flex items-center rounded-2xl border border-black/10 bg-white px-4 focus-within:ring-2 focus-within:ring-emerald-500">
        <span className="text-neutral-400">৳</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={1000}
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-full bg-transparent px-2 py-3 text-base font-medium text-neutral-950 tabular-nums outline-none"
        />
      </span>
    </label>
  );
}
