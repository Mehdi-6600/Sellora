// Cookie-based session auth using signed JWTs via `jose`.
// We deliberately avoid a heavy dependency (NextAuth/Auth.js) to keep Sellora's
// auth simple, server-first and easy to audit.
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";

const COOKIE_NAME = "sellora_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecretKey(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET || "sellora-dev-secret-change-me-please";
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  uid: string; // user id
  bid: string; // active business id
  role: string;
};

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("sellora")
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .sign(getSecretKey());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function destroySession() {
  cookies().delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const c = cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: "sellora",
    });
    if (!payload.uid || !payload.bid) return null;
    return { uid: String(payload.uid), bid: String(payload.bid), role: String(payload.role ?? "OWNER") };
  } catch {
    return null;
  }
}

/**
 * Require an authenticated user AND verify membership in the active business.
 * Returns enriched context including the user & business. Throws Response (401/403).
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }
  const membership = await prisma.businessMember.findUnique({
    where: { businessId_userId: { businessId: session.bid, userId: session.uid } },
    include: {
      user: true,
      business: true,
    },
  });
  if (!membership) {
    // User exists but is no longer a member of active business. Pick another.
    const fallback = await prisma.businessMember.findFirst({
      where: { userId: session.uid },
      include: { business: true, user: true },
      orderBy: { createdAt: "asc" },
    });
    if (!fallback) {
      throw new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
    }
    // Refresh cookie
    await createSession({ uid: fallback.userId, bid: fallback.businessId, role: fallback.role });
    return {
      user: fallback.user,
      business: fallback.business,
      role: fallback.role,
      businessId: fallback.businessId,
      userId: fallback.userId,
    };
  }
  return {
    user: membership.user,
    business: membership.business,
    role: membership.role,
    businessId: membership.businessId,
    userId: membership.userId,
  };
}

/**
 * Enforce that an arbitrary businessId matches the authenticated tenant.
 * Use for every tenant-scoped operation.
 */
export async function assertTenant(businessId: string) {
  const auth = await requireAuth();
  if (auth.businessId !== businessId) {
    throw new Response(JSON.stringify({ error: "tenant_mismatch" }), { status: 403 });
  }
  return auth;
}
