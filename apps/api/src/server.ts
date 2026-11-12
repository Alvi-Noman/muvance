import { createApp } from './app';
import { env } from './config/env';
import { closeDb, connectDb } from './db/client';
import { seedDevOwner } from './db/seed-dev';
import { logger } from './lib/logger';
import { recordingsService } from './modules/recordings/recordings.service';

async function main() {
  await connectDb();
  if (env.MONGODB_URI === 'memory') await seedDevOwner();
  const server = createApp().listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}`);
  });

  // Hourly housekeeping for session recordings (storage cap, abandoned visits).
  const cleanUp = () =>
    void recordingsService
      .cleanUp()
      .catch((error: unknown) => logger.warn({ err: error }, 'Recording clean-up failed'));
  setTimeout(cleanUp, 60_000).unref();
  setInterval(cleanUp, 60 * 60_000).unref();

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close(() => {
      void closeDb().finally(() => process.exit(0));
    });
    // Don't hang forever on open connections.
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  logger.fatal(error, 'API failed to start');
  process.exit(1);
});
