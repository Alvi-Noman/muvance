import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Binary, ObjectId } from 'mongodb';
import type {
  MailAccountDto,
  MailAccountsDto,
  MailAddressDto,
  MailAddressInput,
  UpdateMailAccountInput,
  UpdateMailAddressInput,
} from '@muvance/shared';
import { env } from '@/config/env';
import { collections, isDuplicateKeyError } from '@/db/client';
import type { MailAccountDoc, MailAddressDoc, UserDoc } from '@/db/types';
import { logger } from '@/lib/logger';
import { sha512Crypt } from '@/lib/sha512-crypt';
import { HttpError } from '@/utils/http-error';

/** Addresses every mail domain should have; they go to the first mailbox unless taken. */
const ROLE_ADDRESSES = ['postmaster', 'abuse', 'dmarc'];

export function senderNameOf(doc: Pick<MailAccountDoc, 'senderName' | 'name'>) {
  return doc.senderName || doc.name;
}

export function toMailAccountDto(
  doc: MailAccountDoc,
  addresses: MailAddressDoc[] = [],
): MailAccountDto {
  return {
    id: doc._id.toHexString(),
    address: doc.address,
    localPart: doc.localPart,
    name: doc.name,
    senderName: senderNameOf(doc),
    quotaGb: doc.quotaGb,
    addresses: addresses
      .filter((a) => a.ownerIds.some((o) => o.equals(doc._id)))
      .map((a) => a.address),
    createdAt: doc.createdAt.toISOString(),
    createdByName: doc.createdByName,
    avatarUrl: doc.avatar
      ? `/api/mail-accounts/${doc._id.toHexString()}/avatar?v=${doc.avatar.updatedAt.getTime()}`
      : null,
  };
}

function toMailAddressDto(doc: MailAddressDoc, accounts: MailAccountDoc[]): MailAddressDto {
  return {
    id: doc._id.toHexString(),
    address: doc.address,
    localPart: doc.localPart,
    displayName: doc.displayName,
    owners: doc.ownerIds
      .map((id) => accounts.find((a) => a._id.equals(id)))
      .filter((a): a is MailAccountDoc => !!a)
      .map((a) => ({ id: a._id.toHexString(), address: a.address, name: a.name })),
  };
}

/** Webmail's URL for someone's picture (versioned, so a new picture shows at once). */
export function webmailAvatarUrl(doc: Pick<MailAccountDoc, 'address' | 'avatar'>) {
  return doc.avatar
    ? `/api/webmail/avatars/${encodeURIComponent(doc.address)}?v=${doc.avatar.updatedAt.getTime()}`
    : null;
}

/** Lists without the picture bytes (only whether there is one, and when it changed). */
const withoutAvatarBytes = { 'avatar.data': 0 } as const;

const signatures: Record<string, (b: Buffer) => boolean> = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) =>
    b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (b) =>
    b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
};

/** Turns an uploaded data URL into image bytes, checking it really is the image type it claims. */
export function decodeAvatar(dataUrl: string) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl);
  const type = match?.[1];
  const bytes = match ? Buffer.from(match[2]!, 'base64') : Buffer.alloc(0);
  if (!type || !signatures[type]?.(bytes)) {
    throw HttpError.badRequest("That file isn't a JPG, PNG or WebP picture.");
  }
  if (bytes.length > 400_000) throw HttpError.badRequest('That picture is too large.');
  return { data: new Binary(bytes), contentType: type, updatedAt: new Date() };
}

async function writeAtomically(file: string, content: string, mode = 0o600) {
  const full = path.join(env.MAIL_CONFIG_DIR, file);
  const temp = `${full}.${process.pid}.tmp`;
  await writeFile(temp, content, { mode });
  await rename(temp, full);
}

/** Throws if a mailbox or shared address already uses this name. */
async function assertFree(localPart: string, except?: ObjectId) {
  const [account, address] = await Promise.all([
    collections.mailAccounts().findOne({ localPart }, { projection: { _id: 1 } }),
    collections.mailAddresses().findOne({ localPart }, { projection: { _id: 1 } }),
  ]);
  const clash = [account, address].find((d) => d && !(except && d._id.equals(except)));
  if (clash) throw HttpError.conflict(`${localPart}@${env.MAIL_DOMAIN} is already in use.`);
}

