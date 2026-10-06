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

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
