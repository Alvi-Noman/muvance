import { ObjectId } from 'mongodb';
import webpush from 'web-push';
import { env } from '@/config/env';
import { collections } from '@/db/client';
import type { ChatMessageDoc, ChatSpaceDoc, ChatUserDoc } from '@/db/types';
import { logger } from '@/lib/logger';
import { describeAttachment, dndOn, plainText } from './chat.service';

/**
 * Push notifications for new messages, to browsers and the Android app (standard Web Push, so
 * no outside account is needed). The keys are made once and kept in the database.
 */

export interface ChatPushPayload {
  title: string;
  body: string;
  spaceId: string;
  messageId: string;
  /** Notifications for one conversation replace each other. */
  tag: string;
  icon: string | null;
}

let keys: Promise<{ publicKey: string; privateKey: string }> | undefined;

function vapidKeys() {
  keys ??= (async () => {
    const generated = webpush.generateVAPIDKeys();
    await collections.chatConfig().updateOne(
      { _id: 'vapid' },
      {
        $setOnInsert: {
          value: { publicKey: generated.publicKey, privateKey: generated.privateKey },
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
    const doc = await collections.chatConfig().findOne({ _id: 'vapid' });
    return doc!.value as { publicKey: string; privateKey: string };
  })().catch((error: unknown) => {
    keys = undefined;
    throw error;
  });
  return keys;
}

/** Sends one push; replaced in tests. Returns false when the subscription is gone for good. */
export const pushTransport = {
  async send(
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    payload: ChatPushPayload,
  ): Promise<boolean> {
    const vapid = await vapidKeys();
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload), {
        TTL: 86_400,
        urgency: 'high',
        topic: payload.tag.slice(0, 32).replace(/[^A-Za-z0-9_-]/g, ''),
        vapidDetails: {
          subject: `mailto:no-reply@${env.MAIL_DOMAIN}`,
          publicKey: vapid.publicKey,
          privateKey: vapid.privateKey,
        },
      });
      return true;
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) return false;
      logger.warn({ err: error, status }, 'Chat push failed');
      return true;
    }
  },
};

export const chatPush = {
  async publicKey() {
    try {
      return (await vapidKeys()).publicKey;
    } catch {
      return null;
    }
  },

  async subscribe(
    userId: ObjectId,
    sub: { endpoint: string; keys: { p256dh: string; auth: string } },
  ) {
    const now = new Date();
    // One device belongs to whoever signed in on it last.
    await collections.chatPushSubscriptions().updateOne(
      { endpoint: sub.endpoint },
      {
        $set: { userId, keys: sub.keys, updatedAt: now },
        $setOnInsert: { _id: new ObjectId(), createdAt: now },
      },
      { upsert: true },
    );
  },

  async unsubscribe(userId: ObjectId, endpoint: string) {
    await collections.chatPushSubscriptions().deleteOne({ endpoint, userId });
  },

  /**
   * Tells the people in a conversation about a new message, on every device they turned
   * notifications on for. Skips the author, people who paused notifications, and muted
   * conversations unless they were mentioned. Never throws.
   */
  async notify(message: ChatMessageDoc, space: ChatSpaceDoc, author: ChatUserDoc) {
    try {
      const members = await collections
        .chatMembers()
        .find({ spaceId: space._id, userId: { $ne: author._id } })
        .toArray();
      if (!members.length) return;
      const users = await collections
        .chatUsers()
        .find(
          { _id: { $in: members.map((m) => m.userId) }, status: { $ne: 'removed' } },
          { projection: { dndUntil: 1 } },
        )
        .toArray();
      const mentionsAll = message.mentions.includes('all');
      const targets = users.filter((u) => {
        if (dndOn(u)) return false;
        const member = members.find((m) => m.userId.equals(u._id));
        if (!member?.muted) return true;
        return mentionsAll || message.mentions.includes(u._id.toHexString());
      });
      if (!targets.length) return;
      const subs = await collections
        .chatPushSubscriptions()
        .find({ userId: { $in: targets.map((u) => u._id) } })
        .toArray();
      if (!subs.length) return;

      const people = await collections
        .chatUsers()
        .find({ _id: { $in: members.map((m) => m.userId) } }, { projection: { name: 1 } })
        .toArray();
      const names = new Map(people.map((p) => [p._id.toHexString(), p.name]));
      names.set(author._id.toHexString(), author.name);
      const text =
        plainText(message.text, names) ||
        (message.attachments[0] ? describeAttachment(message.attachments[0]) : 'New message');
      const title =
        space.kind === 'space'
          ? `${author.name} in ${space.name}${message.threadId ? ' (thread)' : ''}`
          : author.name;
      const payload: ChatPushPayload = {
        title,
        body: text.slice(0, 240),
        spaceId: space._id.toHexString(),
        messageId: message._id.toHexString(),
        tag: space._id.toHexString(),
        icon:
          author.teamAvatarAt || author.avatar
            ? `/api/chat/avatars/${author._id.toHexString()}`
            : null,
      };
      const results = await Promise.all(subs.map((s) => pushTransport.send(s, payload)));
      const gone = subs.filter((_, i) => !results[i]).map((s) => s._id);
      if (gone.length) await collections.chatPushSubscriptions().deleteMany({ _id: { $in: gone } });
    } catch (error) {
      logger.error({ err: error }, 'Could not send chat push notifications');
    }
  },
};
