// Thin wrapper around Meta Graph API for sending messages, exchanging tokens,
// and basic account metadata. Does NOT do scraping or private endpoints.
import { graphUrl, META_APP_ID, META_APP_SECRET, META_API_VERSION } from "./config";
import { decrypt } from "@/lib/security/crypto";

type Json = Record<string, unknown>;

export class MetaApiError extends Error {
  constructor(message: string, public status: number, public code?: number, public subcode?: number) {
    super(message);
  }
}

async function request(method: "GET" | "POST", url: string, init: RequestInit = {}): Promise<any> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
    cache: "no-store",
  });
  let body: any = null;
  const text = await res.text();
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    const msg = body?.error?.message || `Meta API error (${res.status})`;
    throw new MetaApiError(msg, res.status, body?.error?.code, body?.error?.error_subcode);
  }
  return body;
}

// ---------- OAuth ----------

export function buildOAuthLoginUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: META_APP_ID,
    redirect_uri: redirectUri,
    state,
    scope: "instagram_basic,pages_show_list,pages_messaging,pages_manage_metadata,business_management",
    response_type: "code",
  });
  return `https://www.facebook.com/${META_API_VERSION}/dialog/oauth?${params.toString()}`;
}

export async function exchangeShortTokenForLongLived(shortToken: string): Promise<{ access_token: string; expires_in?: number }> {
  const url = new URL(graphUrl("/oauth/access_token"));
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", META_APP_ID);
  url.searchParams.set("client_secret", META_APP_SECRET);
  url.searchParams.set("fb_exchange_token", shortToken);
  const res = await request("GET", url.toString());
  return { access_token: res.access_token, expires_in: res.expires_in };
}

export async function getInstagramAccountsForPage(pageToken: string, pageId: string): Promise<any> {
  const url = new URL(graphUrl(`/${pageId}`));
  url.searchParams.set("fields", "instagram_business_account{id,username,name,profile_picture_url}");
  url.searchParams.set("access_token", pageToken);
  return request("GET", url.toString());
}

export async function listPagesForUser(longToken: string): Promise<any> {
  const url = new URL(graphUrl("/me/accounts"));
  url.searchParams.set("access_token", longToken);
  return request("GET", url.toString());
}

// ---------- Messaging ----------

export type SendMessageInput = {
  recipientId: string;
  text: string;
  pageToken: string;
  idempotencyKey?: string;
};

/**
 * Send a text DM via a Facebook Page linked to the Instagram Business Account.
 * Uses the /PAGE-ID/messages endpoint (Instagram Messaging via Graph API).
 */
export async function sendTextMessage({ recipientId, text, pageToken, idempotencyKey }: SendMessageInput): Promise<{ messageId: string }> {
  // We try sending with the standard messaging endpoint; on Instagram-enabled
  // pages this delivers to the Instagram DM.
  const url = new URL(graphUrl("/me/messages"));
  url.searchParams.set("access_token", pageToken);
  const body: Json = {
    recipient: { id: recipientId },
    message: { text },
    messaging_type: "RESPONSE",
  };
  if (idempotencyKey) {
    // Meta supports an idempotency header.
    (body as any).tag = idempotencyKey;
  }
  const res = await request("POST", url.toString(), {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  return { messageId: res.message_id };
}

/** Used by background jobs — decrypts token and sends. */
export async function sendMessageWithEncryptedToken(params: {
  pageId: string;
  encryptedToken: string;
  recipientId: string;
  text: string;
  idempotencyKey?: string;
}): Promise<{ messageId: string }> {
  const token = decrypt(params.encryptedToken);
  const url = new URL(graphUrl(`/${params.pageId}/messages`));
  url.searchParams.set("access_token", token);
  const body: Json = {
    recipient: { id: params.recipientId },
    message: { text: params.text },
    messaging_type: "RESPONSE",
  };
  if (params.idempotencyKey) (body as any).tag = params.idempotencyKey;
  const res = await request("POST", url.toString(), {
    body: JSON.stringify(body),
  });
  return { messageId: res.message_id };
}

// ---------- Validation ----------

export async function verifyToken(pageToken: string, pageId: string): Promise<{ ok: boolean; username?: string; name?: string }> {
  try {
    const url = new URL(graphUrl(`/${pageId}`));
    url.searchParams.set("fields", "id,name,instagram_business_account{id,username,name,profile_picture_url}");
    url.searchParams.set("access_token", pageToken);
    const res = await request("GET", url.toString());
    return { ok: true, username: res.instagram_business_account?.username, name: res.name };
  } catch {
    return { ok: false };
  }
}
