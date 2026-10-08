// Encrypt/decrypt sensitive columns (e.g. Instagram access tokens) at rest.
// Uses AES-256-GCM via the WebCrypto-compatible Node `crypto` module.
// Set DATA_ENCRYPTION_KEY in env to a 32-byte base64url key. If unset, fall back
// to NEXTAUTH_SECRET-derived key (acceptable for dev, production MUST set it).
import crypto from "node:crypto";

/**
 * Derive the AES-256 key used for at-rest encryption (Instagram tokens).
 *
 * SECURITY (fail closed): production MUST set DATA_ENCRYPTION_KEY. Falling back
 * to a hardcoded key in production would mean tokens are encrypted with a value
 * that is public in the source repository. In development we fall back to
 * NEXTAUTH_SECRET (documented as dev-only).
 */
function getKey(): Buffer {
  const configured = process.env.DATA_ENCRYPTION_KEY;
  if (configured) {
    return crypto.createHash("sha256").update(configured).digest();
  }
  // Dev / misconfigured-production fallback. The final hardcoded literal is
  // NEVER used in production: encrypting tokens with a key that is public in
  // the repository is equivalent to storing them in plaintext.
  const raw = process.env.NEXTAUTH_SECRET;
  if (raw) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[crypto] DATA_ENCRYPTION_KEY is not set — deriving the encryption key from NEXTAUTH_SECRET. Set DATA_ENCRYPTION_KEY in the deployment environment."
      );
    }
    return crypto.createHash("sha256").update(raw).digest();
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Neither DATA_ENCRYPTION_KEY nor NEXTAUTH_SECRET is configured. Refusing to encrypt with a built-in dev key."
    );
  }
  return crypto.createHash("sha256").update("sellora-dev-key-not-for-production-change-me").digest();
}

export function encrypt(plaintext: string): string {
  if (!plaintext) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: v1.<iv>.<tag>.<ciphertext> (base64url)
  const parts = [iv, tag, enc].map((b) => b.toString("base64url"));
  return `v1.${parts.join(".")}`;
}

export function decrypt(ciphertext: string | null | undefined): string {
  if (!ciphertext) return "";
  if (!ciphertext.startsWith("v1.")) {
    // Legacy plaintext fallback (tokens written before encryption was added).
    // In production we would refuse this, but for seamless migration we return as-is.
    return ciphertext;
  }
  const [, ivB64, tagB64, ctB64] = ciphertext.split(".");
  const iv = Buffer.from(ivB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");
  const ct = Buffer.from(ctB64, "base64url");
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}
