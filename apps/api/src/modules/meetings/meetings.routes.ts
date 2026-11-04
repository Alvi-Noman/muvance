import { Router } from 'express';
import type { Filter } from 'mongodb';
import {
  meetingListQuerySchema,
  meetingStatusLabels,
  meetingTypeLabels,
  updateMeetingSchema,
  type MeetingStatus,
} from '@muvance/shared';
import { collections, isDuplicateKeyError } from '@/db/client';
import type { MeetingDoc } from '@/db/types';
import { currentUser, requirePermission } from '@/middlewares/auth';
import { validateBody, validateQuery } from '@/middlewares/validate';
import { toObjectId } from '@/lib/object-id';
import {
  changeStage,
  logActivity,
  refreshNextMeeting,
  toMeetingDtos,
} from '@/modules/leads/leads.helpers';
import { HttpError } from '@/utils/http-error';

/** Mounted behind `requireAuth`. */
export const meetingsRouter = Router();

meetingsRouter.get(
  '/',
  requirePermission('leads:read'),
  validateQuery(meetingListQuerySchema),
  async (_req, res) => {
    const { range, status } = res.locals.query as { range: string; status?: MeetingStatus };
    const now = new Date();
    const filter: Filter<MeetingDoc> = {};
    if (status) filter.status = status;
    if (range === 'upcoming') filter.endsAt = { $gte: now };
    if (range === 'past') filter.endsAt = { $lt: now };

    const meetings = await collections
      .meetings()
      .find(filter)
      .sort({ startsAt: range === 'upcoming' ? 1 : -1 })
      .limit(300)
      .toArray();
    res.json(await toMeetingDtos(meetings));
  },
);

meetingsRouter.patch(
  '/:id',
  requirePermission('leads:write'),
  validateBody(updateMeetingSchema),
  async (req, res) => {
    const id = toObjectId(String(req.params.id), 'Meeting');
    const meeting = await collections.meetings().findOne({ _id: id });
    if (!meeting) throw HttpError.notFound('Meeting not found');
    const status = req.body.status as MeetingStatus;

    let updated: MeetingDoc | null;
    try {
      updated = await collections
        .meetings()
        .findOneAndUpdate(
          { _id: id },
          { $set: { status, updatedAt: new Date() } },
          { returnDocument: 'after' },
        );
    } catch (error) {
      // Re-scheduling a cancelled call whose slot has since been booked by someone else.
      if (isDuplicateKeyError(error)) throw HttpError.conflict('That time slot is already booked.');
      throw error;
    }
    if (!updated) throw HttpError.notFound('Meeting not found');

    if (status !== meeting.status) {
      await logActivity(
        meeting.leadId,
        'meeting_updated',
        `Marked the ${meetingTypeLabels[meeting.type ?? 'discovery'].toLowerCase()} as ${meetingStatusLabels[status].toLowerCase()}`,
        currentUser(req)._id,
        { meetingId: id.toHexString(), from: meeting.status, to: status },
      );
      await refreshNextMeeting(meeting.leadId);

      // Finishing the discovery call moves the lead on to "Discovery done".
      if ((meeting.type ?? 'discovery') === 'discovery' && status === 'completed') {
        const lead = await collections.leads().findOne({ _id: meeting.leadId });
        if (lead?.stage === 'discovery_booked') {
          await changeStage(lead, 'discovery_done', currentUser(req)._id);
        }
      }
    }
    res.json((await toMeetingDtos([updated]))[0]);
  },
);
