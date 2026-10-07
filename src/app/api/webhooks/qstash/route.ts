// QStash webhook consumer — processes background jobs.
// When QSTASH_TOKEN is configured, messages published via lib/queue arrive here.

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { processJob } from "@/lib/queue";

// Verify QStash signature when signing keys are configured.
// QStash signs the concatenation of (url + "\n" + body) with HMAC-SHA256 and
// places a versioned signature in the `upstash-signature` header. We support
// current + next signing keys for zero-downtime rotation.
function verifyQstashSignature(req: NextRequest, rawBody: string): boolean {
  const current = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const next = process.env.QSTASH_NEXT_SIGNING_KEY;
  // SECURITY (fail closed): when no signing keys are configured, QStash is not
  // in use at all (jobs run inline), so this public endpoint must refuse every
  // request. Previously it accepted everything, which exposed an
  // unauthenticated way to execute `send.message` jobs for arbitrary tenants.
  if (!current && !next) return false;
  const sigHeader = req.headers.get("upstash-signature");
  if (!sigHeader) return false;
  // Strip "v1=" prefix if present.
  const provided = sigHeader.replace(/^v[0-9]+=/, "");
  const signingInput = `${req.url}\n${rawBody}`;
  for (const key of [current, next].filter(Boolean) as string[]) {
    const expected = crypto.createHmac("sha256", key).update(signingInput).digest("base64");
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true;
  }
  return false;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  if (!verifyQstashSignature(req, rawBody)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }
  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const { job, payload } = body;
  if (!job || !payload) return NextResponse.json({ error: "bad_payload" }, { status: 400 });

  try {
    await processJob(job as any, payload as any);
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Never echo internal job errors to the caller; QStash only needs non-2xx.
    console.error("[qstash] job failed:", err);
    return NextResponse.json({ error: "job_failed" }, { status: 500 });
  }
}
