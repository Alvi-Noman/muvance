import { ObjectId } from 'mongodb';
import {
  applicationDetails,
  type Application,
  type ApplicationDto,
  type ApplicationStatus,
} from '@muvance/shared';
import { collections } from '@/db/client';
import type { ApplicationDoc } from '@/db/types';
import { HttpError } from '@/utils/http-error';

const toDto = (doc: ApplicationDoc): ApplicationDto => ({
  id: doc._id.toHexString(),
  type: doc.answers.type,
  status: doc.status,
  name: doc.answers.name,
  phone: doc.answers.phone,
  details: applicationDetails(doc.answers as Application),
  recordingId: doc.recordingId,
  createdAt: doc.createdAt.toISOString(),
  updatedAt: doc.updatedAt.toISOString(),
});

function objectId(raw: string) {
  if (!ObjectId.isValid(raw)) throw HttpError.notFound('That application no longer exists');
  return new ObjectId(raw);
}

export const applicationsService = {
  async create(input: Application) {
    const { visitorId, recordingId, eventId: _eventId, ...answers } = input;
    const now = new Date();
    const doc: ApplicationDoc = {
      _id: new ObjectId(),
      answers,
      status: 'new',
      visitorId: visitorId ?? null,
      recordingId: recordingId ?? null,
      createdAt: now,
      updatedAt: now,
    };
    await collections.applications().insertOne(doc);
    return toDto(doc);
  },

  /** Newest first. Applications come in a few a day at most, so no paging. */
  async list() {
    const docs = await collections
      .applications()
      .find()
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();
    return { items: docs.map(toDto), total: docs.length };
  },

  async setStatus(id: string, status: ApplicationStatus) {
    const doc = await collections
      .applications()
      .findOneAndUpdate(
        { _id: objectId(id) },
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: 'after' },
      );
    if (!doc) throw HttpError.notFound('That application no longer exists');
    return toDto(doc);
  },

  async remove(id: string) {
    const { deletedCount } = await collections.applications().deleteOne({ _id: objectId(id) });
    if (!deletedCount) throw HttpError.notFound('That application no longer exists');
  },
};
