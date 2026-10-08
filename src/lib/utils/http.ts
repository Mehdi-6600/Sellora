// Small request-body helpers for API routes.

export type JsonBodyResult =
  | { ok: true; json: unknown }
  | { ok: false; status: 400 | 413; error: "invalid_json" | "payload_too_large" };

/**
 * Read and parse a JSON request body with a hard size limit.
 *
 * Why not `req.json()`: App Router route handlers have no built-in body cap,
 * so `req.json()` will happily buffer an arbitrarily large payload into a
 * serverless function's memory. This streams the body and aborts as soon as
 * the budget is exceeded (413), and reports malformed JSON as 400.
 */
export async function readJsonBody(req: Request, maxBytes = 100_000): Promise<JsonBodyResult> {
  const declared = req.headers.get("content-length");
  if (declared && Number(declared) > maxBytes) {
    return { ok: false, status: 413, error: "payload_too_large" };
  }

  const reader = req.body?.getReader();
  if (!reader) return { ok: false, status: 400, error: "invalid_json" };

  const chunks: Buffer[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        size += value.byteLength;
        if (size > maxBytes) {
          await reader.cancel().catch(() => {});
          return { ok: false, status: 413, error: "payload_too_large" };
        }
        chunks.push(Buffer.from(value));
      }
    }
  } catch {
    return { ok: false, status: 400, error: "invalid_json" };
  }

  const text = Buffer.concat(chunks).toString("utf8");
  if (!text.trim()) return { ok: false, status: 400, error: "invalid_json" };
  try {
    return { ok: true, json: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400, error: "invalid_json" };
  }
}
