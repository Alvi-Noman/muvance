import { stat } from 'node:fs/promises';
import { Router } from 'express';
import { requirePermission } from '@/middlewares/auth';
import { toObjectId } from '@/lib/object-id';
import { HttpError } from '@/utils/http-error';
import {
  callRecordingsService,
  recordingPath,
  toCallRecordingDto,
} from './call-recordings.service';

/** Admin: the "Call recordings" page. Mounted behind `requireAuth`. */
export const callRecordingsRouter = Router();

callRecordingsRouter.get('/', requirePermission('leads:read'), async (_req, res) => {
  const docs = await callRecordingsService.list();
  res.json(docs.map(toCallRecordingDto));
});

/** The video itself. Supports seeking (HTTP range requests); ?download=1 saves it as a file. */
callRecordingsRouter.get('/:id/file', requirePermission('leads:read'), async (req, res) => {
  const doc = await callRecordingsService.get(toObjectId(String(req.params.id), 'Recording'));
  const file = recordingPath(doc);
  const exists = await stat(file).then(
    (s) => s.isFile(),
    () => false,
  );
  if (!exists) {
    throw HttpError.notFound(
      doc.status === 'ready'
        ? 'The video file is missing.'
        : 'This recording is still being saved.',
    );
  }
  res.setHeader('Cache-Control', 'private, max-age=3600');
  if (req.query.download) {
    const date = doc.startedAt.toISOString().slice(0, 16).replace(/[T:]/g, '-');
    res.download(file, `Muvance call ${doc.code} ${date}.mp4`);
  } else {
    res.type('video/mp4').sendFile(file);
  }
});

callRecordingsRouter.delete('/:id', requirePermission('leads:delete'), async (req, res) => {
  const doc = await callRecordingsService.get(toObjectId(String(req.params.id), 'Recording'));
  await callRecordingsService.remove(doc);
  res.status(204).end();
});
