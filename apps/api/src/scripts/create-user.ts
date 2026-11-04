/**
 * Creates an account that signs in with a username (and optionally an email), with a password
 * you choose. The password is read from stdin so it never lands in your shell history.
 *
 *   Local:      npm run create-user -w @muvance/api -- --username alvi --name "Alvi" --role owner
 *   Production: docker compose exec -T api node dist/create-user.js --username alvi --role owner
 *
 * Then type the password and press Enter (or pipe it in).
 */
import { ObjectId } from 'mongodb';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';
import { roles, usernameKey, usernameSchema, type Role } from '@muvance/shared';
import { env } from '@/config/env';
import { closeDb, collections, connectDb, isDuplicateKeyError } from '@/db/client';
import { hashPassword } from '@/lib/security';

const { values } = parseArgs({
  options: {
    username: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string', default: 'member' },
  },
});

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const username = usernameSchema.safeParse(values.username ?? '');
if (!username.success) {
  fail(
    'Usage: create-user --username alvi [--name "Alvi"] [--email you@example.com] [--role owner]\n' +
      `  ${username.error.issues[0]?.message}`,
  );
}
const role = values.role as Role;
if (!roles.includes(role)) fail(`--role must be one of: ${roles.join(', ')}`);
const email = values.email?.trim().toLowerCase() || null;
if (email && !/^\S+@\S+\.\S+$/.test(email)) fail('--email is not a valid email address');
if (env.MONGODB_URI === 'memory') {
  fail('Set MONGODB_URI to a real database first (the in-memory one is per-process).');
}

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: false });
if (process.stdin.isTTY) process.stdout.write('Password (min. 10 characters): ');
const password = (await rl.question('')).replace(/\r$/, '');
rl.close();
if (password.length < 10) fail('The password must be at least 10 characters.');

await connectDb();
try {
  const now = new Date();
  await collections.users().insertOne({
    _id: new ObjectId(),
    name: values.name?.trim() || username.data,
    email,
    username: username.data,
    usernameKey: usernameKey(username.data),
    passwordHash: await hashPassword(password),
    role,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  });
  console.log(`\nCreated ${role} "${username.data}". Sign in at ${env.ADMIN_URL}/login\n`);
} catch (error) {
  if (isDuplicateKeyError(error)) {
    console.error('That username or email already has an account.');
    process.exitCode = 1;
  } else {
    throw error;
  }
} finally {
  await closeDb();
}
