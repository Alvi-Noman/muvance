import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    server: 'src/server.ts',
    'create-owner': 'src/scripts/create-owner.ts',
    'create-user': 'src/scripts/create-user.ts',
  },
  format: ['esm'],
  target: 'node22',
  clean: true,
  sourcemap: true,
  // Workspace packages ship TypeScript source, so bundle them into the output.
  noExternal: [/^@muvance\//],
  // Development-only (in-memory database); never loaded in production.
  external: ['mongodb-memory-server'],
});