async function ownersFrom(ids: string[]) {
  const objectIds = [...new Set(ids)].map((id) => new ObjectId(id));
  const found = await collections.mailAccounts().countDocuments({ _id: { $in: objectIds } });
  if (found !== objectIds.length)
    throw HttpError.badRequest('Choose people from the mailbox list.');
  return objectIds;
}

export const mailService = {
  /**
   * Writes the mail server's accounts, aliases and quotas files from the database. docker-mailserver
   * checks them every couple of seconds and applies changes on its own.
   */
  async sync() {
    const [all, addresses, disabled] = await Promise.all([
      collections
        .mailAccounts()
        .find({}, { projection: withoutAvatarBytes })
        .sort({ createdAt: 1 })
        .toArray(),
      collections.mailAddresses().find().toArray(),
      collections
        .users()
        .find(
          { status: 'disabled', mailAccountId: { $type: 'objectId' } },
          { projection: { mailAccountId: 1 } },
        )
        .toArray(),
    ]);
    // A disabled Muvance account's mailbox can't be signed in to (its mail is kept).
    const off = new Set(disabled.map((u) => u.mailAccountId!.toHexString()));
    const accounts = all.filter((a) => !off.has(a._id.toHexString()));
    const domain = env.MAIL_DOMAIN;
    const used = new Set([
      ...accounts.map((a) => a.localPart),
      ...addresses.map((a) => a.localPart),
    ]);

    const accountLines = accounts.map((a) => `${a.address}|{SHA512-CRYPT}${a.passwordHash}`);
    // A shared address goes to all its owners. With nobody left, it's left out (mail bounces).
    const aliasLines = addresses.flatMap((a) => {
      const targets = a.ownerIds
        .map((id) => accounts.find((acc) => acc._id.equals(id))?.address)
        .filter(Boolean);
      return targets.length ? [`${a.address} ${targets.join(',')}`] : [];
    });
    const first = accounts[0];
    if (first) {
      for (const role of ROLE_ADDRESSES) {
        if (!used.has(role)) aliasLines.push(`${role}@${domain} ${first.address}`);
      }
    }
    const quotaLines = accounts.map((a) => `${a.address}:${a.quotaGb}G`);

    await mkdir(env.MAIL_CONFIG_DIR, { recursive: true });
    await writeAtomically('postfix-accounts.cf', accountLines.join('\n') + '\n');
    await writeAtomically('postfix-virtual.cf', aliasLines.join('\n') + '\n');
    await writeAtomically('dovecot-quotas.cf', quotaLines.join('\n') + '\n');
    // Readable by deploy.sh (the files above are private): it starts email once there's a mailbox.
    await writeAtomically('mailbox-count', `${accounts.length}\n`, 0o644);
    logger.info(
      { accounts: accounts.length, addresses: addresses.length },
      'Mail server accounts updated',
    );
  },

  async list(): Promise<MailAccountsDto> {
    const [accounts, addresses] = await Promise.all([
      collections
        .mailAccounts()
        .find({}, { projection: withoutAvatarBytes })
        .sort({ createdAt: 1 })
        .toArray(),
      collections.mailAddresses().find().sort({ localPart: 1 }).toArray(),
    ]);
    return {
      domain: env.MAIL_DOMAIN,
      webmailUrl: `https://${env.MAIL_HOST}`,
      clientSettings: {
        imapHost: env.MAIL_HOST,
        imapPort: 993,
        smtpHost: env.MAIL_HOST,
        smtpPort: 465,
      },
      accounts: accounts.map((a) => toMailAccountDto(a, addresses)),
      addresses: addresses.map((a) => toMailAddressDto(a, accounts)),
    };
  },

  /** Throws if a mailbox or shared address already uses this name. */
  assertFree,

  /**
   * A Muvance account's mailbox: the account's address and password (they stay the same as the
   * account's from then on). Made from the admin's People page, never on its own.
   */
  async createForAccount(
    user: Pick<UserDoc, '_id' | 'email' | 'name' | 'usernameKey'>,
    password: string,
    by: Pick<UserDoc, '_id' | 'name'>,
  ) {
    const address = user.email!;
    const localPart = address.split('@')[0]!;
    await assertFree(localPart);
    const now = new Date();
    const doc: MailAccountDoc = {
      _id: new ObjectId(),
      localPart,
      address,
      name: user.name,
      passwordHash: sha512Crypt(password),
      mustChangePassword: false,
      quotaGb: 10,
      createdBy: by._id,
      createdByName: by.name,
      createdAt: now,
      updatedAt: now,
    };
    try {
      await collections.mailAccounts().insertOne(doc);
    } catch (error) {
      if (isDuplicateKeyError(error)) throw HttpError.conflict(`${doc.address} already exists.`);
      throw error;
    }
    await collections
      .users()
      .updateOne({ _id: user._id }, { $set: { mailAccountId: doc._id, updatedAt: now } });
    await this.sync();
    return doc;
  },

  async get(id: ObjectId) {
    const doc = await collections.mailAccounts().findOne({ _id: id });
    if (!doc) throw HttpError.notFound('Email account not found');
    return doc;
  },

  async dto(id: ObjectId) {
    const addresses = await collections.mailAddresses().find({ ownerIds: id }).toArray();
    return toMailAccountDto(await this.get(id), addresses);
  },

  async update(id: ObjectId, input: UpdateMailAccountInput) {
    await this.get(id);
    const set: Partial<MailAccountDoc> = { updatedAt: new Date() };
    if (input.name !== undefined) set.name = input.name;
    if (input.senderName !== undefined) set.senderName = input.senderName;
    if (input.quotaGb !== undefined) set.quotaGb = input.quotaGb;
    await collections.mailAccounts().updateOne({ _id: id }, { $set: set });
    await this.sync();
    return this.dto(id);
  },

  /**
   * Removes the mailbox from the mail server: the address stops receiving and nobody can sign in.
   * The person is taken off any shared addresses. Their stored mail stays on the server's disk.
   */
  async remove(id: ObjectId) {
    await this.get(id);
    await collections.mailAccounts().deleteOne({ _id: id });
    await collections.mailAddresses().updateMany({ ownerIds: id }, { $pull: { ownerIds: id } });
    await this.sync();
  },

  /* Shared addresses ------------------------------------------------------------------------ */

  async createAddress(input: MailAddressInput) {
    await assertFree(input.localPart);
    const now = new Date();
    const doc: MailAddressDoc = {
      _id: new ObjectId(),
      localPart: input.localPart,
      address: `${input.localPart}@${env.MAIL_DOMAIN}`,
      displayName: input.displayName,
      ownerIds: await ownersFrom(input.ownerIds),
      createdAt: now,
      updatedAt: now,
    };
    try {
      await collections.mailAddresses().insertOne(doc);
    } catch (error) {
      if (isDuplicateKeyError(error)) throw HttpError.conflict(`${doc.address} already exists.`);
      throw error;
    }
    await this.sync();
    return doc;
  },

  async updateAddress(id: ObjectId, input: UpdateMailAddressInput) {
    const set: Partial<MailAddressDoc> = { updatedAt: new Date() };
    if (input.displayName !== undefined) set.displayName = input.displayName;
    if (input.ownerIds !== undefined) set.ownerIds = await ownersFrom(input.ownerIds);
    const doc = await collections
      .mailAddresses()
      .findOneAndUpdate({ _id: id }, { $set: set }, { returnDocument: 'after' });
    if (!doc) throw HttpError.notFound('Address not found');
    await this.sync();
    return doc;
  },

  async removeAddress(id: ObjectId) {
    const result = await collections.mailAddresses().deleteOne({ _id: id });
    if (!result.deletedCount) throw HttpError.notFound('Address not found');
    await this.sync();
  },

  /** The shared addresses a mailbox can send as. */
  async addressesOf(accountId: ObjectId) {
    return collections
      .mailAddresses()
      .find({ ownerIds: accountId })
      .sort({ localPart: 1 })
      .toArray();
  },

  /* Pictures and passwords ------------------------------------------------------------------ */

  /** Sets or removes (null) a mailbox's profile picture. */
  async setAvatar(filter: { _id: ObjectId } | { address: string }, image: string | null) {
    const avatar = image ? decodeAvatar(image) : null;
    const result = await collections
      .mailAccounts()
      .updateOne(filter, { $set: { avatar, updatedAt: new Date() } });
    if (!result.matchedCount) throw HttpError.notFound('Email account not found');
  },

  async avatar(filter: { _id: ObjectId } | { address: string }) {
    const doc = await collections.mailAccounts().findOne(filter, { projection: { avatar: 1 } });
    if (!doc?.avatar) throw HttpError.notFound('No picture');
    return doc.avatar;
  },
};
