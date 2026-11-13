import { useState, type ReactNode } from 'react';
import { AlertTriangle, ArrowRight, Lightbulb, MapPin, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { buttonStyles } from '@/components/ui/Button';
import { siteConfig } from '@/config/site';
import { RiskNote } from '@/features/landing';
import { cn } from '@/lib/cn';

/** Body-text styles for direct children: paragraphs, lists, links, bold. */
const prose =
  'text-[17px] leading-[1.8] text-neutral-700 [&>p]:mt-5 [&>ul]:mt-5 [&>ul]:space-y-2 [&>ul]:pl-5 [&>ul]:list-disc [&>ul]:marker:text-neutral-400 [&_strong]:font-semibold [&_strong]:text-neutral-950 [&_a]:font-medium [&_a]:text-neutral-950 [&_a]:underline [&_a]:decoration-emerald-500 [&_a]:decoration-2 [&_a]:underline-offset-4';

/** A numbered chapter with an anchor for the table of contents. */
export function Section({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: number;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 pt-16 first:pt-0 sm:pt-20">
      <p className="font-mono text-xs tracking-[0.14em] text-emerald-700 uppercase">
        Chapter {String(n).padStart(2, '0')}
      </p>
      <h2 className="mt-3 font-serif text-[clamp(2rem,4.5vw,2.9rem)] leading-[1.02] tracking-[-0.015em] text-balance text-neutral-950">
        {title}
      </h2>
      <div className={prose}>{children}</div>
    </section>
  );
}

/** Body text outside a chapter (the intro). */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(prose, className)}>{children}</div>;
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="font-serif text-[1.65rem] leading-[1.3] text-balance text-neutral-900 sm:text-[1.9rem]">
      {children}
    </p>
  );
}

const calloutTones = {
  tip: {
    icon: Lightbulb,
    label: 'Pro tip',
    box: 'border-emerald-200 bg-emerald-50/80',
    ink: 'text-emerald-800',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Watch out',
    box: 'border-amber-200 bg-amber-50/80',
    ink: 'text-amber-800',
  },
  local: {
    icon: MapPin,
    label: 'In Bangladesh',
    box: 'border-sky-200 bg-sky-50/80',
    ink: 'text-sky-800',
  },
} as const;

export function Callout({
  tone,
  title,
  children,
}: {
  tone: keyof typeof calloutTones;
  title?: string;
  children: ReactNode;
}) {
  const t = calloutTones[tone];
  const Icon = t.icon;
  return (
    <aside className={cn('mt-8 rounded-3xl border p-5 sm:p-6', t.box)}>
      <p
        className={cn(
          'flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase',
          t.ink,
        )}
      >
        <Icon className="size-4" aria-hidden />
        {title ?? t.label}
      </p>
      <div className="mt-2 text-[15px] leading-relaxed text-neutral-700 [&_strong]:font-semibold [&_strong]:text-neutral-950">
        {children}
      </div>
    </aside>
  );
}

