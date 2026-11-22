import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * SHA512-CRYPT ("$6$...") password hashes, the scheme the mail server (Dovecot) reads from its
 * accounts file. Implements the published algorithm (Ulrich Drepper, "Unix crypt using SHA-256
 * and SHA-512"); checked against its test vectors in tests/sha512-crypt.test.ts.
 */

const ITOA64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const DEFAULT_ROUNDS = 5000;

function sha512(...parts: Buffer[]) {
  const hash = createHash('sha512');
  for (const part of parts) hash.update(part);
  return hash.digest();
}

/** `length` bytes made by repeating `digest`. */
function repeat(digest: Buffer, length: number) {
  const out = Buffer.alloc(length);
  for (let i = 0; i < length; i += 64) digest.copy(out, i, 0, Math.min(64, length - i));
  return out;
}

function encode24(b2: number, b1: number, b0: number, chars: number) {
  let w = (b2 << 16) | (b1 << 8) | b0;
  let out = '';
  for (let i = 0; i < chars; i++) {
    out += ITOA64[w & 0x3f];
    w >>= 6;
  }
  return out;
}

// The order the 64 digest bytes are written out in, three at a time.
const ORDER = [
  [0, 21, 42],
  [22, 43, 1],
  [44, 2, 23],
  [3, 24, 45],
  [25, 46, 4],
  [47, 5, 26],
  [6, 27, 48],
  [28, 49, 7],
  [50, 8, 29],
  [9, 30, 51],
  [31, 52, 10],
  [53, 11, 32],
  [12, 33, 54],
  [34, 55, 13],
  [56, 14, 35],
  [15, 36, 57],
  [37, 58, 16],
  [59, 17, 38],
  [18, 39, 60],
  [40, 61, 19],
  [62, 20, 41],
] as const;

function compute(password: string, salt: string, rounds: number) {
  const pw = Buffer.from(password, 'utf8');
  const s = Buffer.from(salt, 'utf8');

  const b = sha512(pw, s, pw);
  const a = createHash('sha512');
  a.update(pw);
  a.update(s);
  let n = pw.length;
  for (; n > 64; n -= 64) a.update(b);
  a.update(b.subarray(0, n));
  for (let i = pw.length; i > 0; i >>= 1) a.update(i & 1 ? b : pw);
  const aDigest = a.digest();

  const dp = createHash('sha512');
  for (let i = 0; i < pw.length; i++) dp.update(pw);
  const p = repeat(dp.digest(), pw.length);

  const ds = createHash('sha512');
  for (let i = 0; i < 16 + aDigest[0]!; i++) ds.update(s);
  const sBytes = repeat(ds.digest(), s.length);

  let c = aDigest;
  for (let i = 0; i < rounds; i++) {
    const h = createHash('sha512');
    h.update(i & 1 ? p : c);
    if (i % 3) h.update(sBytes);
    if (i % 7) h.update(p);
    h.update(i & 1 ? c : p);
    c = h.digest();
  }

  let out = '';
  for (const [x, y, z] of ORDER) out += encode24(c[x]!, c[y]!, c[z]!, 4);
  out += encode24(0, 0, c[63]!, 2);
  return out;
}

function randomSalt() {
  const bytes = randomBytes(16);
  return Array.from(bytes, (byte) => ITOA64[byte & 0x3f]).join('');
}

/** Hashes a password as `$6$<salt>$<hash>` (or `$6$rounds=N$...` for non-default rounds). */
export function sha512Crypt(password: string, salt = randomSalt(), rounds = DEFAULT_ROUNDS) {
  const cleanSalt = salt.slice(0, 16);
  const r = Math.min(999_999_999, Math.max(1000, rounds));
  const prefix = r === DEFAULT_ROUNDS ? '$6$' : `$6$rounds=${r}$`;
  return `${prefix}${cleanSalt}$${compute(password, cleanSalt, r)}`;
}

/** True if `password` matches a `$6$...` hash. */
export function verifySha512Crypt(password: string, hash: string) {
  const match = /^\$6\$(?:rounds=(\d+)\$)?([^$]{0,16})\$([./0-9A-Za-z]{86})$/.exec(hash);
  if (!match) return false;
  const rounds = match[1] ? Number(match[1]) : DEFAULT_ROUNDS;
  const expected = Buffer.from(sha512Crypt(password, match[2], rounds));
  const actual = Buffer.from(hash);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
