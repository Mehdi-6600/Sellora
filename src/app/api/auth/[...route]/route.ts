import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/session";
import { loginSchema, signupSchema } from "@/lib/validation/schemas";
import { clientId, rateLimit } from "@/lib/security/rate-limit";
import { uniqueSlug } from "@/lib/utils/slug";
import { encrypt } from "@/lib/security/crypto";

export const runtime = "nodejs";

async function handleLogin(req: NextRequest) {
  const cid = clientId(req);
  const rl = rateLimit("auth:login", cid, { max: 10, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json({ error: { code: "rate_limited", message: "too many attempts" } }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "invalid_input", message: "invalidCredentials" } }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) {
    return NextResponse.json({ error: { code: "invalid_credentials", message: "invalidCredentials" } }, { status: 401 });
  }
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: { code: "invalid_credentials", message: "invalidCredentials" } }, { status: 401 });
  }
  // Pick earliest (first) business membership as active.
  const membership = await prisma.businessMember.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  if (!membership) {
    // Shouldn't happen, but handle gracefully.
    return NextResponse.json({ error: { code: "no_business", message: "no_business" } }, { status: 403 });
  }
  await createSession({ uid: user.id, bid: membership.businessId, role: membership.role });
  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
}

async function handleSignup(req: NextRequest) {
  const cid = clientId(req);
  const rl = rateLimit("auth:signup", cid, { max: 5, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json({ error: { code: "rate_limited" } }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { code: "invalid_input" } }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: { code: "email_taken", message: "emailTaken" } }, { status: 409 });
  }
  const passwordHash = await hashPassword(parsed.data.password);

  const slug = parsed.data.slug || uniqueSlug(parsed.data.businessName);

  const result = await prisma.$transaction(async (tx: any) => {
    const user = await tx.user.create({
      data: { email, name: parsed.data.name, passwordHash },
    });
    const business = await tx.business.create({
      data: {
        name: parsed.data.businessName,
        slug,
        locale: "fa",
        currency: "IRR",
      },
    });
    await tx.businessMember.create({
      data: { userId: user.id, businessId: business.id, role: "OWNER" },
    });
    await tx.automationConfig.create({
      data: { businessId: business.id, enabled: false },
    });
    await tx.businessRuleset.create({
      data: { businessId: business.id, version: 1, isActive: true },
    });
    await tx.instagramAccount.create({
      data: {
        businessId: business.id,
        instagramBusinessAccountId: `pending_${business.id}`,
        accessToken: encrypt(""),
        status: "DISCONNECTED",
      },
    });
    return { user, business };
  });

  await createSession({ uid: result.user.id, bid: result.business.id, role: "OWNER" });
  return NextResponse.json({ ok: true });
}

async function handleLogout(req: NextRequest) {
  await destroySession();
  // If the request came from an HTML form (Accept: text/html), redirect to /login.
  // Otherwise return JSON (for API callers).
  const accept = req.headers.get("accept") || "";
  if (accept.includes("text/html")) {
    return NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params;
  const action = route[0];
  try {
    switch (action) {
      case "login":
        return await handleLogin(req);
      case "signup":
        return await handleSignup(req);
      case "logout":
        return await handleLogout(req);
      default:
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
  } catch (err) {
    console.error("[auth]", err);
    return NextResponse.json({ error: { code: "internal" } }, { status: 500 });
  }
}
