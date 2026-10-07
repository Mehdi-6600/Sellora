import fa, { Dict } from "./dictionaries/fa";
import en from "./dictionaries/en";
import ar from "./dictionaries/ar";
import { headers, cookies } from "next/headers";

const dictionaries: Record<string, Dict> = { fa, en, ar };
export const SUPPORTED_LOCALES = ["fa", "en", "ar"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fa";

export function isLocale(v: string | null | undefined): v is Locale {
  return !!v && (SUPPORTED_LOCALES as readonly string[]).includes(v);
}

/**
 * Server-side locale resolution:
 *   1. Cookie `sellora_locale` (اگر کاربر خودش تغییر داده باشد)
 *   2. Default: fa (Persian) — Sellora is a Persian-first product.
 *
 * توجه: عمداً از Accept-Language استفاده نمی‌کنیم تا کاربران ایرانی همیشه
 * تجربه‌ی فارسی داشته باشند، حتی اگر مرورگرشان انگلیسی باشد.
 */
export async function getLocale(): Promise<Locale> {
  try {
    const c = cookies();
    const cookieLocale = c.get("sellora_locale")?.value;
    if (isLocale(cookieLocale)) return cookieLocale;
  } catch {
    // cookies() can throw in some non-request contexts.
  }
  return DEFAULT_LOCALE;
}

export function getDictionary(locale: Locale = DEFAULT_LOCALE): Dict {
  return dictionaries[locale] ?? fa;
}

export async function getServerDict(): Promise<{ dict: Dict; locale: Locale; dir: "rtl" | "ltr" }> {
  const locale = await getLocale();
  return {
    dict: getDictionary(locale),
    locale,
    dir: locale === "fa" || locale === "ar" ? "rtl" : "ltr",
  };
}

// Simple tagged-string interpolator for messages with {placeholders}.
export function t(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}
