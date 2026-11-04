import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  Check,
  Clock,
  PhoneCall,
  Search,
  Video,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { buttonStyles } from '@/components/ui/Button';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/cn';
import { downloadIcs } from '../lib/ics';
import type { ThankYouState } from '../lib/thank-you';
import { formatLongDate, formatSlotTime, timeZoneOffsetLabel } from '../lib/time';

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: EASE },
});

export function BookingThankYou({ booking }: { booking: ThankYouState }) {
  const firstName = booking.name.trim().split(/\s+/)[0];
  const date = formatLongDate(booking.startsAt, booking.timeZone);
  const start = formatSlotTime(booking.startsAt, booking.timeZone, booking.hour12);
  const end = formatSlotTime(booking.endsAt, booking.timeZone, booking.hour12);
  // Keep the number on one line wherever it appears.
  const phone = <span className="whitespace-nowrap">{booking.phone}</span>;

  const nextSteps = [
    {
      icon: CalendarDays,
      title: 'Your time is reserved',
      body: 'This time is now held for you, and nobody else can book it.',
      done: true,
    },
    {
      icon: Search,
      title: 'We study your business',
      body: 'Before the call we go through your website, products and business, so we can get straight to what matters.',
    },
    {
      icon: PhoneCall,
      title: 'We call you first',
      body: <>Just before the meeting, we&apos;ll ring you on {phone}.</>,
    },
    {
      icon: Video,
      title: 'Your 30-minute strategy call',
      body: `${date}, ${start} – ${end}.`,
    },
  ];

  return (
    <>
      <div className="mx-auto max-w-2xl text-center">
        <SuccessBadge />

        <motion.span
          {...fadeUp(0.35)}
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/60 px-3 py-1 text-xs font-medium tracking-[0.14em] text-neutral-600 uppercase"
        >
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Booking confirmed
        </motion.span>

        <motion.h1
          {...fadeUp(0.45)}
          className="mt-5 font-serif text-[clamp(3rem,8vw,5.5rem)] leading-[0.95] tracking-[-0.02em] text-balance"
        >
          You&apos;re booked{firstName ? ',' : '.'} {firstName && <em>{firstName}.</em>}
        </motion.h1>

        <motion.p
          {...fadeUp(0.55)}
          className="mx-auto mt-6 max-w-lg text-base text-balance text-neutral-500 sm:text-lg"
        >
          We&apos;ll call you on{' '}
          <span className="font-medium whitespace-nowrap text-neutral-900">{booking.phone}</span>{' '}
          just before the meeting. Add it to your calendar so you don&apos;t miss it.
        </motion.p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:mt-16 lg:grid-cols-[1fr_1.15fr]">
        {/* Booking summary */}
        <motion.div
          {...fadeUp(0.65)}
          className="flex flex-col rounded-[28px] bg-neutral-950 p-6 text-white shadow-[0_40px_100px_-30px_rgba(0,0,0,0.45)] sm:p-8"
        >
          <p className="text-xs tracking-[0.14em] text-neutral-400 uppercase">Your call</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight">
            {siteConfig.name} strategy call
          </p>

          <ul className="mt-8 space-y-4 text-sm">
            <SummaryRow icon={CalendarDays} label="Date" value={date} />
            <SummaryRow
              icon={Clock}
              label="Time"
              value={`${start} – ${end}`}
              hint={`${booking.timeZone.replace(/_/g, ' ')} (${timeZoneOffsetLabel(booking.timeZone)})`}
            />
            <SummaryRow icon={PhoneCall} label="We'll call" value={booking.phone} />
            <SummaryRow
              icon={Video}
              label="Meeting"
              value="Online"
              hint="We'll share the link when we call"
            />
          </ul>

          <button
            type="button"
            onClick={() =>
              downloadIcs({
                id: booking.id,
                start: booking.startsAt,
                end: booking.endsAt,
                title: `${siteConfig.name} strategy call`,
                description: `Your free strategy call with ${siteConfig.name}. We'll call you on ${booking.phone} just before the meeting.`,
              })
            }
            className={cn(buttonStyles({ variant: 'inverted' }), 'mt-8 w-full sm:mt-auto')}
          >
            <CalendarPlus className="size-4" aria-hidden />
            Add to calendar
          </button>
        </motion.div>

        {/* What happens next */}
        <motion.div
          {...fadeUp(0.75)}
          className="rounded-[28px] border border-white/80 bg-white/70 p-6 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)] sm:p-8"
        >
          <p className="text-xs tracking-[0.14em] text-neutral-500 uppercase">What happens next</p>
          <motion.ol
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.9 } } }}
            className="mt-6"
          >
            {nextSteps.map((item, i) => (
              <motion.li
                key={item.title}
                variants={{
                  hidden: { opacity: 0, x: -8 },
                  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
                }}
                className="relative flex gap-4 pb-7 last:pb-0"
              >
                {/* Connecting line between steps */}
                {i < nextSteps.length - 1 && (
                  <span
                    className="absolute top-10 bottom-0 left-[19px] w-px bg-black/10"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    'relative grid size-10 shrink-0 place-items-center rounded-full',
                    item.done ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-700',
                  )}
                >
                  <item.icon className="size-4" aria-hidden />
                  {item.done && (
                    <span className="absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full bg-emerald-500 ring-2 ring-white">
                      <Check className="size-2.5 text-white" strokeWidth={3.5} aria-hidden />
                    </span>
                  )}
                </span>
                <div className="pt-1.5">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-500">{item.body}</p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>
      </div>

      <motion.div {...fadeUp(1.4)} className="mt-10 flex justify-center">
        <Link to="/" className={buttonStyles({ variant: 'secondary' })}>
          Back to home
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </motion.div>
    </>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <li className="flex gap-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/[0.08]">
        <Icon className="size-4 text-neutral-300" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="mt-0.5 font-medium">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>}
      </div>
    </li>
  );
}

/** A check that draws itself, inside a soft pulsing halo. */
function SuccessBadge() {
  return (
    <div className="relative mx-auto grid size-24 place-items-center" aria-hidden>
      <motion.span
        className="absolute inset-0 rounded-full bg-neutral-950/10"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1.25, 1.1], opacity: [0, 0.8, 0] }}
        transition={{ delay: 0.3, duration: 1.4, ease: 'easeOut' }}
      />
      <motion.svg
        viewBox="0 0 64 64"
        className="relative size-20"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        <circle cx="32" cy="32" r="32" className="fill-neutral-950" />
        <motion.path
          d="M20 33 L28.5 41.5 L45 24"
          fill="none"
          className="stroke-white"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.25, duration: 0.45, ease: 'easeOut' }}
        />
      </motion.svg>
    </div>
  );
}
