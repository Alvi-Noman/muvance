import type { ReactNode } from 'react';
import { Check, TrendingDown } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/cn';
import { services, type Service } from '../../content';
import { Reveal } from '../shared/Reveal';
import { SectionHeading } from '../shared/SectionHeading';

export function ServicesSection() {
  return (
    <section id="services" className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="What we do"
          title={
            <>
              Everything your ads need, <em>under one roof.</em>
            </>
          }
          description="Strategy, creative, tracking and testing, run by one team that talks to each other."
        />

        <div className="mt-16 grid gap-4 lg:grid-cols-3">
          <ServiceCard service={services.metaAds} className="lg:col-span-2">
            <MetaAdsVisual />
          </ServiceCard>
          <ServiceCard service={services.creative} delay={100}>
            <CreativeVisual />
          </ServiceCard>
          <ServiceCard service={services.tracking}>
            <TrackingVisual />
          </ServiceCard>
          <ServiceCard service={services.testing} delay={100}>
            <TestingVisual />
          </ServiceCard>
          <ServiceCard service={services.insights} delay={200}>
            <InsightsVisual />
          </ServiceCard>
        </div>
        <p className="mt-6 text-center text-xs text-neutral-400">
          Figures in these cards are illustrations, not client results.
        </p>
      </Container>
    </section>
  );
}

type ServiceCardProps = {
  service: Service;
  children: ReactNode;
  className?: string;
  delay?: number;
};

function ServiceCard({ service, children, className, delay }: ServiceCardProps) {
  return (
    <Reveal
      delay={delay}
      className={cn(
        'group flex flex-col rounded-[28px] border border-white/80 bg-white/70 p-3 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)] transition-shadow hover:shadow-[0_32px_80px_-32px_rgba(0,0,0,0.35)]',
        className,
      )}
    >
      <div className="relative h-52 overflow-hidden rounded-[20px] border border-black/5 bg-canvas">
        {children}
      </div>
      <div className="p-4 pt-6">
        <div className="flex items-center gap-2.5">
          <span
            className={cn('grid size-7 place-items-center rounded-lg text-white', service.accent)}
          >
            <service.icon className="size-3.5" aria-hidden />
          </span>
          <h3 className="text-lg font-medium">{service.title}</h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500">{service.body}</p>
      </div>
    </Reveal>
  );
}

/* ---------- Mini product visuals ---------- */

function GlassChip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/80 bg-white/80 px-3 py-2 text-xs shadow-sm backdrop-blur',
        className,
      )}
    >
      {children}
    </div>
  );
}

function MetaAdsVisual() {
  return (
    <div className="absolute inset-0 flex flex-col p-5" aria-hidden>
      <div className="flex flex-wrap gap-2">
        <GlassChip>
          <span className="text-neutral-500">ROAS</span> <span className="font-semibold">4.8×</span>{' '}
          <span className="text-emerald-600">↑ 62%</span>
        </GlassChip>
        <GlassChip>
          <span className="text-neutral-500">Purchases</span>{' '}
          <span className="font-semibold">1,284</span>
        </GlassChip>
        <GlassChip className="hidden sm:block">
          <span className="text-neutral-500">CPA</span>{' '}
          <span className="font-semibold">$18.40</span>
        </GlassChip>
      </div>
      <svg viewBox="0 0 600 120" preserveAspectRatio="none" className="mt-auto h-28 w-full">
        <defs>
          <linearGradient id="meta-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 100 C 60 96, 90 88, 140 84 S 220 90, 270 70 S 360 58, 410 44 S 520 30, 600 8 L 600 120 L 0 120 Z"
          fill="url(#meta-area)"
        />
        <path
          d="M0 100 C 60 96, 90 88, 140 84 S 220 90, 270 70 S 360 58, 410 44 S 520 30, 600 8"
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

function CreativeVisual() {
  const tiles = [
    { tone: 'from-violet-300 to-fuchsia-200', rotate: '-rotate-12', x: '-translate-x-16' },
    { tone: 'from-amber-200 to-orange-300', rotate: 'rotate-0', x: 'translate-x-0' },
    { tone: 'from-sky-200 to-indigo-300', rotate: 'rotate-12', x: 'translate-x-16' },
  ];

  return (
    <div className="absolute inset-0 grid place-items-center" aria-hidden>
      {tiles.map((tile, i) => (
        <div
          key={i}
          className={cn(
            'col-start-1 row-start-1 h-36 w-28 rounded-2xl bg-gradient-to-br p-2.5 shadow-lg ring-4 ring-white transition-transform duration-500',
            tile.tone,
            tile.rotate,
            tile.x,
            i === 0 && 'group-hover:-translate-x-20 group-hover:-rotate-[16deg]',
            i === 2 && 'group-hover:translate-x-20 group-hover:rotate-[16deg]',
          )}
        >
          <div className="h-1.5 w-10 rounded-full bg-white/70" />
          <div className="mt-1.5 h-1.5 w-6 rounded-full bg-white/50" />
        </div>
      ))}
      <span className="absolute top-4 right-4 rounded-full bg-neutral-950 px-2.5 py-1 text-[11px] font-medium text-white">
        +15 this month
      </span>
    </div>
  );
}

function TrackingVisual() {
  const events = [
    { name: 'Purchase', value: '$84.00' },
    { name: 'AddToCart', value: '$84.00' },
    { name: 'ViewContent', value: 'Product page' },
  ];

  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2 p-5" aria-hidden>
      {events.map((event, i) => (
        <GlassChip
          key={event.name}
          className={cn('flex items-center gap-3', i > 0 && 'opacity-80')}
        >
          <span className="grid size-5 place-items-center rounded-full bg-emerald-500 text-white">
            <Check className="size-3" strokeWidth={3} />
          </span>
          <span className="font-medium">{event.name}</span>
          <span className="ml-auto text-neutral-500">{event.value}</span>
        </GlassChip>
      ))}
      <span className="mt-1 self-start rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-medium text-orange-700">
        Pixel + CAPI connected
      </span>
    </div>
  );
}

function TestingVisual() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-5 p-6" aria-hidden>
      <div>
        <div className="flex justify-between text-xs">
          <span className="text-neutral-500">Variant A</span>
          <span className="font-medium">1.9% CTR</span>
        </div>
        <div className="mt-2 h-2.5 rounded-full bg-black/5">
          <div className="h-full w-[45%] rounded-full bg-neutral-300" />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-neutral-500">
            Variant B
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">
              Winner
            </span>
          </span>
          <span className="font-medium">3.4% CTR</span>
        </div>
        <div className="mt-2 h-2.5 rounded-full bg-black/5">
          <div className="h-full w-[82%] rounded-full bg-purple-400 transition-[width] duration-700 group-hover:w-[90%]" />
        </div>
      </div>
    </div>
  );
}

function InsightsVisual() {
  return (
    <div className="absolute inset-0 flex flex-col p-6" aria-hidden>
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        Cost per purchase
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 font-medium text-sky-700">
          <TrendingDown className="size-3" /> 24%
        </span>
      </div>
      <p className="mt-2 font-serif text-5xl">$18.40</p>
      <div className="mt-auto flex h-16 items-end gap-1.5">
        {[70, 82, 64, 58, 61, 48, 44, 40, 36, 32].map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}%` }}
            className={cn('flex-1 rounded-t-md', i === 9 ? 'bg-sky-400' : 'bg-sky-200/70')}
          />
        ))}
      </div>
    </div>
  );
}
