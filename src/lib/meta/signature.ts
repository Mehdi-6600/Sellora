// Meta webhook signature verification (X-Hub-Signature-256).
// Supports multiple app secrets separated by commas in META_APP_SECRETS so a
// single deployment can receive webhooks from multiple apps (rare but useful).
import crypto from "node:crypto";
import { META_APP_SECRET } from "./config";

function configuredSecrets(): string[] {
  const envList = process.env.META_APP_SECRETS || "";
  const extra = envList
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const all = [META_APP_SECRET, ...extra].filter(Boolean);
  return Array.from(new Set(all));
}

export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  if (!signatureHeader.startsWith("sha256=")) return false;
  const provided = signatureHeader.slice("sha256=".length);
  const secrets = configuredSecrets();
  if (secrets.length === 0) {
    // Dev fallback: if no secret configured, accept (with warning).
    // In production this should NEVER happen.
    console.warn("[meta] No app secret configured; accepting webhook without verification");
    return true;
  }
  for (const secret of secrets) {
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    // timing-safe equal
    if (provided.length === expected.length && crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) {
      return true;
    }
  }
  return false;
}
