import express, { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import {
  clientIdSchema,
  recordingChunkQuerySchema,
  recordingListQuerySchema,
  startRecordingSchema,
} from '@muvance/shared';
import { isTest } from '@/config/env';
import { requirePermission } from '@/middlewares/auth';
import { validateBody, validateQuery } from '@/middlewares/validate';
import { HttpError } from '@/utils/http-error';
import { isBot, RECORDING_LIMITS, recordingsService } from './recordings.service';

const limiter = (limit: number) =>
  rateLimit({
    windowMs: 10 * 60_000,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => isTest,
  });

const recordingId = (raw: unknown) => {
  const parsed = clientIdSchema.safeParse(raw);
  if (!parsed.success) throw HttpError.notFound('Recording not found');
  return parsed.data;
};

/** Public: the website's session recorder uploads visits here. */
export const recordingUploadRouter = Router();

recordingUploadRouter.post(
  '/',
  limiter(30),
  validateBody(startRecordingSchema),
  async (req, res) => {
    const userAgent = req.get('user-agent') ?? '';
    if (!isBot(userAgent)) await recordingsService.start(req.body, userAgent);
    res.status(204).end();
  },
);

recordingUploadRouter.post(
  '/:id/chunks',
  limiter(600),
  // Pieces arrive as compressed bytes, not JSON, so they skip the app's JSON parser.
  express.raw({ type: 'application/octet-stream', limit: RECORDING_LIMITS.maxChunkBytes }),
  validateQuery(recordingChunkQuerySchema),
  async (req, res) => {
    const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    const stored = await recordingsService.addChunk(
      recordingId(req.params.id),
      res.locals.query,
      body,
    );
    // 204 either way; "stop" tells the recorder this visit has reached its limits.
    res
      .status(204)
      .set('X-Recording', stored ? 'ok' : 'stop')
      .end();
  },
);

/** Admin: watching recordings. Mounted behind `requireAuth`. */
export const recordingsRouter = Router();
const canRead = requirePermission('leads:read');

recordingsRouter.get('/', canRead, validateQuery(recordingListQuerySchema), async (_req, res) => {
  res.json(await recordingsService.list(res.locals.query));
});

recordingsRouter.get('/:id', canRead, async (req, res) => {
  res.json(await recordingsService.get(recordingId(req.params.id)));
});

recordingsRouter.get('/:id/events', canRead, async (req, res) => {
  const json = await recordingsService.eventsJson(recordingId(req.params.id));
  res.type('application/json').set('Cache-Control', 'private, max-age=300').send(json);
});

recordingsRouter.delete('/:id', requirePermission('leads:delete'), async (req, res) => {
  await recordingsService.remove(recordingId(req.params.id));
  res.status(204).end();
});
