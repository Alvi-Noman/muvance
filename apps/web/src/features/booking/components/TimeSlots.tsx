import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { formatDayHeading, formatSlotTime } from '../lib/time';

type TimeSlotsProps = {
  dayKey: string;
  /** Every time on this day, in order, including booked ones. */
  slots: string[];
  bookedSlots: ReadonlySet<string>;
  timeZone: string;
  hour12: boolean;
  onHour12Change: (hour12: boolean) => void;
  onSelect: (slot: string) => void;
};

export function TimeSlots({
  dayKey,
  slots,
  bookedSlots,
  timeZone,
  hour12,
  onHour12Change,
  onSelect,
}: TimeSlotsProps) {
  const heading = formatDayHeading(dayKey);

  return (
    <div>
      <div className="flex h-8 items-center justify-between gap-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={dayKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-base font-semibold"
          >
            {heading.weekday} <span className="font-normal text-neutral-400">{heading.day}</span>
          </motion.p>
        </AnimatePresence>
        <HourFormatToggle hour12={hour12} onChange={onHour12Change} />
      </div>

      <div className="mt-4">
        <AnimatePresence mode="wait" initial={false}>
          {/* Only days with open times are selectable, so there's always at least one slot. */}
          <motion.ul
            key={dayKey}
            className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1"
            initial="hidden"
            animate="show"
            exit="hidden"
            variants={{
              show: { transition: { staggerChildren: 0.03 } },
              hidden: { transition: { staggerChildren: 0.01, staggerDirection: -1 } },
            }}
          >
            {slots.map((slot) => {
              const booked = bookedSlots.has(slot);
              const time = formatSlotTime(slot, timeZone, hour12);
              return (
                <motion.li
                  key={slot}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
                  }}
                >
                  <button
                    type="button"
                    disabled={booked}
                    onClick={() => onSelect(slot)}
                    aria-label={booked ? `${time}, booked` : undefined}
                    className={cn(
                      'w-full rounded-xl border py-2.5 text-sm font-medium tabular-nums transition',
                      booked
                        ? 'cursor-not-allowed border-white/[0.06] bg-white/[0.02] text-neutral-600 line-through'
                        : 'border-white/15 hover:-translate-y-px hover:border-white hover:bg-white hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none',
                    )}
                  >
                    {time}
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        </AnimatePresence>
      </div>
    </div>
  );
}

function HourFormatToggle({
  hour12,
  onChange,
}: {
  hour12: boolean;
  onChange: (hour12: boolean) => void;
}) {
  return (
    <div className="flex rounded-full bg-white/[0.08] p-0.5 text-xs font-medium" role="group">
      {[
        { label: '12h', value: true },
        { label: '24h', value: false },
      ].map((option) => {
        const active = option.value === hour12;
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative rounded-full px-2.5 py-1 transition-colors',
              active ? 'text-neutral-950' : 'text-neutral-400 hover:text-white',
            )}
          >
            {active && (
              <motion.span
                layoutId="hour-format"
                className="absolute inset-0 rounded-full bg-white"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
