import { useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { LoaderCircle, RotateCw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router';
import type { BookingDetails } from '@muvance/shared';
import { useMediaQuery } from '@/hooks/use-media-query';
import { newEventId, trackBooking, trackEvent } from '@/lib/meta-pixel';
import { markRecording, recordingIds } from '@/lib/session-recorder';
import { useAvailability, useCreateBooking } from '../hooks/use-booking';
import { useElementSize } from '../hooks/use-element-size';
import { useUnfinishedBooking } from '../hooks/use-unfinished-booking';
import { THANK_YOU_PATH, type ThankYouState } from '../lib/thank-you';
import { dayKeyOf, detectedTimeZone, groupSlotsByDay } from '../lib/time';
import { BookingDetailsForm } from './BookingDetailsForm';
import { BookingInfoPanel } from './BookingInfoPanel';
import { Calendar, type MonthView } from './Calendar';
import { TimeSlots } from './TimeSlots';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Width of the times column on desktop (13rem). */
const TIMES_COLUMN_PX = 208;

const monthOf = (key: string): MonthView => {
  const [y, m] = key.split('-').map(Number) as [number, number];
  return { year: y, month: m - 1 };
};
const monthIndex = (v: MonthView) => v.year * 12 + v.month;

/** Slides steps sideways: forward goes left, back goes right. */
const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 32, filter: 'blur(4px)' }),
  center: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: (dir: number) => ({ opacity: 0, x: dir * -32, filter: 'blur(4px)' }),
};

/**
 * Booking flow: pick a date (times then appear beside the calendar on desktop, below it on
 * mobile) -> pick a time -> details -> thank-you page.
 */
