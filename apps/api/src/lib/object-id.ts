import { ObjectId } from 'mongodb';
import { HttpError } from '@/utils/http-error';

/** Parses a route/body id, turning malformed ids into a 404 rather than a server error. */
export function toObjectId(id: string, what = 'Record') {
  if (!ObjectId.isValid(id)) throw HttpError.notFound(`${what} not found`);
  return new ObjectId(id);
}

export const iso = (date: Date | null | undefined) => (date ? date.toISOString() : null);
