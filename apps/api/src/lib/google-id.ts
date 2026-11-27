import { createPublicKey, createVerify } from 'node:crypto';
import type { webcrypto } from 'node:crypto';

type JsonWebKey = webcrypto.JsonWebKey;

/**
 * "Sign in with Google": checks the ID token Google's button gives the page (an RS256 JWT signed by
 * Google), so we know which email address the person signed in with.
 * https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
 */

const CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);

let keys: { byId: Map<string, JsonWebKey>; expiresAt: number } | null = null;

async function googleKey(kid: string) {
  if (!keys || keys.expiresAt < Date.now() || !keys.byId.has(kid)) {
    const res = await fetch(CERTS_URL, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`Google keys: HTTP ${res.status}`);
    const body = (await res.json()) as { keys: (JsonWebKey & { kid: string })[] };
    const maxAge = Number(
      /max-age=(\d+)/.exec(res.headers.get('cache-control') ?? '')?.[1] ?? 3600,
    );
    keys = {
      byId: new Map(body.keys.map((k) => [k.kid, k])),
      expiresAt: Date.now() + Math.min(maxAge, 86_400) * 1000,
    };
  }
  return keys.byId.get(kid) ?? null;
}

const decode = (part: string) => JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));

export interface GoogleIdentity {
  email: string;
  name: string | null;
}

export const googleId = {
  /** The verified email (and name) in the token, or null when it isn't a valid token for us. */
  async verify(token: string, clientId: string): Promise<GoogleIdentity | null> {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [h, p, sig] = parts as [string, string, string];
    let header: { alg?: string; kid?: string };
    let payload: {
      iss?: string;
      aud?: string;
      exp?: number;
      email?: string;
      email_verified?: boolean | string;
      name?: string;
    };
    try {
      header = decode(h);
      payload = decode(p);
    } catch {
      return null;
    }
    if (header.alg !== 'RS256' || !header.kid) return null;
    const jwk = await googleKey(header.kid);
    if (!jwk) return null;
    const ok = createVerify('RSA-SHA256')
      .update(`${h}.${p}`)
      .verify(createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(sig, 'base64url'));
    if (!ok) return null;
    if (!ISSUERS.has(payload.iss ?? '') || payload.aud !== clientId) return null;
    if (!payload.exp || payload.exp * 1000 < Date.now()) return null;
    const verified = payload.email_verified === true || payload.email_verified === 'true';
    if (!payload.email || !verified) return null;
    return { email: payload.email.toLowerCase(), name: payload.name?.trim() || null };
  },
};
