import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { buildOAuthLoginUrl } from "@/lib/meta/client";
import { META_APP_ID, META_REDIRECT_URI, APP_URL } from "@/lib/meta/config";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    if (!META_APP_ID) {
      return NextResponse.json({ error: "meta_app_not_configured" }, { status: 503 });
    }
    const auth = await requireAuth();
    const state = crypto.randomBytes(16).toString("hex");
    // Prefer META_REDIRECT_URI (must match Meta App Dashboard whitelist); fall
    // back to APP_URL, then to current request origin.
    const callbackUrl =
      META_REDIRECT_URI ||
      (APP_URL ? new URL("/api/instagram/callback", APP_URL).toString() : new URL("/api/instagram/callback", req.url).toString());
    const url = buildOAuthLoginUrl(callbackUrl, state);
    const res = NextResponse.redirect(url);
    res.cookies.set("sellora_oauth_state", `${auth.businessId}:${state}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });
    return res;
  } catch (e) {
    if (e instanceof Response) return e;
    console.error("[instagram/connect]", e);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
