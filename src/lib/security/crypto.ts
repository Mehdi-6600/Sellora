// Encrypt/decrypt sensitive columns (e.g. Instagram access tokens) at rest.
// Uses AES-256-GCM via the WebCrypto-compatible Node `crypto` module.
// Set DATA_ENCRYPTION_KEY in env to a 32-byte base64url key. If unset, fall back
// to NEXTAUTH_SECRET-derived key (acceptable for dev, production MUST set it).
import crypto from "node:crypto";

function getKey(): Buffer {
  const raw =
    process.env.DATA_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || "sellora-dev-key-not-for-production-change-me";
  // Derive a fixed-length key via scrypt-style HKDF. Use SHA-256 for simplicity & speed.
  return crypto.createHash("sha256").update(raw).digest();
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
