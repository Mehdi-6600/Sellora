// Persian helpers: digit conversion, number formatting, price toman/rial display.

const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const arabicIndicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => persianDigits[Number(d)]);
}

export function toEnglishDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(persianDigits.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(arabicIndicDigits.indexOf(d)));
}

/**
 * Prices in Sellora are stored in RIALS (smallest unit).
 * Iran commonly talks in Toman (1 toman = 10 rials).
 * Default UI shows Toman with commas + Persian digits.
 */
export function formatToman(priceInRials: number, locale: "fa" | "en" | "ar" = "fa"): string {
  const toman = Math.round(priceInRials / 10);
  const formatted = new Intl.NumberFormat("en-US").format(toman);
  if (locale === "fa") return toPersianDigits(formatted);
  if (locale === "ar") {
    return new Intl.NumberFormat("ar-EG").format(toman);
  }
  return formatted;
}

export function formatTime(iso: string | Date, locale: "fa" | "en" | "ar" = "fa"): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString(locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-EG" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string | Date, locale: "fa" | "en" | "ar" = "fa"): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString(locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Human relative time, e.g. «۵ دقیقه پیش» / «همین حالا».
 * Used by the notification center. Falls back to an absolute date for
 * anything older than 30 days, where "x months ago" stops being useful.
 */
export function formatRelativeTime(iso: string | Date, locale: "fa" | "en" | "ar" = "fa"): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const diffMs = Date.now() - d.getTime();
  if (!Number.isFinite(diffMs)) return formatDate(iso, locale);
  const lang = locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-EG" : "en-US";
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const minutes = Math.round(diffMs / 60_000);
  if (diffMs < 45_000) return rtf.format(0, "minute");
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) <= 30) return rtf.format(-days, "day");
  return formatDate(iso, locale);
}

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
