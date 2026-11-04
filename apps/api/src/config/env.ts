import { z } from 'zod';

try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on variables provided by the environment.
}

const bool = z.enum(['true', 'false', '1', '0']).transform((v) => v === 'true' || v === '1');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  /** Comma-separated browser origins allowed to call the API (only needed when not same-origin). */
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:5174'),

  /** MongoDB connection string. "memory" starts a throwaway in-memory server (development only). */
  MONGODB_URI: z.string().min(1).default('memory'),
  MONGODB_DB: z.string().min(1).default('muvance'),

  /** Public URL of the admin app, used to build invite and password-reset links. */
  ADMIN_URL: z.url().default('http://localhost:5174'),

  /** Send the session cookie over HTTPS only. Must be true in production. */
  COOKIE_SECURE: bool.optional(),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(14),

  /**
   * How many reverse proxies sit in front of the API, so real client IPs are detected (rate limits
   * depend on it). "true" means 1. Production is 2: the server's main Caddy, then Muvance's own.
   */
  TRUST_PROXY: z
    .string()
    .default('false')
    .transform((v) => (v === 'true' ? 1 : v === 'false' ? 0 : Number(v)))
    .pipe(z.number().int().min(0).max(5)),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', z.treeifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
export const cookieSecure = env.COOKIE_SECURE ?? isProduction;

if (isProduction && env.MONGODB_URI === 'memory') {
  console.error('MONGODB_URI must point at a real database in production.');
  process.exit(1);
}
