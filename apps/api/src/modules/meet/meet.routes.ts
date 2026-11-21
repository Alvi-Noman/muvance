import { randomBytes, randomInt } from 'node:crypto';
import { Router, type Request, type Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  MEET_MAX_PARTICIPANTS,
  createMeetRoomSchema,
  joinMeetRoomSchema,
  meetCodeSchema,
  meetDecisionSchema,
  meetMuteSchema,
  updateMeetRoomSchema,
  type MeetJoinRequestDto,
  type MeetJoinResultDto,
  type MeetRoomDto,
  type MeetRoomInfoDto,
} from '@muvance/shared';
import { rateLimit } from 'express-rate-limit';
import { isTest } from '@/config/env';
import { collections, isDuplicateKeyError } from '@/db/client';
import type { MeetJoinRequestDoc, MeetRoomDoc, UserDoc } from '@/db/types';
import { currentUser, requireAuth } from '@/middlewares/auth';
import { validateBody } from '@/middlewares/validate';
import { SESSION_COOKIE, sessionsService } from '@/modules/auth/sessions.service';
import { HttpError } from '@/utils/http-error';
import { callRecordingsService } from './call-recordings.service';
import { livekit } from './livekit';

export const meetRouter = Router();

/** A guest's page checks in every few seconds; a request nobody has checked on is stale. */
const WAITING_STALE_MS = 20_000;
/** An admitted guest can rejoin (e.g. after a refresh) without asking again, for this long. */
const ADMITTED_VALID_MS = 12 * 60 * 60_000;

const joinLimiter = rateLimit({
  windowMs: 10 * 60_000,
  limit: 40,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts. Please wait a few minutes and try again.' } },
  skip: () => isTest,
});

const letters = 'abcdefghijkmnopqrstuvwxyz'; // no "l": it reads like "1" and "I"
function randomLetters(n: number) {
  return Array.from({ length: n }, () => letters[randomInt(letters.length)]).join('');
}
function newCode() {
  return `${randomLetters(3)}-${randomLetters(4)}-${randomLetters(3)}`;
}
function randomId(bytes: number) {
  return randomBytes(bytes).toString('base64url');
}

function toRoomDto(room: MeetRoomDoc): MeetRoomDto {
  return {
    code: room.code,
    title: room.title,
    hostName: room.createdByName,
    quickAccess: room.quickAccess,
    createdAt: room.createdAt.toISOString(),
  };
}

function codeParam(req: Request) {
  const parsed = meetCodeSchema.safeParse(String(req.params.code).toLowerCase());
  if (!parsed.success) throw HttpError.notFound('Check your meeting code');
  return parsed.data;
}

async function findRoom(req: Request) {
  const room = await collections.meetRooms().findOne({ code: codeParam(req) });
  if (!room) throw HttpError.notFound("This meeting doesn't exist. Check the code or link.");
  return room;
}

/** The signed-in team member, if the request carries a valid session; guests get null. */
async function optionalUser(req: Request, res: Response): Promise<UserDoc | null> {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== 'string' || !token) return null;
  const user = await sessionsService.resolve(token, res);
  return user && !user.mustChangePassword ? user : null;
}

async function assertNotFull(code: string, identity?: string) {
  const people = await livekit.participants(code);
  // Someone rejoining (same identity) replaces their old connection, so they don't count twice.
  const others = people.filter((p) => p.identity !== identity);
  if (others.length >= MEET_MAX_PARTICIPANTS) {
    throw HttpError.conflict(`This meeting is full (${MEET_MAX_PARTICIPANTS} people at most).`);
  }
}

async function admittedResult(
  room: MeetRoomDoc,
  identity: string,
  name: string,
  role: 'host' | 'guest',
): Promise<MeetJoinResultDto> {
  await livekit.ensureRoom(room.code);
  await assertNotFull(room.code, identity);
  await collections
    .meetRooms()
    .updateOne({ _id: room._id }, { $set: { lastJoinedAt: new Date() } });
  const token = await livekit.token(room.code, identity, name, { role });
  return { status: 'admitted', token, role, identity };
}

// --- Team: create and list meetings -------------------------------------------------------

