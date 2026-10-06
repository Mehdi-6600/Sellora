import { NextRequest } from "next/server";

// Tenant-aware in-memory token bucket rate limiter.
// Works for a single instance. For horizontally-scaled production, replace
// the store with Redis/Upstash. The boundary is clean — only this module knows.

type Bucket = { tokens: number; refilledAt: number };
const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;

function key(prefix: string, id: string) {
  return `${prefix}:${id}`;
}

export function rateLimit(
  prefix: string,
  id: string,
  { max, windowMs = WINDOW_MS }: { max: number; windowMs?: number }
): { ok: boolean; remaining: number; resetMs: number } {
  const k = key(prefix, id);
  const now = Date.now();
  const b = buckets.get(k) ?? { tokens: max, refilledAt: now };

  // Refill at the end of each window (simple fixed window).
  if (now - b.refilledAt > windowMs) {
    b.tokens = max;
    b.refilledAt = now;
  }

  if (b.tokens <= 0) {
    buckets.set(k, b);
    return { ok: false, remaining: 0, resetMs: windowMs - (now - b.refilledAt) };
  }

  b.tokens -= 1;
  buckets.set(k, b);
  return { ok: true, remaining: b.tokens, resetMs: windowMs - (now - b.refilledAt) };
}

export function clientId(req: NextRequest): string {
  // Prefer x-forwarded-for; fall back to cf-connecting-ip; then direct ip.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf;
  return req.ip ?? "unknown";
}
