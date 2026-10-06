// Normalization for Persian / Finglish / English — preprocessing before intent
// detection and entity extraction. We do NOT rely purely on exact matching.

import { toEnglishDigits } from "@/lib/utils/format";

/** Map common Arabic-letter variants to their Persian equivalents. */
const ARABIC_PERSIAN_MAP: Record<string, string> = {
  ي: "ی",
  ى: "ی",
  ئ: "ی",
  ؤ: "و",
  ة: "ه",
  ك: "ک",
  ء: "",
  إ: "ا",
  أ: "ا",
  آ: "ا",
  ٱ: "ا",
};

/** Common Finglish transliterations -> Persian root keyword. */
type FinglishPair = [RegExp, string];
const FINGLISH_MAP: FinglishPair[] = [
  [/\bgheim(at|ata)?\b/g, "قیمت"],
  [/\bgheymat\b/g, "قیمت"],
  [/\bghimat\b/g, "قیمت"],
  [/\bprice\b/g, "قیمت"],
  [/\bchand\b/g, "چند"],
  [/\bmojud\b/g, "موجود"],
  [/\bavailable\b/g, "موجود"],
  [/\bstock\b/g, "موجود"],
  [/\bdarid\b/g, "دارید"],
  [/\bdarin?\b/g, "دارید"],
  [/\bsend\b/g, "ارسال"],
  [/\bersal\b/g, "ارسال"],
  [/\bshipping\b/g, "ارسال"],
  [/\baddress\b/g, "آدرس"],
  [/\bshoma?reh?\b/g, "شماره"],
  [/\btamass?\b/g, "تماس"],
  [/\bphone\b/g, "شماره"],
  [/\bsaat\b/g, "ساعت"],
  [/\btkhfif\b/g, "تخفیف"],
  [/\btakhfif\b/g, "تخفیف"],
  [/\bdiscount\b/g, "تخفیف"],
  [/\boff\b/g, "تخفیف"],
  [/\bbazgasht\b/g, "مرجوع"],
  [/\breturn\b/g, "مرجوع"],
  [/\bsefaresh\b/g, "سفارش"],
  [/\border\b/g, "سفارش"],
  [/\bpardakht\b/g, "پرداخت"],
  [/\bpayment\b/g, "پرداخت"],
  [/\breservation\b/g, "رزرو"],
  [/\bmirse\b/g, "میرسه"],
  [/\bmiresam\b/g, "میرسم"],
  [/\bemrooz\b/g, "امروز"],
  [/\bfarda\b/g, "فردا"],
  [/\bshiraz\b/g, "شیراز"],
  [/\btehran\b/g, "تهران"],
  [/\besfahan\b/g, "اصفهان"],
  [/\bmashhad\b/g, "مشهد"],
  [/\bkaraj\b/g, "کرج"],
];

/** Remove extra whitespace, zero-width chars, normalize punctuation. */
export function normalize(raw: string): string {
  let s = raw ?? "";
  s = toEnglishDigits(s);
  // Replace Arabic variants
  s = s.replace(/[\u064A\u0649\u0626]/g, (ch) => ARABIC_PERSIAN_MAP[ch] ?? ch);
  s = s.replace(/[\u0643]/g, "ک");
  s = s.replace(/[\u0629]/g, "ه");
  s = s.replace(/[\u0621\u0625\u0623\u0622\u0671]/g, (ch) => ARABIC_PERSIAN_MAP[ch] ?? "ا");
  s = s.replace(/ـ/g, ""); // kashida / tatweel
  // Zero-width joiners/non-joiners
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, "");
  // Normalize punctuation
  s = s.replace(/[؟?]/g, " ؟ ");
  s = s.replace(/[،,]/g, " ، ");
  s = s.replace(/[!！]/g, " ! ");
  s = s.replace(/\s+/g, " ").trim();
  s = s.toLowerCase();
  // Finglish -> Persian mappings (each entry is a [regex, replacement] pair)
  for (const [re, rep] of FINGLISH_MAP) {
    s = s.replace(re, rep);
  }
  return s;
}

/** Tokenize into loosely normalized tokens for matching. */
export function tokenize(s: string): string[] {
  return normalize(s)
    .split(/[\s،,.؟?!؟\-_:;()\[\]{}«»]+/g)
    .map((t) => t.trim())
    .filter((t) => t.length >= 1);
}
