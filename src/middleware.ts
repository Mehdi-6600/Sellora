// Edge middleware: lightweight auth guard for protected app routes + sets
// request-id header for observability. This does not replace server-side
// authorization in individual route handlers / server components.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/api/auth",
  "/api/webhooks/meta",
  "/api/webhooks/qstash",
  "/api/health",
  "/_next",
  "/favicon",
];

const PROTECTED_PREFIXES = ["/dashboard", "/conversations", "/leads", "/products", "/settings", "/onboarding", "/notifications", "/admin", "/api/business", "/api/products", "/api/rules", "/api/conversations", "/api/leads", "/api/subscription", "/api/instagram/connect", "/api/instagram/callback", "/api/instagram/disconnect", "/api/instagram/status"];

function hasSession(req: NextRequest): boolean {
  return !!req.cookies.get("sellora_session")?.value;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requestId = crypto.randomUUID();
  const res = NextResponse.next();
  res.headers.set("x-request-id", requestId);

  // Allow public paths always
  for (const p of PUBLIC_PATHS) {
    if (pathname === p || pathname.startsWith(p + "/")) {
      return res;
    }
  }

  // API routes other than explicit public ones require valid session or signature.
  if (pathname.startsWith("/api/")) {
    // Tenant-scoped API routes — require cookie (webhooks handled above).
    if (!hasSession(req)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: { "x-request-id": requestId } });
    }
    return res;
  }

  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (needsAuth && !hasSession(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // "/" is handled by the root page itself: authenticated visitors are
  // redirected to /dashboard there, anonymous visitors get the public landing
  // page (which must stay crawlable).
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
