/**
 * Creates a one-time sign-up link for an Owner account (use it to create the first admin).
 *
 *   Local:      npm run create-owner -w @muvance/api -- --email you@example.com
 *   Production: docker compose exec api node dist/create-owner.js --email you@example.com
 */
import { ObjectId } from 'mongodb';
import { parseArgs } from 'node:util';
import { env } from '@/config/env';
import { closeDb, collections, connectDb } from '@/db/client';
import { hashToken, randomToken } from '@/lib/security';

const { values } = parseArgs({ options: { email: { type: 'string' } } });
const email = values.email?.trim().toLowerCase();

if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
  console.error('Usage: create-owner --email you@example.com');
  process.exit(1);
}
if (env.MONGODB_URI === 'memory') {
  console.error('Set MONGODB_URI to a real database first (the in-memory one is per-process).');
  process.exit(1);
}

await connectDb();
try {
  if (await collections.users().findOne({ email })) {
    console.error(`${email} already has an account. Sign in, or reset the password from Team.`);
    process.exitCode = 1;
  } else {
    const token = randomToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60_000);
    await collections.invites().deleteMany({ email, type: 'invite' });
    await collections.invites().insertOne({
      _id: new ObjectId(),
      tokenHash: hashToken(token),
      type: 'invite',
      email,
      role: 'owner',
      userId: null,
      invitedBy: null,
      createdAt: new Date(),
      expiresAt,
    });
    const url = new URL('/accept-invite', env.ADMIN_URL);
    url.searchParams.set('token', token);
    console.log(`\nOwner sign-up link for ${email} (valid 7 days, single use):\n\n  ${url}\n`);
  }
} finally {
  await closeDb();
}
