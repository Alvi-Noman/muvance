import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_ROUNDS);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

/**
 * A hash that always takes bcrypt time to compare against, so logins for unknown emails
 * take as long as real ones (no user enumeration via timing).
 */
export const DUMMY_PASSWORD_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_ROUNDS);

/** A URL-safe random token, e.g. for session cookies and invite links. */
export const randomToken = (bytes = 32) => randomBytes(bytes).toString('base64url');

/** Tokens are stored hashed, so a leaked database can't be used to log in. */
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
