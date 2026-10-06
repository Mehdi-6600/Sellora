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
 *   1. Cookie `sellora_locale`
 *   2. Accept-Language header (first two chars)
 *   3. Default (fa)
 */
export async function getLocale(): Promise<Locale> {
  try {
    const c = cookies();
    const cookieLocale = c.get("sellora_locale")?.value;
    if (isLocale(cookieLocale)) return cookieLocale;
  } catch {
    // cookies() can throw in some non-request contexts.
  }
  try {
    const h = headers();
    const al = h.get("accept-language");
    if (al) {
      const first = al.split(",")[0].slice(0, 2).toLowerCase();
      if (isLocale(first)) return first;
    }
  } catch {
    // ignore
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
