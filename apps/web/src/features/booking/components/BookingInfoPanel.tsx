import { ArrowLeft, CalendarDays, ChevronDown, Clock, Globe, Video } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { LogoMark } from '@/components/brand/Logo';
import { siteConfig } from '@/config/site';
import {
  addMinutes,
  detectedTimeZone,
  formatDayLong,
  formatLongDate,
  formatSlotTime,
  timeZoneOffsetLabel,
} from '../lib/time';

const COMMON_TIME_ZONES = [
  'Asia/Dhaka',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'America/New_York',
  'Australia/Sydney',
];

type BookingInfoPanelProps = {
  durationMinutes: number;
  timeZone: string;
  onTimeZoneChange: (timeZone: string) => void;
  hour12: boolean;
  selectedDay?: string;
  selectedSlot?: string;
  onBack?: () => void;
  backLabel?: string;
};

export function BookingInfoPanel({
  durationMinutes,
  timeZone,
  onTimeZoneChange,
  hour12,
  selectedDay,
  selectedSlot,
  onBack,
  backLabel = 'Back',
}: BookingInfoPanelProps) {
  const zones = [...new Set([detectedTimeZone, timeZone, ...COMMON_TIME_ZONES])];

  return (
    <div>
      <AnimatePresence initial={false}>
        {onBack && (
          <motion.button
            type="button"
            onClick={onBack}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="group flex items-center gap-2 overflow-hidden text-sm text-neutral-400 transition-colors hover:text-white"
          >
            <span className="mb-6 flex items-center gap-2">
              <ArrowLeft
                className="size-4 transition-transform group-hover:-translate-x-0.5"
                aria-hidden
              />
              {backLabel}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-white text-neutral-950">
          <LogoMark className="w-6" />
        </span>
        <span className="font-logo text-sm font-semibold tracking-[-0.02em] text-neutral-300">
          {siteConfig.name}
        </span>
      </div>
      <h2 className="mt-4 text-xl font-semibold tracking-tight">
        {durationMinutes}-min strategy call
      </h2>
      <p className="mt-2 hidden text-sm leading-relaxed text-neutral-400 lg:block">
        A walkthrough of your business, website and products, and the three biggest opportunities we
        see.
      </p>

      {/* Wraps into a compact row on small screens, a list on desktop. */}
      <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-neutral-200 lg:mt-6 lg:block lg:space-y-3.5">
        <AnimatePresence initial={false}>
          {selectedDay && (
            <motion.li
              key="when"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full overflow-hidden"
            >
              <div className="flex gap-3 rounded-2xl bg-white/[0.08] p-3.5">
                <CalendarDays className="mt-0.5 size-4 shrink-0" aria-hidden />
                <div>
                  <p className="font-medium text-white">
                    {selectedSlot
                      ? formatLongDate(selectedSlot, timeZone)
                      : formatDayLong(selectedDay)}
                  </p>
                  <p className="mt-0.5 text-neutral-400 tabular-nums">
                    {selectedSlot
                      ? `${formatSlotTime(selectedSlot, timeZone, hour12)} – ${formatSlotTime(addMinutes(selectedSlot, durationMinutes), timeZone, hour12)}`
                      : 'Pick a time'}
                  </p>
                </div>
              </div>
            </motion.li>
          )}
        </AnimatePresence>
        <li className="flex items-center gap-3">
          <Clock className="size-4 shrink-0 text-neutral-400" aria-hidden />
          {durationMinutes} min
        </li>
        <li className="flex items-center gap-3">
          <Video className="size-4 shrink-0 text-neutral-400" aria-hidden />
          Online meeting
        </li>
        <li className="flex items-center gap-3">
          <Globe className="size-4 shrink-0 text-neutral-400" aria-hidden />
          <label className="relative flex min-w-0 items-center">
            <span className="sr-only">Time zone</span>
            <select
              value={timeZone}
              onChange={(e) => onTimeZoneChange(e.target.value)}
              className="max-w-full cursor-pointer appearance-none truncate bg-transparent pr-6 outline-none [&>option]:bg-neutral-900"
            >
              {zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone.replace(/_/g, ' ')} ({timeZoneOffsetLabel(zone)})
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-0 size-4 text-neutral-400"
              aria-hidden
            />
          </label>
        </li>
      </ul>
    </div>
  );
}
