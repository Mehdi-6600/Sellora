import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { encrypt } from "@/lib/security/crypto";
import {
  exchangeShortTokenForLongLived,
  listPagesForUser,
  verifyToken,
} from "@/lib/meta/client";
import { META_APP_ID, META_API_VERSION, META_REDIRECT_URI, APP_URL } from "@/lib/meta/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * OAuth callback from Meta.
 * Flow for Instagram Business accounts via a Facebook Page:
 *   1. Exchange short-lived token for long-lived token
 *   2. List the user's Facebook Pages
 *   3. For each, check if an instagram_business_account is linked
 *   4. Persist the first linked Instagram business account (MVP)
 */
export async function GET(req: NextRequest) {
  try {
    if (!META_APP_ID) {
      return NextResponse.redirect(new URL("/settings/instagram?error=meta_not_configured", req.url));
    }
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorReason = searchParams.get("error_reason") || searchParams.get("error");
    const cookie = req.cookies.get("sellora_oauth_state")?.value;

    if (errorReason || !code) {
      return NextResponse.redirect(new URL(`/settings/instagram?error=${encodeURIComponent(errorReason || "no_code")}`, req.url));
    }
    if (!cookie || !state) {
      return NextResponse.redirect(new URL("/settings/instagram?error=state_missing", req.url));
    }
    const [businessId, expectedState] = cookie.split(":");
    if (!businessId || expectedState !== state) {
      return NextResponse.redirect(new URL("/settings/instagram?error=state_mismatch", req.url));
    }
    // Authenticate the returning user: they must be a member of the businessId
    // claimed in the state cookie (defence-in-depth against cookie tampering / CSRF).
    const session = await (await import("@/lib/auth/session")).getSession();
    if (!session) {
      return NextResponse.redirect(new URL(`/login?next=/settings/instagram`, req.url));
    }
    const membership = await prisma.businessMember.findUnique({
      where: { businessId_userId: { businessId, userId: session.uid } },
    });
    if (!membership) {
      return NextResponse.redirect(new URL("/settings/instagram?error=forbidden", req.url));
    }

    // Exchange code for short-lived token at Meta's token endpoint (versioned via META_API_VERSION).
    // redirect_uri MUST match the URI used at the /connect step (and the whitelist).
    const redirectUri =
      META_REDIRECT_URI ||
      (APP_URL ? new URL("/api/instagram/callback", APP_URL).toString() : new URL("/api/instagram/callback", req.url).toString());
    const tokenUrl = new URL(`https://graph.facebook.com/${META_API_VERSION}/oauth/access_token`);
    tokenUrl.searchParams.set("client_id", META_APP_ID);
    tokenUrl.searchParams.set("client_secret", process.env.META_APP_SECRET || "");
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);
    const tokenRes = await fetch(tokenUrl.toString(), { cache: "no-store" });
    const tokenJson = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokenJson.access_token) {
      console.error("[meta] token exchange failed", tokenJson);
      return NextResponse.redirect(new URL("/settings/instagram?error=token_exchange", req.url));
    }
    const long = await exchangeShortTokenForLongLived(tokenJson.access_token).catch((e) => {
      console.error("[meta] long-lived exchange failed", e);
      return { access_token: tokenJson.access_token, expires_in: undefined };
    });

    // Fetch pages the user manages.
    const pages = await listPagesForUser(long.access_token).catch((e) => {
      console.error("[meta] list pages failed", e);
      return { data: [] };
    });
    let igAccountId: string | null = null;
    let chosenPage: { id: string; name: string; access_token: string } | null = null;
    let igUsername: string | null = null;
    let igName: string | null = null;
    let profilePic: string | null = null;

    for (const page of pages.data || []) {
      const detailUrl = new URL(`https://graph.facebook.com/${META_API_VERSION}/${page.id}`);
      detailUrl.searchParams.set("fields", "id,name,instagram_business_account{id,username,name,profile_picture_url}");
      detailUrl.searchParams.set("access_token", page.access_token || long.access_token);
      const detail = await fetch(detailUrl.toString(), { cache: "no-store" }).then((r) => r.json().catch(() => null));
      if (detail?.instagram_business_account?.id) {
        igAccountId = detail.instagram_business_account.id;
        igUsername = detail.instagram_business_account.username ?? null;
        igName = detail.instagram_business_account.name ?? null;
        profilePic = detail.instagram_business_account.profile_picture_url ?? null;
        chosenPage = { id: page.id, name: page.name, access_token: page.access_token || long.access_token };
        break;
      }
    }

    if (!igAccountId || !chosenPage) {
      return NextResponse.redirect(new URL("/settings/instagram?error=no_instagram_business_account", req.url));
    }

    const tokenValid = await verifyToken(chosenPage.access_token, chosenPage.id);

    // Upsert Instagram account (the DISCONNECTED placeholder has unique businessId).
    await prisma.instagramAccount.upsert({
      where: { businessId },
      create: {
        businessId,
        instagramBusinessAccountId: igAccountId,
        pageId: chosenPage.id,
        username: igUsername,
        name: igName || chosenPage.name,
        profilePicUrl: profilePic,
        accessToken: encrypt(chosenPage.access_token),
        status: tokenValid.ok ? "CONNECTED" : "DEGRADED",
        lastVerifiedAt: new Date(),
        tokenExpiresAt: long.expires_in ? new Date(Date.now() + long.expires_in * 1000) : null,
        metaAppId: META_APP_ID,
      },
      update: {
        instagramBusinessAccountId: igAccountId,
        pageId: chosenPage.id,
        username: igUsername,
        name: igName || chosenPage.name,
        profilePicUrl: profilePic,
        accessToken: encrypt(chosenPage.access_token),
        status: tokenValid.ok ? "CONNECTED" : "DEGRADED",
        lastVerifiedAt: new Date(),
        tokenExpiresAt: long.expires_in ? new Date(Date.now() + long.expires_in * 1000) : null,
        metaAppId: META_APP_ID,
      },
    });

    await prisma.auditLog.create({
      data: {
        businessId,
        action: "instagram.connect",
        metaJson: { pageId: chosenPage.id, igId: igAccountId, username: igUsername } as any,
      },
    });

    const redirect = NextResponse.redirect(new URL("/settings/instagram?connected=1", req.url));
    redirect.cookies.set("sellora_oauth_state", "", { maxAge: 0, path: "/" });
    return redirect;
  } catch (e) {
    console.error("[instagram/callback]", e);
    return NextResponse.redirect(new URL("/settings/instagram?error=internal", req.url));
  }
}
