// Central Meta Graph API configuration.
// Update META_API_VERSION in .env when Meta releases a new version.

export const META_API_VERSION = process.env.META_API_VERSION || "v21.0";
export const META_GRAPH_BASE = process.env.META_GRAPH_BASE_URL || "https://graph.facebook.com";
export const META_APP_ID = process.env.META_APP_ID || "";
export const META_APP_SECRET = process.env.META_APP_SECRET || "";
export const META_WEBHOOK_VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "";
export const META_REDIRECT_URI = process.env.META_REDIRECT_URI || "";
export const APP_URL = process.env.APP_URL || "";

/**
 * Permissions required for MVP (Instagram Messaging + Basic profile access).
 * These are the documented names for Graph API >= v17.
 * Per Meta, Instagram DM requires pages_messaging on the linked Facebook Page
 * and instagram_basic / pages_show_list for account resolution.
 *
 * Production (Advanced Access) requires App Review.
 */
export const REQUIRED_SCOPES = [
  "instagram_basic",
  "pages_show_list",
  "pages_messaging",
  "pages_manage_metadata",
  "business_management",
] as const;

export function graphUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${META_GRAPH_BASE}/${META_API_VERSION}${clean}`;
}
