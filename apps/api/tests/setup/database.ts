import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, inject } from 'vitest';

// Must run before the app's env module is imported (setup files run before test files).
process.env.MONGODB_URI = inject('mongoUri');
process.env.MONGODB_DB = `muvance_test_${randomUUID().slice(0, 8)}`;

beforeAll(async () => {
  const { connectDb } = await import('@/db/client');
  await connectDb();
});

afterAll(async () => {
  const { closeDb, getDb } = await import('@/db/client');
  await getDb().dropDatabase();
  await closeDb();
});
