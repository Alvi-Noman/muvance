export const THANK_YOU_PATH = '/thank-you';

/** What the booking page hands to the thank-you page (via router state). */
export type ThankYouState = {
  id: string;
  startsAt: string;
  endsAt: string;
  name: string;
  phone: string;
  timeZone: string;
  hour12: boolean;
};

export function isThankYouState(value: unknown): value is ThankYouState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return ['id', 'startsAt', 'endsAt', 'name', 'phone', 'timeZone'].every(
    (key) => typeof v[key] === 'string',
  );
}
