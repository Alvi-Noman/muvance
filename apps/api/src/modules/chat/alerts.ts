import { ObjectId } from 'mongodb';
import { env } from '@/config/env';
import { collections } from '@/db/client';
import { logger } from '@/lib/logger';
import { plainText } from './chat.service';
import { chatFiles } from './files';
import { hub } from './hub';
import { chatEmail, chatMailer } from './mailer';
import { chatSessions } from './session';

/**
 * Guests (clients) don't keep chat open all day, so when a teammate writes to them and they
 * haven't read it within CHAT_EMAIL_ALERT_MINUTES, they get one email from that teammate. No more
 * emails until they've opened chat again.
 */
export const chatAlerts = {
  async run() {
    const due = await collections
      .chatEmailAlerts()
      .find({ dueAt: { $lte: new Date() } })
      .limit(50)
      .toArray();
    for (const alert of due) {
      await collections.chatEmailAlerts().deleteOne({ _id: alert._id });
      try {
        await this.alertOne(alert._id, alert.spaceId, alert.messageId, alert.authorId);
      } catch (error) {
        logger.warn({ err: error }, 'Chat email alert failed');
      }
    }
  },

  async alertOne(guestId: ObjectId, spaceId: ObjectId, messageId: ObjectId, authorId: ObjectId) {
    const guest = await collections.chatUsers().findOne({ _id: guestId });
    if (!guest || guest.status !== 'active' || hub.isOnline(guestId.toHexString())) return;
    // Already emailed since their last visit.
    if (guest.emailNotifiedAt && guest.emailNotifiedAt > (guest.lastSeenAt ?? new Date(0))) return;

    const memberships = await collections.chatMembers().find({ userId: guestId }).toArray();
    let unread = 0;
    for (const m of memberships) {
      if (m.muted) continue;
      unread += await collections.chatMessages().countDocuments(
        {
          spaceId: m.spaceId,
          authorId: { $ne: guestId },
          deletedAt: null,
          createdAt: { $gt: m.lastReadAt ?? m.joinedAt },
        },
        { limit: 100 },
      );
    }
    if (!unread) return;

    const [message, space, author] = await Promise.all([
      collections.chatMessages().findOne({ _id: messageId }),
      collections.chatSpaces().findOne({ _id: spaceId }),
      collections.chatUsers().findOne({ _id: authorId }),
    ]);
    if (!space || !author) return;
    // Sent from the writer's own address; otherwise from any teammate in that conversation.
    let from = author.kind === 'team' ? author : null;
    let password = from ? await chatSessions.mailPasswordOf(from._id) : null;
    if (!password) {
      const members = await collections.chatMembers().find({ spaceId }).toArray();
      const team = await collections
        .chatUsers()
        .find({ _id: { $in: members.map((m) => m.userId) }, kind: 'team', status: 'active' })
        .toArray();
      for (const t of team) {
        password = await chatSessions.mailPasswordOf(t._id);
        if (password) {
          from = t;
          break;
        }
      }
    }
    if (!from || !password) return;

    const ids = [...(message?.text.matchAll(/<@([a-f\d]{24})>/g) ?? [])].map((m) => m[1]!);
    const users = await collections
      .chatUsers()
      .find({ _id: { $in: ids.map((id) => new ObjectId(id)) } })
      .project<{ _id: ObjectId; name: string }>({ name: 1 })
      .toArray();
    const names = new Map(users.map((u) => [u._id.toHexString(), u.name]));
    let preview =
      message && !message.deletedAt
        ? plainText(message.text, names) || (message.attachments.length ? 'Sent a file' : '')
        : '';
    if (preview.length > 400) preview = `${preview.slice(0, 400)}…`;
    const where = space.kind === 'dm' ? 'a direct message' : `“${space.name}”`;

    await chatMailer.send(
      { email: from.email, password },
      {
        to: guest.email,
        subject:
          unread > 1
            ? `${unread} unread messages in Muvance Chat`
            : `${author.name} sent you a message`,
        ...chatEmail({
          heading: `${author.name} wrote in ${where}`,
          lines: [
            ...(preview ? [preview] : []),
            unread > 1 ? `You have ${unread} unread messages.` : '',
          ].filter(Boolean),
          button: 'Reply in Muvance Chat',
          url: `${env.CHAT_URL}/c/${space._id.toHexString()}`,
        }),
      },
    );
    await collections
      .chatUsers()
      .updateOne({ _id: guestId }, { $set: { emailNotifiedAt: new Date() } });
  },

  /** Files attached but never sent (the message was abandoned) are deleted after a day. */
  async cleanUpFiles() {
    const old = await collections
      .chatFiles()
      .find(
        { messageId: null, createdAt: { $lt: new Date(Date.now() - 86_400_000) } },
        { projection: { _id: 1 } },
      )
      .limit(500)
      .toArray();
    if (!old.length) return;
    const ids = old.map((f) => f._id);
    await collections.chatFiles().deleteMany({ _id: { $in: ids } });
    await chatFiles.remove(ids);
  },
};
