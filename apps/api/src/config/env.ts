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

  /** Public URL of the meetings app (meet.muvance.com), used to build meeting links. */
  MEET_URL: z.url().default('http://localhost:5175'),
  /**
   * LiveKit, the media server behind meetings. LIVEKIT_URL is how the API reaches it (inside the
   * Docker network in production); browsers reach it through the meetings site at /rtc. The
   * defaults match the local LiveKit in docker-compose.yml. Production uses its own key and secret
   * (deploy.sh creates them on the server).
   */
  LIVEKIT_URL: z.url().default('http://localhost:7880'),
  LIVEKIT_API_KEY: z.string().min(1).default('devkey'),
  LIVEKIT_API_SECRET: z.string().min(32).default('muvance-local-livekit-secret-0123456789'),

  /**
   * Call recordings. LiveKit Egress writes MP4s to EGRESS_OUTPUT_DIR inside its container; the
   * same folder is mounted into the API at CALL_RECORDINGS_DIR, so it can play and delete them.
   */
  CALL_RECORDINGS_DIR: z.string().min(1).default('./call-recordings'),
  EGRESS_OUTPUT_DIR: z.string().min(1).default('/out'),
  /** Recordings older than this are deleted automatically. */
  CALL_RECORDINGS_RETENTION_DAYS: z.coerce.number().int().min(1).max(3650).default(180),
  /** Don't start a recording when the disk has less free space than this. */
  CALL_RECORDINGS_MIN_FREE_GB: z.coerce.number().min(0).default(5),
  /**
   * Stop recording after this many minutes in which the call is inactive: fewer than two people in
   * it, or nobody's microphone on. (The recorder itself also stops at 3 hours; see deploy.sh.)
   */
  CALL_RECORDINGS_IDLE_MINUTES: z.coerce.number().int().min(1).max(600).default(10),

  /**
   * Team email (docker-mailserver). The API writes its accounts, aliases and quotas files into
   * MAIL_CONFIG_DIR (the mail server's config folder); it notices changes within seconds.
   */
  MAIL_DOMAIN: z.string().min(3).default('muvance.com'),
  MAIL_HOST: z.string().min(3).default('mail.muvance.com'),
  MAIL_CONFIG_DIR: z.string().min(1).default('./mail-config'),
  /**
   * Muvance Mail (the webmail): encrypts each signed-in person's mail password in their session,
   * so the API can read and send their mail. deploy.sh creates it on the server.
   */
  WEBMAIL_SECRET: z.string().min(32).default('development-only-webmail-secret-0123456789'),
  WEBMAIL_SESSION_DAYS: z.coerce.number().int().min(1).max(90).default(30),

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

// Without them meetings don't work, but the website and bookings must keep running, so only warn.
if (isProduction && (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET)) {
  console.warn('LIVEKIT_API_KEY and LIVEKIT_API_SECRET are not set: meetings will not work.');
}

if (isProduction && env.MONGODB_URI === 'memory') {
  console.error('MONGODB_URI must point at a real database in production.');
  process.exit(1);
}