export function BookingWidget() {
  const availability = useAvailability();
  const createBooking = useCreateBooking();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const [timeZone, setTimeZone] = useState(detectedTimeZone);
  const [hour12, setHour12] = useState(true);
  const [pickedDay, setPickedDay] = useState<string>();
  const [viewMonth, setViewMonth] = useState<MonthView>();
  const [selectedSlot, setSelectedSlot] = useState<string>();
  const [direction, setDirection] = useState(1);
  const [preparing, setPreparing] = useState(false);
  const unfinished = useUnfinishedBooking(selectedSlot, timeZone);

  const cardRef = useRef<HTMLDivElement>(null);
  const timesRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const { ref: contentRef, height } = useElementSize<HTMLDivElement>();

  const slots = availability.data?.slots;
  const durationMinutes = availability.data?.durationMinutes ?? 30;
  const booked = availability.data?.bookedSlots;
  const bookedSlots = useMemo(() => new Set(booked), [booked]);
  // A day is selectable only while it has an open time, so a fully booked day is greyed out.
  const availableDays = useMemo(
    () => new Set(groupSlotsByDay(slots ?? [], timeZone).keys()),
    [slots, timeZone],
  );
  // Booked times stay listed on their day, greyed out.
  const slotsByDay = useMemo(
    () => groupSlotsByDay([...(slots ?? []), ...(booked ?? [])].sort(), timeZone),
    [slots, booked, timeZone],
  );
  const dayKeys = [...availableDays];

  const todayKey = dayKeyOf(new Date(), timeZone);
  // A day stops being "selected" if it no longer has open times (e.g. after a time zone change).
  const selectedDay = pickedDay && availableDays.has(pickedDay) ? pickedDay : undefined;
  // Open on the month of the first open day (e.g. when the rest of this month is fully booked).
  const view = viewMonth ?? monthOf(selectedDay ?? dayKeys[0] ?? todayKey);
  const minMonth = monthOf(todayKey);
  const maxMonth = monthOf(dayKeys.at(-1) ?? todayKey);

  const step = selectedSlot ? 'details' : 'pick';

  /**
   * Smoothly scrolls an element to the top of the screen if it's out of comfortable view.
   * Takes a ref, read after the delay, because the element may not be rendered yet.
   */
  const bringIntoView = (ref: RefObject<HTMLElement | null>, delay: number) =>
    setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const { top } = el.getBoundingClientRect();
      if (top < 80 || top > window.innerHeight * 0.6) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, delay);

  /** Mobile: always scrolls a section to just below the header, once it has finished appearing. */
  const scrollToSection = (ref: RefObject<HTMLElement | null>, delay: number) =>
    setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth' }), delay);

  const selectDay = (key: string) => {
    setPickedDay(key);
    // Mobile: the times open below the calendar, so scroll down to them once they've expanded.
    if (!isDesktop) scrollToSection(timesRef, 450);
  };

  const selectSlot = (slot: string) => {
    setDirection(1);
    setSelectedSlot(slot);
    createBooking.reset();
    trackEvent('StartBooking');
    markRecording('picked-time', { slot });
    if (isDesktop) {
      bringIntoView(cardRef, 50);
    } else {
      // Mobile: skip the summary above the form. The form renders once the times have slid away.
      scrollToSection(detailsRef, 400);
    }
  };

  const backToTimes = () => {
    setDirection(-1);
    setSelectedSlot(undefined);
    // Mobile: return to the times (below the calendar) rather than the top of the card.
    if (isDesktop) bringIntoView(cardRef, 50);
    else scrollToSection(timesRef, 700);
  };

  const handleSlotTaken = () => {
    void availability.refetch();
    backToTimes();
  };

  const submit = async (details: BookingDetails) => {
    if (!selectedSlot || preparing || createBooking.isPending) return;
    unfinished.cancel();
    // Shared by the Pixel and the API's server copy of the Lead, so Meta counts it once.
    const eventId = newEventId();
    // Links the visitor's recorded visits to the new lead in the admin.
    setPreparing(true);
    const ids = await recordingIds().finally(() => setPreparing(false));
    createBooking.mutate(
      { ...details, startsAt: selectedSlot, timeZone, eventId, ...ids },
      {
        onSuccess: (booking) => {
          trackBooking(eventId);
          markRecording('booked');
          void availability.refetch();
          const state: ThankYouState = {
            ...booking,
            name: details.name,
            phone: details.phone,
            timeZone,
            hour12,
          };
          navigate(THANK_YOU_PATH, { state });
        },
      },
    );
  };

  return (
    <div
      ref={cardRef}
      className="mx-auto scroll-mt-24 overflow-clip rounded-[28px] bg-neutral-950 text-white shadow-[0_40px_100px_-30px_rgba(0,0,0,0.45)] ring-1 ring-black/5 lg:w-fit"
    >
      {/* Height animates smoothly as steps of different sizes swap in. */}
      <motion.div
        animate={{ height }}
        transition={{ duration: 0.45, ease: EASE }}
        className="overflow-clip"
      >
        <div ref={contentRef}>
          <div className="flex flex-col lg:flex-row">
            <aside className="shrink-0 border-b border-white/10 p-5 sm:p-8 lg:w-64 lg:border-r lg:border-b-0 xl:w-68">
              <BookingInfoPanel
                durationMinutes={durationMinutes}
                timeZone={timeZone}
                onTimeZoneChange={setTimeZone}
                hour12={hour12}
                selectedDay={step === 'details' ? selectedDay : undefined}
                selectedSlot={selectedSlot}
                onBack={step === 'details' ? backToTimes : undefined}
                backLabel="Change time"
              />
            </aside>

            {/* Fixed width on desktop: the card never changes size. */}
            <div className="min-w-0 lg:w-[36rem] xl:w-[40rem]">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                {availability.isPending ? (
                  <LoadingState key="loading" />
                ) : availability.isError ? (
                  <ErrorState key="error" onRetry={() => void availability.refetch()} />
                ) : step === 'pick' ? (
                  <StepPane
                    key="pick"
                    direction={direction}
                    // Tall enough for a full day of times, so the card keeps one height on desktop.
                    className="flex flex-col lg:min-h-[35rem] lg:flex-row"
                  >
                    {/* Calendar takes the remaining space, so it shrinks as the times column
                            opens beside it. */}
                    <div className="min-w-0 flex-1 p-5 sm:p-8 lg:p-7">
                      <Calendar
                        view={view}
                        onViewChange={setViewMonth}
                        canGoBack={monthIndex(view) > monthIndex(minMonth)}
                        canGoForward={monthIndex(view) < monthIndex(maxMonth)}
                        availableDays={availableDays}
                        selectedDay={selectedDay}
                        todayKey={todayKey}
                        onSelectDay={selectDay}
                      />
                      <AnimatePresence initial={false}>
                        {!selectedDay && (
                          <motion.p
                            key="hint"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: EASE }}
                            className="overflow-hidden text-center text-sm text-neutral-400"
                          >
                            <span className="block pt-5">Select a date to see available times</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence initial={false}>
                      {selectedDay && (
                        <motion.div
                          key="times"
                          ref={timesRef}
                          // Desktop: the column grows from zero width beside the calendar.
                          // Mobile: the section expands in height below the calendar.
                          initial={isDesktop ? { width: 0, opacity: 0 } : { height: 0, opacity: 0 }}
                          animate={
                            isDesktop
                              ? { width: TIMES_COLUMN_PX, opacity: 1 }
                              : { height: 'auto', opacity: 1 }
                          }
                          exit={isDesktop ? { width: 0, opacity: 0 } : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: EASE }}
                          className="shrink-0 overflow-hidden border-t border-white/10 lg:border-t-0 lg:border-l"
                        >
                          {/* Fixed inner width so the times don't squash while the column opens. */}
                          <div className="p-5 sm:p-8 lg:w-52 lg:px-5 lg:py-7">
                            <TimeSlots
                              dayKey={selectedDay}
                              slots={slotsByDay.get(selectedDay) ?? []}
                              bookedSlots={bookedSlots}
                              timeZone={timeZone}
                              hour12={hour12}
                              onHour12Change={setHour12}
                              onSelect={selectSlot}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </StepPane>
                ) : (
                  <StepPane key="details" direction={direction} className="p-6 sm:p-8">
                    <div ref={detailsRef} className="scroll-mt-5">
                      <BookingDetailsForm
                        onSubmit={(details) => void submit(details)}
                        isPending={createBooking.isPending || preparing}
                        error={createBooking.error}
                        onSlotTaken={handleSlotTaken}
                        onChange={unfinished.onChange}
                      />
                    </div>
                  </StepPane>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StepPane({
  direction,
  className,
  children,
}: {
  direction: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.3, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[26rem] items-center justify-center gap-3 text-sm text-neutral-400">
      <LoaderCircle className="size-4 animate-spin" aria-hidden />
      Loading open times…
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[26rem] flex-col items-center justify-center gap-4 px-6 text-center text-sm text-neutral-400">
      Couldn&apos;t load open times. Check your connection and try again.
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-white transition hover:bg-white/10"
      >
        <RotateCw className="size-4" aria-hidden />
        Try again
      </button>
    </div>
  );
}
