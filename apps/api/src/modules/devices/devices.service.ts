import { ObjectId } from 'mongodb';
import { can } from '@muvance/shared';
import { hostTimeZone } from '@/config/booking';
import { env } from '@/config/env';
import { collections } from '@/db/client';
import type { UserDoc } from '@/db/types';
import { logger } from '@/lib/logger';

/** Created by the Android app; its importance and sound can't be changed from the server. */
const CHANNEL_ID = 'new-leads';
const SOUND = 'new_lead';

/** FCM errors that mean a phone token is dead (app removed, data cleared). */
const DEAD_TOKEN_ERRORS = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

type PushMessage = { title: string; body: string; data: Record<string, string> };

let messaging: Promise<import('firebase-admin/messaging').Messaging | null> | undefined;

function firebase() {
  messaging ??= (async () => {
    if (!env.FIREBASE_SERVICE_ACCOUNT) return null;
    const { cert, initializeApp } = await import('firebase-admin/app');
    const { getMessaging } = await import('firebase-admin/messaging');
    const account = JSON.parse(
      Buffer.from(env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString(),
    ) as object;
    return getMessaging(initializeApp({ credential: cert(account) }));
  })();
  return messaging;
}

/** Sends to phones and returns the tokens that no longer exist. Replaced in tests. */
export const pushSender = {
  async send(tokens: string[], message: PushMessage): Promise<string[]> {
    const client = await firebase();
    if (!client) return [];
    const { responses } = await client.sendEachForMulticast({
      tokens,
      notification: { title: message.title, body: message.body },
      data: message.data,
      android: {
        priority: 'high',
        notification: { channelId: CHANNEL_ID, sound: SOUND, tag: message.data.leadId },
      },
    });
    return tokens.filter((_, i) => {
      const code = responses[i]?.error?.code;
      return code !== undefined && DEAD_TOKEN_ERRORS.has(code);
    });
  },
};

const callTime = new Intl.DateTimeFormat('en-US', {
  timeZone: hostTimeZone.name,
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export const devicesService = {
  /** One phone belongs to whoever signed in on it last. */
  async register(user: UserDoc, token: string) {
    const now = new Date();
    await collections.devices().updateOne(
      { token },
      {
        $set: { userId: user._id, updatedAt: now },
        $setOnInsert: { _id: new ObjectId(), createdAt: now },
      },
      { upsert: true },
    );
  },

  async unregister(user: UserDoc, token: string) {
    await collections.devices().deleteOne({ token, userId: user._id });
  },

  /** Alerts every active teammate who can see leads. Never throws: a booking must not depend on it. */
  async notifyNewLead(lead: {
    id: string;
    name: string;
    businessName: string;
    startsAt: Date;
  }): Promise<void> {
    try {
      const users = await collections
        .users()
        .find({ status: 'active' }, { projection: { role: 1 } })
        .toArray();
      const userIds = users.filter((u) => can(u.role, 'leads:read')).map((u) => u._id);
      const devices = await collections
        .devices()
        .find({ userId: { $in: userIds } }, { projection: { token: 1 } })
        .toArray();
      if (!devices.length) return;

      const dead = await pushSender.send(
        devices.map((d) => d.token),
        {
          title: 'New lead',
          body: `${lead.name} · ${lead.businessName} · ${callTime.format(lead.startsAt)}`,
          data: { leadId: lead.id },
        },
      );
      if (dead.length) await collections.devices().deleteMany({ token: { $in: dead } });
    } catch (error) {
      logger.error({ err: error, leadId: lead.id }, 'Could not send the new lead notification');
    }
  },
};
