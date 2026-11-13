/**
 * Reusable, data-driven visuals for blog posts. No chart library: plain HTML/SVG,
 * animated on scroll, with hover/tap details. Colours: ink (neutral-950) for the main
 * series, emerald for the highlight, amber for a third series or "loss".
 */
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';
import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/cn';

const SERIES = {
  ink: { stroke: '#0a0a0a', fill: 'bg-neutral-950', dot: 'bg-neutral-950' },
  accent: { stroke: '#10b981', fill: 'bg-emerald-500', dot: 'bg-emerald-500' },
  warm: { stroke: '#f59e0b', fill: 'bg-amber-400', dot: 'bg-amber-400' },
  muted: { stroke: '#a3a3a3', fill: 'bg-neutral-300', dot: 'bg-neutral-300' },
} as const;
export type SeriesTone = keyof typeof SERIES;

/* ------------------------------------------------------------------ */
/* Horizontal bar list                                                 */
/* ------------------------------------------------------------------ */

export type BarItem = { label: string; value: number; note?: ReactNode; tone?: SeriesTone };

export function BarList({
  items,
  format = (v) => String(v),
  max,
  hint = 'Tap or hover a bar for details.',
}: {
  items: BarItem[];
  format?: (v: number) => string;
  max?: number;
  hint?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const top = max ?? Math.max(...items.map((i) => i.value));
  const hasNotes = items.some((i) => i.note);
  const [active, setActive] = useState(0);

  return (
    <div ref={ref}>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={item.label}>
            <button
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={cn(
                // Phones: label and value on one line, full-width bar underneath. Wider: one row.
                'grid w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 rounded-xl px-2 py-2 text-left transition sm:grid-cols-[minmax(6rem,9rem)_1fr_auto] sm:py-1.5',
                hasNotes && active === i ? 'bg-neutral-100' : 'hover:bg-neutral-50',
              )}
            >
              <span className="col-start-1 row-start-1 text-sm leading-tight text-neutral-600">
                {item.label}
              </span>
              <span className="col-span-2 row-start-2 h-5 rounded-md bg-neutral-100 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:h-6">
                <span
                  className={cn(
                    'block h-full rounded-md transition-all duration-1000 ease-out',
                    SERIES[item.tone ?? 'ink'].fill,
                  )}
                  style={{
                    width: inView ? `${Math.max(2, (item.value / top) * 100)}%` : '0%',
                    transitionDelay: `${i * 90}ms`,
                  }}
                />
              </span>
              <span className="col-start-2 row-start-1 min-w-12 text-right text-sm font-semibold text-neutral-950 tabular-nums sm:col-start-3">
                {format(item.value)}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {hasNotes && (
        <>
          <p
            className="mt-4 min-h-[3.5rem] rounded-2xl bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-600"
            aria-live="polite"
          >
            <strong className="font-semibold text-neutral-950">{items[active]?.label}: </strong>
            {items[active]?.note}
          </p>
          <p className="mt-2 text-xs text-neutral-500">{hint}</p>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Line chart with crosshair tooltip                                   */
/* ------------------------------------------------------------------ */

export type LineSeries = { name: string; values: number[]; tone?: SeriesTone; dashed?: boolean };

export function LineChart({
  labels,
  series,
  format = (v) => String(v),
  yMin = 0,
  yMax,
  height = 240,
  markers,
}: {
  labels: string[];
  series: LineSeries[];
  format?: (v: number) => string;
  yMin?: number;
  yMax?: number;
  height?: number;
  /** Vertical annotations, by label index. */
  markers?: { at: number; label: string }[];
}) {
  const clip = useId();
  const { ref, inView } = useInView<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  // Draw at the real on-screen width, so text stays a readable size on phones
  // instead of the whole drawing being scaled down.
  const box = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(600);
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setW(Math.max(260, Math.round(entry.contentRect.width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = W < 480 ? Math.round(height * 0.85) : height;
  // Show fewer x-axis labels when space is tight (always keep the first and last).
  const labelStep = Math.max(1, Math.ceil(labels.length / Math.max(2, Math.floor(W / 64))));
  const pad = { l: 8, r: 8, t: 16, b: 28 };
  const top = yMax ?? Math.max(...series.flatMap((s) => s.values)) * 1.1;
  const x = (i: number) => pad.l + (i / (labels.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - yMin) / (top - yMin)) * (H - pad.t - pad.b);
  const grid = [0.25, 0.5, 0.75, 1].map((f) => yMin + (top - yMin) * f);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((rel - pad.l) / (W - pad.l - pad.r)) * (labels.length - 1));
    setHover(Math.max(0, Math.min(labels.length - 1, i)));
  };

  return (
    <div ref={ref}>
      {series.length > 1 && (
        <Legend items={series.map((s) => ({ name: s.name, tone: s.tone ?? 'ink' }))} />
      )}
      <div ref={box} className="relative mt-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-pan-y overflow-visible"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
          role="img"
          aria-label={series.map((s) => `${s.name}: ${s.values.map(format).join(', ')}`).join('. ')}
        >
          <defs>
            <clipPath id={clip}>
              <rect
                x="0"
                y="0"
                height={H}
                width={inView ? W : 0}
                style={{ transition: 'width 1.4s cubic-bezier(0.22,1,0.36,1)' }}
              />
            </clipPath>
          </defs>
          {grid.map((g) => (
            <g key={g}>
              <line
                x1={pad.l}
                x2={W - pad.r}
                y1={y(g)}
                y2={y(g)}
                stroke="#e5e5e5"
                strokeDasharray="2 4"
              />
              <text
                x={W - pad.r}
                y={y(g) - 4}
                textAnchor="end"
                className="fill-neutral-400 text-[10px]"
              >
                {format(g)}
              </text>
            </g>
          ))}
          {markers?.map((m) => (
            <g key={m.at}>
              <line
                x1={x(m.at)}
                x2={x(m.at)}
                y1={pad.t}
                y2={H - pad.b}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={x(m.at) + 4}
                y={pad.t + 10}
                className="fill-amber-700 text-[10px] font-medium"
              >
                {m.label}
              </text>
            </g>
          ))}
          <g clipPath={`url(#${clip})`}>
            {series.map((s) => (
              <path
                key={s.name}
                d={s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ')}
                fill="none"
                stroke={SERIES[s.tone ?? 'ink'].stroke}
                strokeWidth="2.5"
                strokeDasharray={s.dashed ? '6 5' : undefined}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
          </g>
          {labels.map((l, i) => (
            <text
              key={l + i}
              x={x(i)}
              y={H - 8}
              textAnchor={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'}
              className={cn(
                'fill-neutral-500 text-[11px]',
                i % labelStep !== 0 && i !== labels.length - 1 && 'hidden',
              )}
            >
              {l}
            </text>
          ))}
          {hover !== null && (
            <g>
              <line
                x1={x(hover)}
                x2={x(hover)}
                y1={pad.t}
                y2={H - pad.b}
                stroke="#0a0a0a"
                strokeOpacity="0.2"
              />
              {series.map((s) => (
                <circle
                  key={s.name}
                  cx={x(hover)}
                  cy={y(s.values[hover]!)}
                  r="5"
                  fill={SERIES[s.tone ?? 'ink'].stroke}
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
            </g>
          )}
        </svg>
        {hover !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl bg-neutral-950 px-3 py-2 text-xs whitespace-nowrap text-white shadow-xl"
            style={{ left: `${Math.min(85, Math.max(15, (x(hover) / W) * 100))}%` }}
          >
            <p className="font-medium text-neutral-400">{labels[hover]}</p>
            {series.map((s) => (
              <p key={s.name} className="mt-0.5 flex items-center gap-1.5">
                <span
                  className={cn(
                    'size-2 rounded-full',
                    SERIES[s.tone ?? 'ink'].dot,
                    s.tone === 'ink' && 'bg-white',
                  )}
                />
                {s.name}: <strong className="font-semibold">{format(s.values[hover]!)}</strong>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Legend({ items }: { items: { name: string; tone: SeriesTone }[] }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-600">
      {items.map((i) => (
        <span key={i.name} className="flex items-center gap-1.5">
          <span className={cn('h-2 w-4 rounded-full', SERIES[i.tone].fill)} />
          {i.name}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Big-number tiles                                                    */
/* ------------------------------------------------------------------ */

export function StatTiles({
  items,
}: {
  items: { value: string; label: string; dark?: boolean }[];
}) {
  return (
    <div
      className={cn(
        'grid gap-3',
        items.length === 4 ? 'grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3',
      )}
    >
      {items.map((s) => (
        <div
          key={s.label}
          className={cn(
            'rounded-3xl p-5',
            s.dark
              ? 'bg-neutral-950 text-white'
              : 'border border-black/5 bg-neutral-50 text-neutral-950',
          )}
        >
          <p className="font-serif text-5xl leading-none tabular-nums">{s.value}</p>
          <p
            className={cn(
              'mt-3 text-xs leading-snug',
              s.dark ? 'text-neutral-400' : 'text-neutral-500',
            )}
          >
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Funnel                                                              */
/* ------------------------------------------------------------------ */

export function Funnel({
  stages,
  format = (v) => String(v),
}: {
  stages: { label: string; value: number; note?: string }[];
  format?: (v: number) => string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const top = stages[0]?.value ?? 1;
  return (
    <div ref={ref} className="space-y-2.5">
      {stages.map((s, i) => (
        <div key={s.label} className="grid grid-cols-[1fr_auto] items-center gap-x-4">
          <div className="relative h-12 overflow-hidden rounded-2xl bg-neutral-100">
            <div
              className={cn(
                'absolute inset-y-0 left-0 rounded-2xl transition-all duration-1000 ease-out',
                i === stages.length - 1 ? 'bg-emerald-500' : 'bg-neutral-950',
              )}
              style={{
                width: inView ? `${(s.value / top) * 100}%` : '0%',
                transitionDelay: `${i * 150}ms`,
              }}
            />
            <span className="relative flex h-full items-center px-4 text-sm font-medium text-white mix-blend-difference">
              {s.label}
            </span>
          </div>
          <span className="min-w-12 text-right font-serif text-3xl leading-none text-neutral-950 tabular-nums">
            {format(s.value)}
          </span>
          {s.note && (
            <span className="col-span-2 px-1 pt-1 text-xs text-neutral-500">{s.note}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Two-sided comparison                                                */
/* ------------------------------------------------------------------ */

export function Versus({
  left,
  right,
}: {
  left: { title: string; points: string[] };
  right: { title: string; points: string[] };
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-3xl border border-black/5 bg-neutral-50 p-5">
        <p className="text-sm font-semibold text-neutral-500">{left.title}</p>
        <ul className="mt-4 space-y-3">
          {left.points.map((p) => (
            <li key={p} className="flex gap-2.5 text-sm leading-snug text-neutral-600">
              <X className="mt-0.5 size-4 shrink-0 text-red-500" aria-label="Weaker" />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-3xl bg-neutral-950 p-5 text-white">
        <p className="text-sm font-semibold text-emerald-300">{right.title}</p>
        <ul className="mt-4 space-y-3">
          {right.points.map((p) => (
            <li key={p} className="flex gap-2.5 text-sm leading-snug text-neutral-200">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-label="Stronger" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Flow diagram                                                        */
/* ------------------------------------------------------------------ */

export function Flow({
  nodes,
}: {
  nodes: { title: string; body?: string; icon?: ReactNode; highlight?: boolean }[];
}) {
  return (
    <ol className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch">
      {nodes.map((n, i) => (
        <li key={n.title} className="flex flex-1 flex-col items-center gap-2 sm:flex-row">
          <div
            className={cn(
              'w-full flex-1 rounded-2xl p-4 sm:h-full',
              n.highlight ? 'bg-neutral-950 text-white' : 'border border-black/5 bg-neutral-50',
            )}
          >
            {n.icon && (
              <span
                className={cn('mb-2 block', n.highlight ? 'text-emerald-300' : 'text-neutral-500')}
              >
                {n.icon}
              </span>
            )}
            <p className="text-sm font-semibold">{n.title}</p>
            {n.body && (
              <p
                className={cn(
                  'mt-1 text-xs leading-snug',
                  n.highlight ? 'text-neutral-400' : 'text-neutral-500',
                )}
              >
                {n.body}
              </p>
            )}
          </div>
          {i < nodes.length - 1 && (
            <ArrowRight
              className="size-4 shrink-0 rotate-90 text-neutral-400 sm:rotate-0"
              aria-hidden
            />
          )}
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Interactive checklist with score                                    */
/* ------------------------------------------------------------------ */

export function Checklist({
  items,
  verdicts,
}: {
  items: string[];
  verdicts: [string, string, string];
}) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const score = done.size / items.length;
  const verdict = score >= 0.8 ? verdicts[2] : score >= 0.4 ? verdicts[1] : verdicts[0];
  const toggle = (i: number) =>
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="h-2 flex-1 rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${score * 100}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-neutral-950 tabular-nums">
          {done.size}/{items.length}
        </span>
      </div>
      <p className="mt-2 text-sm text-neutral-600" aria-live="polite">
        {verdict}
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((item, i) => (
          <li key={item}>
            <label
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-2xl border p-3 text-sm leading-snug transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-500',
                done.has(i)
                  ? 'border-emerald-200 bg-emerald-50 text-neutral-900'
                  : 'border-black/5 bg-neutral-50 text-neutral-600 hover:bg-white',
              )}
            >
              <input
                type="checkbox"
                checked={done.has(i)}
                onChange={() => toggle(i)}
                className="sr-only"
              />
              <span
                className={cn(
                  'mt-px grid size-5 shrink-0 place-items-center rounded-md border transition',
                  done.has(i)
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-neutral-300 bg-white',
                )}
              >
                {done.has(i) && <Check className="size-3.5" aria-hidden />}
              </span>
              {item}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small calculator                                                    */
/* ------------------------------------------------------------------ */

export type CalcInput = {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  step?: number;
};

export function Calculator({
  inputs,
  compute,
}: {
  inputs: CalcInput[];
  /** Returns the result tiles for the current input values. */
  compute: (v: Record<string, number>) => { label: string; value: string; dark?: boolean }[];
}) {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(inputs.map((i) => [i.id, i.value])),
  );
  const results = useMemo(() => compute(values), [compute, values]);

  return (
    <div>
      <div className={cn('grid gap-3', inputs.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
        {inputs.map((input) => (
          <label key={input.id} className="block">
            <span className="text-xs text-neutral-500">{input.label}</span>
            <span className="mt-1 flex items-center rounded-2xl border border-black/10 bg-white px-4 focus-within:ring-2 focus-within:ring-emerald-500">
              {input.prefix && <span className="text-neutral-400">{input.prefix}</span>}
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step={input.step ?? 1}
                value={values[input.id]}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [input.id]: Math.max(0, Number(e.target.value) || 0) }))
                }
                className="w-full bg-transparent px-2 py-3 text-base font-medium text-neutral-950 tabular-nums outline-none"
              />
              {input.suffix && <span className="text-sm text-neutral-400">{input.suffix}</span>}
            </span>
          </label>
        ))}
      </div>
      <div
        className={cn('mt-4 grid gap-3', results.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}
        aria-live="polite"
      >
        {results.map((r) => (
          <div
            key={r.label}
            className={cn(
              'rounded-3xl px-5 py-4',
              r.dark ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-950',
            )}
          >
            <p className={cn('text-xs', r.dark ? 'text-neutral-400' : 'text-neutral-500')}>
              {r.label}
            </p>
            <p className="mt-1 font-serif text-4xl leading-none tabular-nums">{r.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