export function KeyTakeaways({ items }: { items: ReactNode[] }) {
  return (
    <aside className="relative overflow-hidden rounded-[28px] bg-neutral-950 p-6 text-white sm:p-8">
      <div
        className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-emerald-500/25 blur-3xl"
        aria-hidden
      />
      <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-emerald-300 uppercase">
        <Sparkles className="size-4" aria-hidden />
        The 30-second version
      </p>
      <ul className="mt-5 space-y-3.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-neutral-200">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-white/10 font-mono text-[10px] text-white">
              {i + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function PullQuote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-12 border-l-2 border-emerald-500 pl-6 font-serif text-[1.75rem] leading-[1.25] text-balance text-neutral-950 italic sm:text-[2.1rem]">
      {children}
    </blockquote>
  );
}

/** Frame for a chart or diagram, with a caption and an "example data" tag. */
export function Figure({
  title,
  caption,
  example = true,
  children,
}: {
  title: string;
  caption?: ReactNode;
  example?: boolean;
  children: ReactNode;
}) {
  return (
    <figure className="-mx-2 mt-10 rounded-[28px] border border-white/80 bg-white/75 p-4 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)] backdrop-blur sm:mx-0 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold text-neutral-950">{title}</p>
        {example && (
          <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] text-neutral-500">
            Example numbers
          </span>
        )}
      </div>
      <div className="mt-5">{children}</div>
      {caption && (
        <figcaption className="mt-5 text-[13px] leading-relaxed text-neutral-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export function Steps({ steps }: { steps: { title: string; body: ReactNode }[] }) {
  return (
    <ol className="mt-8 space-y-3">
      {steps.map((s, i) => (
        <li
          key={s.title}
          className="group flex gap-4 rounded-3xl border border-white/80 bg-white/70 p-5 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.3)] transition hover:bg-white sm:p-6"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-neutral-950 font-mono text-sm text-white transition group-hover:bg-emerald-600">
            {i + 1}
          </span>
          <div>
            <p className="font-semibold text-neutral-950">{s.title}</p>
            <div className="mt-1 text-[15px] leading-relaxed text-neutral-600 [&_strong]:font-semibold [&_strong]:text-neutral-900">
              {s.body}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function CompareTable({
  columns,
  rows,
}: {
  columns: [string, string, string];
  rows: [string, ReactNode, ReactNode][];
}) {
  return (
    <>
      {/* Phones: one card per row, so nothing is squeezed or scrolls sideways */}
      <ul className="mt-8 space-y-3 sm:hidden">
        {rows.map(([label, a, b]) => (
          <li
            key={label}
            className="rounded-3xl border border-white/80 bg-white/75 p-4 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.3)]"
          >
            <p className="font-semibold text-neutral-950">{label}</p>
            <dl className="mt-3 space-y-2 text-sm">
              {[a, b].map((cell, i) => (
                <div key={i} className="rounded-2xl bg-neutral-50 px-3.5 py-2.5">
                  <dt className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
                    {columns[i + 1]}
                  </dt>
                  <dd className="mt-0.5 leading-relaxed text-neutral-700">{cell}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <CompareTableWide columns={columns} rows={rows} />
    </>
  );
}

function CompareTableWide({
  columns,
  rows,
}: {
  columns: [string, string, string];
  rows: [string, ReactNode, ReactNode][];
}) {
  return (
    <div className="mt-8 hidden overflow-hidden rounded-[28px] border border-white/80 bg-white/75 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)] sm:block">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/5">
            {columns.map((c, i) => (
              <th
                key={c}
                scope="col"
                className={cn(
                  'px-5 py-4 font-semibold',
                  i === 0 ? 'text-neutral-500' : 'text-neutral-950',
                )}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, a, b]) => (
            <tr key={label} className="border-b border-black/5 last:border-0">
              <th scope="row" className="px-5 py-4 align-top font-medium text-neutral-500">
                {label}
              </th>
              <td className="px-5 py-4 align-top leading-relaxed text-neutral-700">{a}</td>
              <td className="px-5 py-4 align-top leading-relaxed text-neutral-700">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FaqList({ items }: { items: { q: string; a: ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mt-8 divide-y divide-black/10 rounded-[28px] border border-white/80 bg-white/70 px-5 sm:px-7">
      {items.map((item, i) => (
        <div key={item.q}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between gap-4 py-5 text-left font-medium text-neutral-950"
          >
            {item.q}
            <Plus
              className={cn(
                'size-5 shrink-0 transition-transform duration-300',
                open === i && 'rotate-45',
              )}
              aria-hidden
            />
          </button>
          <div
            className={cn(
              'grid transition-all duration-300',
              open === i ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0',
            )}
          >
            <div className="overflow-hidden text-[15px] leading-relaxed text-neutral-600">
              {item.a}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** The booking card placed inside and at the end of every article. */
export function InlineCta({ title, body }: { title: ReactNode; body: ReactNode }) {
  return (
    <aside className="relative mt-12 overflow-hidden rounded-[32px] bg-neutral-950 p-7 text-white sm:p-10">
      <div
        className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-emerald-500/20 blur-3xl"
        aria-hidden
      />
      <p className="font-serif text-[2rem] leading-[1.05] text-balance sm:text-[2.5rem]">{title}</p>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-neutral-400">{body}</p>
      <div className="mt-7 flex flex-col items-start gap-3">
        <Link
          to={siteConfig.bookingHref}
          className={buttonStyles({ variant: 'inverted', size: 'lg' })}
        >
          Book a call
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
        <RiskNote tone="dark" />
      </div>
    </aside>
  );
}

/** A code sample, e.g. an API payload. */
export function Code({ title, children }: { title: string; children: string }) {
  return (
    <figure className="-mx-2 mt-8 overflow-hidden rounded-[24px] bg-neutral-950 sm:mx-0">
      <figcaption className="flex items-center gap-2 border-b border-white/10 px-5 py-3 text-xs text-neutral-400">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
          <span className="size-2.5 rounded-full bg-white/15" />
        </span>
        {title}
      </figcaption>
      <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed text-emerald-100">
        <code>{children}</code>
      </pre>
    </figure>
  );
}
