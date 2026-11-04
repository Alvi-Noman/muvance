import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    env: { NODE_ENV: 'test', LOG_LEVEL: 'silent', ADMIN_URL: 'http://admin.test' },
    // Starts one MongoDB for the run (or uses TEST_MONGODB_URI, e.g. a CI service container).
    globalSetup: ['./tests/setup/global.ts'],
    // Points each test file at its own empty database.
    setupFiles: ['./tests/setup/database.ts'],
    testTimeout: 20_000,
    hookTimeout: 120_000,
  },
});
