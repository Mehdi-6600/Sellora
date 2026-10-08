// Central site configuration for metadata, robots.txt, sitemap.xml, JSON-LD
// and marketing pages. One place, so the domain is never duplicated as a
// hardcoded string across files.

/**
 * Canonical public origin.
 * 1. APP_URL when configured (documented in .env.example).
 * 2. Vercel's deployment URL (covers previews without extra config).
 * 3. localhost for local development.
 */
export function siteUrl(): string {
  const app = process.env.APP_URL;
  if (app) return app.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

export const SITE_NAME = "سلورا";
export const SITE_NAME_LATIN = "Sellora";

export const SITE_DESCRIPTION =
  "سلورا فروشنده و پشتیبان خودکار اینستاگرام است: به دایرکت مشتری‌ها جواب می‌دهد، قیمت و موجودی را از محصولات خودتان می‌گوید، مشتری‌های داغ را شناسایی می‌کند و گفتگوهای حساس را به شما تحویل می‌دهد.";

export const SITE_KEYWORDS = [
  "پاسخ خودکار دایرکت اینستاگرام",
  "مدیریت پیام اینستاگرام فروشندگان",
  "شناسایی مشتری داغ",
  "دستیار فروش اینستاگرام",
  "سلورا",
];

export function absolute(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
