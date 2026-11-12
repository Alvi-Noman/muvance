import { gunzipSync } from 'node:zlib';
import { Binary, type Filter, ObjectId } from 'mongodb';
import type {
  DeviceType,
  RecordingChunkQuery,
  RecordingDto,
  RecordingSource,
  StartRecordingInput,
} from '@muvance/shared';
import type { z } from 'zod';
import type { recordingListQuerySchema } from '@muvance/shared';
import { env } from '@/config/env';
import { collections } from '@/db/client';
import type { RecordingDoc } from '@/db/types';
import { logger } from '@/lib/logger';
import { HttpError } from '@/utils/http-error';

const DAY = 86_400_000;

/** Per-visit limits, so one visitor (or someone abusing the endpoint) can't fill the database. */
export const RECORDING_LIMITS = {
  maxBytes: 20 * 1024 * 1024,
  maxChunkBytes: 2 * 1024 * 1024,
  maxDurationMs: 2 * 60 * 60 * 1000,
};

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|facebookexternalhit|preview|pingdom/i;
export const isBot = (userAgent = '') => !userAgent || BOT.test(userAgent);

/** Rough device details from the browser's user agent. */
export function parseDevice(userAgent: string) {
  const ua = userAgent;
  const type: DeviceType = /iPad|Tablet|PlayBook|Silk|Android(?!.*Mobi)/i.test(ua)
    ? 'tablet'
    : /Mobi|iPhone|iPod|Android/i.test(ua)
      ? 'mobile'
      : 'desktop';
  const browser = /FBAN|FBAV|FB_IAB/.test(ua)
    ? 'Facebook app'
    : /Instagram/.test(ua)
      ? 'Instagram app'
      : /Edg\//.test(ua)
        ? 'Edge'
        : /OPR\/|Opera/.test(ua)
          ? 'Opera'
          : /SamsungBrowser/.test(ua)
            ? 'Samsung Internet'
            : /Firefox|FxiOS/.test(ua)
              ? 'Firefox'
              : /Chrome|CriOS/.test(ua)
                ? 'Chrome'
                : /Safari/.test(ua)
                  ? 'Safari'
                  : 'Other';
  const os = /iPhone|iPad|iPod/.test(ua)
    ? 'iOS'
    : /Android/.test(ua)
      ? 'Android'
      : /Windows/.test(ua)
        ? 'Windows'
        : /Mac OS X|Macintosh/.test(ua)
          ? 'macOS'
          : /Linux|CrOS/.test(ua)
            ? 'Linux'
            : 'Other';
  return { type, browser, os };
}

const META_SOURCES = /^(fb|facebook|ig|instagram|meta|an|msg|messenger)$/i;

/** Where the visit came from: an ad, a social site, search, or straight in. */
export function parseSource(landingUrl: string, referrer: string): RecordingSource {
  let params = new URLSearchParams();
  try {
    params = new URL(landingUrl).searchParams;
  } catch {
    // Keep the defaults.
  }
  const utmSource = params.get('utm_source') ?? '';
  const campaign = params.get('utm_campaign') || null;
  const fromAd =
    params.has('fbclid') && (params.has('utm_source') || params.has('utm_campaign'))
      ? true
      : META_SOURCES.test(utmSource) && /paid|cpc|ad|ppc/i.test(params.get('utm_medium') ?? '');
  if (fromAd) return { label: 'Meta ad', fromAd, campaign };

  let host = '';
  try {
    host = referrer ? new URL(referrer).hostname.replace(/^www\.|^m\.|^l\.|^lm\./, '') : '';
  } catch {
    // Not a valid referrer.
  }
  const label =
    params.has('fbclid') || /facebook\.com|fb\.com/.test(host)
      ? 'Facebook'
      : /instagram\.com/.test(host)
        ? 'Instagram'
        : /google\./.test(host)
          ? 'Google'
          : utmSource
            ? utmSource
            : host || 'Direct';
  return { label, fromAd: false, campaign };
}

const pathOf = (url: string) => {
  try {
    return new URL(url).pathname;
  } catch {
    return '/';
  }
};

type ListQuery = z.output<typeof recordingListQuerySchema>;

