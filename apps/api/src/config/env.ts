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
  /** Firebase service account JSON, base64 encoded. Without it, push notifications are off. */
  FIREBASE_SERVICE_ACCOUNT: z.string().optional(),

  /** Public website URL, reported to Meta as the page an event happened on when none is known. */
  SITE_URL: z.url().default('http://localhost:5173'),

  /** Meta Pixel + Conversions API. Without both, server-side Meta events are off. */
  META_PIXEL_ID: z.string().regex(/^\d+$/).optional(),
  META_CAPI_TOKEN: z.string().min(1).optional(),
  /** From Events Manager > Test events, to see server events there while testing. Remove after. */
  META_TEST_EVENT_CODE: z.string().min(1).optional(),
  META_GRAPH_VERSION: z
    .string()
    .regex(/^v\d+\.\d+$/)
    .default('v24.0'),

  /** Session recordings: days to keep visits that didn't become a lead, and leads' visits. */
  RECORDING_RETENTION_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  RECORDING_LEAD_RETENTION_DAYS: z.coerce.number().int().min(1).max(1825).default(365),
  /** Storage cap for recordings that didn't become a lead; the oldest are deleted first. */
  RECORDINGS_MAX_MB: z.coerce.number().int().min(10).max(100_000).default(300),

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