meetRouter.post('/rooms', requireAuth, validateBody(createMeetRoomSchema), async (req, res) => {
  const user = currentUser(req);
  for (let attempt = 0; attempt < 5; attempt++) {
    const room: MeetRoomDoc = {
      _id: new ObjectId(),
      code: newCode(),
      title: req.body.title || null,
      createdBy: user._id,
      createdByName: user.name,
      quickAccess: false,
      createdAt: new Date(),
      lastJoinedAt: null,
    };
    try {
      await collections.meetRooms().insertOne(room);
      return res.status(201).json(toRoomDto(room));
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
    }
  }
  throw new HttpError(500, 'Could not create a meeting. Please try again.');
});

meetRouter.get('/rooms', requireAuth, async (req, res) => {
  const rooms = await collections
    .meetRooms()
    .find({ createdBy: currentUser(req)._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();
  res.json(rooms.map(toRoomDto));
});

// --- Anyone with the link ------------------------------------------------------------------

// The lobby checks this every few seconds, so it only has the API's general rate limit.
meetRouter.get('/rooms/:code', async (req, res) => {
  const room = await findRoom(req);
  const people = await livekit.participants(room.code);
  const info: MeetRoomInfoDto = {
    ...toRoomDto(room),
    participants: people.map((p) => p.name),
    full: people.length >= MEET_MAX_PARTICIPANTS,
    maxParticipants: MEET_MAX_PARTICIPANTS,
  };
  res.json(info);
});

meetRouter.post(
  '/rooms/:code/join',
  joinLimiter,
  validateBody(joinMeetRoomSchema),
  async (req, res) => {
    const room = await findRoom(req);
    const user = await optionalUser(req, res);
    const name = req.body.name as string;

    // Team members join straight away, as hosts. Each tab is its own participant, so the same
    // person can be on a laptop and a phone.
    if (user) {
      const identity = `u_${user._id.toHexString()}_${randomId(4)}`;
      return res.json(await admittedResult(room, identity, user.name || name, 'host'));
    }

    if (room.quickAccess) {
      return res.json(await admittedResult(room, `g_${randomId(9)}`, name, 'guest'));
    }

    // Everyone else asks; a team member in the call admits or denies them.
    await assertNotFull(room.code);
    const now = new Date();
    const request: MeetJoinRequestDoc = {
      _id: randomId(24),
      code: room.code,
      name,
      status: 'pending',
      identity: `g_${randomId(9)}`,
      createdAt: now,
      lastSeenAt: now,
      decidedAt: null,
    };
    await collections.meetJoinRequests().insertOne(request);
    const result: MeetJoinResultDto = { status: 'pending', requestId: request._id };
    res.status(202).json(result);
  },
);

/** The waiting guest's page polls this. Once admitted, it returns a token to connect with. */
meetRouter.get('/rooms/:code/requests/:id', async (req, res) => {
  const code = codeParam(req);
  const request = await collections
    .meetJoinRequests()
    .findOneAndUpdate(
      { _id: String(req.params.id), code },
      { $set: { lastSeenAt: new Date() } },
      { returnDocument: 'after' },
    );
  if (!request) throw HttpError.notFound('This request has expired. Please ask to join again.');

  let result: MeetJoinResultDto;
  if (request.status === 'pending') {
    result = { status: 'pending', requestId: request._id };
  } else if (
    request.status === 'admitted' &&
    Date.now() - (request.decidedAt?.getTime() ?? 0) < ADMITTED_VALID_MS
  ) {
    const room = await findRoom(req);
    result = await admittedResult(room, request.identity, request.name, 'guest');
  } else {
    result = { status: 'denied' };
  }
  res.json(result);
});

/** The guest gave up waiting. */
meetRouter.delete('/rooms/:code/requests/:id', async (req, res) => {
  await collections
    .meetJoinRequests()
    .deleteOne({ _id: String(req.params.id), code: codeParam(req), status: 'pending' });
  res.status(204).end();
});

// --- Hosts (team members) in the call ------------------------------------------------------

meetRouter.get('/rooms/:code/requests', requireAuth, async (req, res) => {
  const code = codeParam(req);
  const requests = await collections
    .meetJoinRequests()
    .find({
      code,
      status: 'pending',
      lastSeenAt: { $gte: new Date(Date.now() - WAITING_STALE_MS) },
    })
    .sort({ createdAt: 1 })
    .limit(20)
    .toArray();
  const list: MeetJoinRequestDto[] = requests.map((r) => ({
    id: r._id,
    name: r.name,
    createdAt: r.createdAt.toISOString(),
  }));
  res.json(list);
});

meetRouter.post(
  '/rooms/:code/requests/:id/decision',
  requireAuth,
  validateBody(meetDecisionSchema),
  async (req, res) => {
    const code = codeParam(req);
    const { admit } = req.body as { admit: boolean };
    const result = await collections
      .meetJoinRequests()
      .updateOne(
        { _id: String(req.params.id), code, status: 'pending' },
        { $set: { status: admit ? 'admitted' : 'denied', decidedAt: new Date() } },
      );
    if (!result.matchedCount) throw HttpError.notFound('That person is no longer waiting.');
    res.status(204).end();
  },
);

meetRouter.patch(
  '/rooms/:code',
  requireAuth,
  validateBody(updateMeetRoomSchema),
  async (req, res) => {
    const room = await findRoom(req);
    const { title, quickAccess } = req.body as { title?: string; quickAccess?: boolean };
    const updated = await collections.meetRooms().findOneAndUpdate(
      { _id: room._id },
      {
        $set: {
          ...(title !== undefined && { title: title || null }),
          ...(quickAccess !== undefined && { quickAccess }),
        },
      },
      { returnDocument: 'after' },
    );
    // Turning quick access on lets everyone already waiting straight in.
    if (quickAccess) {
      await collections
        .meetJoinRequests()
        .updateMany(
          { code: room.code, status: 'pending' },
          { $set: { status: 'admitted', decidedAt: new Date() } },
        );
    }
    res.json(toRoomDto(updated ?? room));
  },
);

meetRouter.post(
  '/rooms/:code/participants/:identity/mute',
  requireAuth,
  validateBody(meetMuteSchema),
  async (req, res) => {
    const code = codeParam(req);
    const identity = String(req.params.identity);
    const { source } = req.body as { source: string };
    const person = (await livekit.participants(code)).find((p) => p.identity === identity);
    if (!person) throw HttpError.notFound('That person has left the call.');
    for (const track of person.tracks.filter((t) => t.source === source)) {
      await livekit.mute(code, identity, track.sid);
    }
    res.status(204).end();
  },
);

meetRouter.delete('/rooms/:code/participants/:identity', requireAuth, async (req, res) => {
  const code = codeParam(req);
  const identity = String(req.params.identity);
  await livekit.remove(code, identity);
  // A removed guest can't walk back in on their old admission.
  await collections
    .meetJoinRequests()
    .updateMany({ code, identity }, { $set: { status: 'denied', decidedAt: new Date() } });
  res.status(204).end();
});

meetRouter.post('/rooms/:code/end', requireAuth, async (req, res) => {
  const code = codeParam(req);
  await callRecordingsService.stop(code);
  await livekit.end(code);
  await collections
    .meetJoinRequests()
    .updateMany({ code }, { $set: { status: 'denied', decidedAt: new Date() } });
  res.status(204).end();
});

// --- Recording -----------------------------------------------------------------------------

/** Everyone in the call checks this, so they know when they're being recorded. */
meetRouter.get('/rooms/:code/recording', async (req, res) => {
  res.json(await callRecordingsService.stateFor(codeParam(req)));
});

meetRouter.post('/rooms/:code/recording', requireAuth, async (req, res) => {
  const room = await findRoom(req);
  await callRecordingsService.start(room.code, room.title, currentUser(req));
  res.status(201).json(await callRecordingsService.stateFor(room.code));
});

meetRouter.delete('/rooms/:code/recording', requireAuth, async (req, res) => {
  const code = codeParam(req);
  await callRecordingsService.stop(code);
  res.json(await callRecordingsService.stateFor(code));
});
