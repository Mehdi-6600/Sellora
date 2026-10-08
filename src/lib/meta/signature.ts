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
    // SECURITY (fail closed): with no app secret configured we cannot verify
    // anything, so we must reject. Accepting unsigned webhooks would let anyone
    // inject conversations, messages and lead scores into any connected tenant.
    console.warn("[meta] Rejecting webhook: no META_APP_SECRET configured.");
    return false;
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
