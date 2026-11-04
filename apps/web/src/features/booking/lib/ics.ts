type CalendarEvent = {
  id: string;
  start: string;
  end: string;
  title: string;
  description: string;
};

const toIcsDate = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const escapeText = (text: string) => text.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

/** Downloads an .ics file that adds the event to Google, Apple or Outlook calendars. */
export function downloadIcs(event: CalendarEvent) {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Muvance//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@muvance`,
    `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
    `DTSTART:${toIcsDate(event.start)}`,
    `DTEND:${toIcsDate(event.end)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'muvance-call.ics';
  link.click();
  URL.revokeObjectURL(url);
}
