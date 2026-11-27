import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      ADMIN_URL: 'http://admin.test',
      CHAT_FILES_DIR: fileURLToPath(
        new URL('./node_modules/.cache/test-chat-files', import.meta.url),
      ),
      // Where the mail tests write the mail server's account files.
      MAIL_CONFIG_DIR: fileURLToPath(
        new URL('./node_modules/.cache/test-mail-config', import.meta.url),
      ),
    },
    // Starts one MongoDB for the run (or uses TEST_MONGODB_URI, e.g. a CI service container).
    globalSetup: ['./tests/setup/global.ts'],
    // Points each test file at its own empty database.
    setupFiles: ['./tests/setup/database.ts'],
    testTimeout: 20_000,
    hookTimeout: 120_000,
  },
});
