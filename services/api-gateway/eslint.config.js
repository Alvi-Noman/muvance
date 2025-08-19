import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharedPreset from '@muvance/config/eslint-preset';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ESLint configuration for api-gateway package.
 * - Extends shared preset
 * - Lints TS/JS files in this package
 * - Ignores compiled files and type declarations
 * - Uses this package's tsconfig.json for type-aware linting
 */
export default [
  ...sharedPreset,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: [
      '**/dist/**',
      '**/*.d.ts',
    ],
    languageOptions: {
      parserOptions: {
        project: path.resolve(__dirname, './tsconfig.json'),
        tsconfigRootDir: __dirname,
        ecmaVersion: 2021,
        sourceType: 'module',
      },
    },
  },
];
