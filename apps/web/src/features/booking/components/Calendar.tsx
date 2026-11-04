import { useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { dayKeyToDate, formatMonth, toDayKey } from '../lib/time';

export type MonthView = { year: number; month: number };

type CalendarProps = {
  view: MonthView;
  onViewChange: (view: MonthView) => void;
  canGoBack: boolean;
  canGoForward: boolean;
  availableDays: Set<string>;
  selectedDay?: string;
  todayKey: string;
  onSelectDay: (key: string) => void;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const shiftMonth = ({ year, month }: MonthView, delta: number): MonthView => {
  const d = new Date(Date.UTC(year, month + delta, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
};

const fullDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

export function Calendar({
  view,
  onViewChange,
  canGoBack,
  canGoForward,
  availableDays,
  selectedDay,
  todayKey,
  onSelectDay,
}: CalendarProps) {
  const [direction, setDirection] = useState(1);
  const { month, year } = formatMonth(view.year, view.month);

  const leadingBlanks = new Date(Date.UTC(view.year, view.month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(view.year, view.month + 1, 0)).getUTCDate();

  const go = (delta: number) => {
    setDirection(delta);
    onViewChange(shiftMonth(view, delta));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold" aria-live="polite">
          {month} <span className="font-normal text-neutral-500">{year}</span>
        </h2>
        <div className="flex gap-1">
          <NavButton label="Previous month" disabled={!canGoBack} onClick={() => go(-1)}>
            <ChevronLeft className="size-4" />
          </NavButton>
          <NavButton label="Next month" disabled={!canGoForward} onClick={() => go(1)}>
            <ChevronRight className="size-4" />
          </NavButton>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold tracking-[0.12em] text-neutral-400 uppercase">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="relative mt-2 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={`${view.year}-${view.month}`}
            custom={direction}
            variants={{
              enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-7 gap-1.5"
          >
            {Array.from({ length: leadingBlanks }, (_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const key = toDayKey(view.year, view.month, day);
              const available = availableDays.has(key);
              const selected = key === selectedDay;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!available}
                  onClick={() => onSelectDay(key)}
                  aria-pressed={selected}
                  aria-label={`${fullDate.format(dayKeyToDate(key))}${available ? '' : ', unavailable'}`}
                  className={cn(
                    'relative grid aspect-square place-items-center rounded-xl lg:aspect-auto lg:h-14 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/60',
                    available
                      ? 'bg-white/[0.08] text-white hover:bg-white/[0.16]'
                      : 'cursor-default text-neutral-600',
                    selected && 'text-neutral-950 hover:bg-transparent',
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId="selected-day"
                      className="absolute inset-0 rounded-xl bg-white"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}
                  <span className="relative">{day}</span>
                  {key === todayKey && (
                    <span className="absolute bottom-1.5 size-1 rounded-full bg-current" />
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-full text-neutral-300 transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}
