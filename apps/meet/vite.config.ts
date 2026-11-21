/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5175,
    proxy: {
      '/api': 'http://localhost:4000',
      // LiveKit's signalling (a WebSocket). In production Caddy routes /rtc the same way.
      '/rtc': { target: 'http://localhost:7880', ws: true },
    },
  },
  test: {
    environment: 'jsdom',
  },
});
