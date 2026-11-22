import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ObjectId } from 'mongodb';
import type {
  CreateMailAccountInput,
  MailAccountDto,
  MailAccountsDto,
  UpdateMailAccountInput,
} from '@muvance/shared';
import { env } from '@/config/env';
import { collections, isDuplicateKeyError } from '@/db/client';
import type { MailAccountDoc, UserDoc } from '@/db/types';
import { logger } from '@/lib/logger';
import { sha512Crypt, verifySha512Crypt } from '@/lib/sha512-crypt';
import { HttpError } from '@/utils/http-error';

/** Addresses every mail domain should have; they go to the first mailbox unless taken. */
const ROLE_ADDRESSES = ['postmaster', 'abuse', 'dmarc'];

export function toMailAccountDto(doc: MailAccountDoc): MailAccountDto {
  return {
    id: doc._id.toHexString(),
    address: doc.address,
    localPart: doc.localPart,
    name: doc.name,
    quotaGb: doc.quotaGb,
    aliases: doc.aliases.map((a) => `${a}@${env.MAIL_DOMAIN}`),
    createdAt: doc.createdAt.toISOString(),
    createdByName: doc.createdByName,
  };
}

async function writeAtomically(file: string, content: string, mode = 0o600) {
  const full = path.join(env.MAIL_CONFIG_DIR, file);
  const temp = `${full}.${process.pid}.tmp`;
  await writeFile(temp, content, { mode });
  await rename(temp, full);
}

/** Every address in use (mailboxes and aliases), to keep them unique. */
async function takenAddresses(exceptId?: ObjectId) {
  const docs = await collections
    .mailAccounts()
    .find(exceptId ? { _id: { $ne: exceptId } } : {})
    .project<{ localPart: string; aliases: string[] }>({ localPart: 1, aliases: 1 })
    .toArray();
  return new Set(docs.flatMap((d) => [d.localPart, ...d.aliases]));
}

function assertFree(names: string[], taken: Set<string>) {
  const seen = new Set<string>();
  for (const name of names) {
    if (taken.has(name) || seen.has(name)) {
      throw HttpError.conflict(`${name}@${env.MAIL_DOMAIN} is already in use.`);
    }
    seen.add(name);
  }
}

export const mailService = {
  /**
   * Writes the mail server's accounts, aliases and quotas files from the database. docker-mailserver
   * checks them every couple of seconds and applies changes on its own.
   */
  async sync() {
    const accounts = await collections.mailAccounts().find().sort({ createdAt: 1 }).toArray();
    const domain = env.MAIL_DOMAIN;
    const used = new Set(accounts.flatMap((a) => [a.localPart, ...a.aliases]));

    const accountLines = accounts.map((a) => `${a.address}|{SHA512-CRYPT}${a.passwordHash}`);
    const aliasLines = accounts.flatMap((a) =>
      a.aliases.map((alias) => `${alias}@${domain} ${a.address}`),
    );
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
    logger.info({ accounts: accounts.length }, 'Mail server accounts updated');
  },

  async list(): Promise<MailAccountsDto> {
    const accounts = await collections.mailAccounts().find().sort({ createdAt: 1 }).toArray();
    return {
      domain: env.MAIL_DOMAIN,
      webmailUrl: `https://${env.MAIL_HOST}`,
      clientSettings: {
        imapHost: env.MAIL_HOST,
        imapPort: 993,
        smtpHost: env.MAIL_HOST,
        smtpPort: 465,
      },
      accounts: accounts.map(toMailAccountDto),
    };
  },

  async create(input: CreateMailAccountInput, by: UserDoc) {
    assertFree([input.localPart, ...input.aliases], await takenAddresses());
    const now = new Date();
    const doc: MailAccountDoc = {
      _id: new ObjectId(),
      localPart: input.localPart,
      address: `${input.localPart}@${env.MAIL_DOMAIN}`,
      name: input.name,
      passwordHash: sha512Crypt(input.password),
      quotaGb: input.quotaGb,
      aliases: input.aliases,
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
    await this.sync();
    return doc;
  },

  async get(id: ObjectId) {
    const doc = await collections.mailAccounts().findOne({ _id: id });
    if (!doc) throw HttpError.notFound('Email account not found');
    return doc;
  },

  async update(id: ObjectId, input: UpdateMailAccountInput) {
    const doc = await this.get(id);
    if (input.aliases) {
      const taken = await takenAddresses(id);
      assertFree(input.aliases, new Set([...taken, doc.localPart]));
    }
    const set: Partial<MailAccountDoc> = { updatedAt: new Date() };
    if (input.name !== undefined) set.name = input.name;
    if (input.quotaGb !== undefined) set.quotaGb = input.quotaGb;
    if (input.aliases !== undefined) set.aliases = input.aliases;
    await collections.mailAccounts().updateOne({ _id: id }, { $set: set });
    await this.sync();
    return this.get(id);
  },

  async setPassword(id: ObjectId, password: string) {
    await this.get(id);
    await collections
      .mailAccounts()
      .updateOne(
        { _id: id },
        { $set: { passwordHash: sha512Crypt(password), updatedAt: new Date() } },
      );
    await this.sync();
  },

  /**
   * Removes the mailbox from the mail server: the address stops receiving and nobody can sign in.
   * The stored mail stays on the server's disk (only the mail server can delete it).
   */
  async remove(id: ObjectId) {
    await this.get(id);
    await collections.mailAccounts().deleteOne({ _id: id });
    await this.sync();
  },

  /** Webmail's "change password": the person proves the current one first. */
  async changeOwnPassword(address: string, current: string, next: string) {
    const doc = await collections.mailAccounts().findOne({ address: address.trim().toLowerCase() });
    if (!doc || !verifySha512Crypt(current, doc.passwordHash)) return false;
    await this.setPassword(doc._id, next);
    return true;
  },
};