async function toDtos(docs: RecordingDoc[]): Promise<RecordingDto[]> {
  const leadIds = [...new Set(docs.flatMap((d) => (d.leadId ? [d.leadId.toHexString()] : [])))];
  const leads = leadIds.length
    ? await collections
        .leads()
        .find({ _id: { $in: leadIds.map((id) => new ObjectId(id)) } }, { projection: { name: 1 } })
        .toArray()
    : [];
  const names = new Map(leads.map((l) => [l._id.toHexString(), l.name]));
  return docs.map((d) => {
    const leadId = d.leadId?.toHexString();
    return {
      id: d._id,
      startedAt: d.startedAt.toISOString(),
      durationMs: d.durationMs,
      pages: d.pages,
      landingUrl: d.landingUrl,
      source: d.source,
      device: d.device,
      booked: d.booked,
      // A deleted lead leaves no name behind, so its visits show as anonymous again.
      lead: leadId && names.has(leadId) ? { id: leadId, name: names.get(leadId)! } : null,
      visitNumber: d.visitNumber,
    };
  });
}

export const recordingsService = {
  async start(input: StartRecordingInput, userAgent: string) {
    const now = new Date();
    const existing = await collections.recordings().findOne({ _id: input.id });
    if (existing) return;

    // A returning visitor who already became a lead: link the new visit straight away.
    const earlier = await collections
      .recordings()
      .find({ visitorId: input.visitorId }, { projection: { leadId: 1 } })
      .toArray();
    const leadId = earlier.find((r) => r.leadId)?.leadId ?? null;
    const days = leadId ? env.RECORDING_LEAD_RETENTION_DAYS : env.RECORDING_RETENTION_DAYS;

    await collections
      .recordings()
      .insertOne({
        _id: input.id,
        visitorId: input.visitorId,
        visitNumber: earlier.length + 1,
        leadId,
        booked: false,
        startedAt: now,
        lastEventAt: now,
        durationMs: 0,
        pages: [pathOf(input.landingUrl)],
        landingUrl: input.landingUrl,
        referrer: input.referrer ?? '',
        source: parseSource(input.landingUrl, input.referrer ?? ''),
        device: { ...parseDevice(userAgent), width: input.width, height: input.height },
        chunkCount: 0,
        bytes: 0,
        expiresAt: new Date(now.getTime() + days * DAY),
      })
      .catch((error: unknown) => {
        // Two starts racing for the same id: the other one won, which is fine.
        if ((error as { code?: number }).code !== 11000) throw error;
      });
  },

  /** Stores one piece of a recording, unless the visit has hit its limits. */
  async addChunk(id: string, query: RecordingChunkQuery, body: Buffer) {
    const rec = await collections.recordings().findOne({ _id: id });
    if (!rec) throw HttpError.notFound('Recording not found');
    if (
      !body.length ||
      body.length > RECORDING_LIMITS.maxChunkBytes ||
      rec.bytes + body.length > RECORDING_LIMITS.maxBytes ||
      Date.now() - rec.startedAt.getTime() > RECORDING_LIMITS.maxDurationMs
    ) {
      return false;
    }

    await collections.recordingChunks().insertOne({
      _id: new ObjectId(),
      recordingId: id,
      seq: query.seq,
      encoding: query.encoding,
      data: new Binary(body),
      expiresAt: rec.expiresAt,
    });
    const path = query.path.split(/[?#]/)[0] || '/';
    // Duration runs from the visit's first event to its last, across all pieces.
    const firstTs = Math.min(rec.firstTs ?? query.start, query.start);
    const lastTs = Math.max(rec.lastTs ?? query.end, query.end);
    await collections.recordings().updateOne(
      { _id: id },
      {
        $inc: { chunkCount: 1, bytes: body.length },
        $min: { firstTs },
        $max: {
          lastTs,
          lastEventAt: new Date(),
          durationMs: Math.min(Math.max(0, lastTs - firstTs), RECORDING_LIMITS.maxDurationMs),
        },
        ...(rec.pages.at(-1) !== path && { $push: { pages: { $each: [path], $slice: -50 } } }),
      },
    );
    return true;
  },

  /**
   * After a booking: links all of the visitor's recorded visits to the lead, marks the visit
   * they booked in, and keeps them for longer.
   */
  async linkToLead(leadId: ObjectId, visitorId?: string, recordingId?: string) {
    if (!visitorId && !recordingId) return;
    const filter: Filter<RecordingDoc> = {
      $or: [...(visitorId ? [{ visitorId }] : []), ...(recordingId ? [{ _id: recordingId }] : [])],
    };
    const recs = await collections
      .recordings()
      .find(filter, { projection: { startedAt: 1 } })
      .toArray();
    if (!recs.length) return;
    for (const rec of recs) {
      const expiresAt = new Date(rec.startedAt.getTime() + env.RECORDING_LEAD_RETENTION_DAYS * DAY);
      await collections
        .recordings()
        .updateOne(
          { _id: rec._id },
          { $set: { leadId, expiresAt, ...(rec._id === recordingId && { booked: true }) } },
        );
      await collections
        .recordingChunks()
        .updateMany({ recordingId: rec._id }, { $set: { expiresAt } });
    }
  },

  async list(query: ListQuery) {
    const filter: Filter<RecordingDoc> = { chunkCount: { $gt: 0 } };
    if (query.filter === 'booked') filter.booked = true;
    if (query.filter === 'ads') filter['source.fromAd'] = true;
    if (query.minSeconds) filter.durationMs = { $gte: query.minSeconds * 1000 };
    if (query.leadId) {
      if (!ObjectId.isValid(query.leadId)) return { items: [], total: 0 };
      filter.leadId = new ObjectId(query.leadId);
    }
    const [docs, total] = await Promise.all([
      collections
        .recordings()
        .find(filter)
        .sort({ startedAt: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .toArray(),
      collections.recordings().countDocuments(filter),
    ]);
    return { items: await toDtos(docs), total };
  },

  async get(id: string) {
    const doc = await collections.recordings().findOne({ _id: id });
    if (!doc) throw HttpError.notFound('Recording not found');
    const [dto] = await toDtos([doc]);
    return dto!;
  },

  /** All events of a recording as one JSON array (text), ready for the player. */
  async eventsJson(id: string) {
    const chunks = await collections
      .recordingChunks()
      .find({ recordingId: id })
      .sort({ seq: 1, _id: 1 })
      .toArray();
    const parts: string[] = [];
    for (const chunk of chunks) {
      try {
        const buffer = Buffer.from(chunk.data.buffer);
        const text = (chunk.encoding === 'gzip' ? gunzipSync(buffer) : buffer).toString('utf8');
        // Each piece is a JSON array; check it parses, then join without re-encoding.
        const events: unknown = JSON.parse(text);
        if (Array.isArray(events) && events.length) parts.push(text.trim().slice(1, -1));
      } catch {
        logger.warn({ recordingId: id, seq: chunk.seq }, 'Skipped an unreadable recording piece');
      }
    }
    return `[${parts.join(',')}]`;
  },

  async remove(id: string) {
    const { deletedCount } = await collections.recordings().deleteOne({ _id: id });
    if (!deletedCount) throw HttpError.notFound('Recording not found');
    await collections.recordingChunks().deleteMany({ recordingId: id });
  },

  /**
   * Housekeeping: drops visits that never sent anything, and keeps recordings that didn't
   * become a lead under the storage cap by deleting the oldest first.
   */
  async cleanUp() {
    const empty = await collections
      .recordings()
      .deleteMany({ chunkCount: 0, startedAt: { $lt: new Date(Date.now() - 6 * 3_600_000) } });

    const cap = env.RECORDINGS_MAX_MB * 1024 * 1024;
    const [usage] = await collections
      .recordings()
      .aggregate<{ bytes: number }>([
        { $match: { leadId: null } },
        { $group: { _id: null, bytes: { $sum: '$bytes' } } },
      ])
      .toArray();
    let over = (usage?.bytes ?? 0) - cap;
    let removed = 0;
    if (over > 0) {
      const oldest = collections
        .recordings()
        .find({ leadId: null }, { projection: { bytes: 1 } })
        .sort({ startedAt: 1 });
      for await (const rec of oldest) {
        if (over <= 0) break;
        await this.remove(rec._id).catch(() => undefined);
        over -= rec.bytes;
        removed++;
      }
    }
    if (empty.deletedCount || removed) {
      logger.info({ empty: empty.deletedCount, removed }, 'Cleaned up session recordings');
    }
  },
};
