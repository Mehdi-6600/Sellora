// Simple paste-based product importer (MVP).
// Accepts newline-separated rows with "|" separators:
//   نام محصول | قیمت | وضعیت
// Example:
//   مانتو آوا | 2400000 | موجود
// Prices can be in تومان (divide by 10 to get ریال stored value). We assume
// owner enters toman since that is the colloquial unit in Iran.

import { z } from "zod";
import { toEnglishDigits } from "@/lib/utils/format";

const AVAILABLE_WORDS = new Set(["موجود", "موجوده", "هست", "داریم", "در انبار", "available", "in stock"]);
const UNAVAILABLE_WORDS = new Set(["ناموجود", "تموم شده", "اتمام", "نداریم", "unavailable", "out of stock", "out"]);

export type ImportRow = {
  line: number;
  raw: string;
  name?: string;
  priceToman?: number; // UI/input in toman
  status?: "AVAILABLE" | "UNAVAILABLE";
  valid: boolean;
  error?: string;
};

function parsePrice(raw: string): number | null {
  const cleaned = toEnglishDigits(raw.replace(/[^\d۰-۹]/g, "").trim());
  if (!/^\d+$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function parseStatus(raw: string): "AVAILABLE" | "UNAVAILABLE" | null {
  const s = raw.trim().toLowerCase();
  if (AVAILABLE_WORDS.has(s)) return "AVAILABLE";
  if (UNAVAILABLE_WORDS.has(s)) return "UNAVAILABLE";
  // Accept yes/no
  if (/^(yes|y|true|1|بله|بله|آره)$/.test(s)) return "AVAILABLE";
  if (/^(no|n|false|0|نه|خیر)$/.test(s)) return "UNAVAILABLE";
  return null;
}

export function parseImportInput(input: string): ImportRow[] {
  const rows: ImportRow[] = [];
  const lines = input.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  lines.forEach((raw, idx) => {
    const parts = raw.split("|").map((p) => p.trim());
    const row: ImportRow = { line: idx + 1, raw, valid: false };
    if (parts.length < 2) {
      row.error = "فرمت نادرست — حداقل نام و قیمت لازم است";
      rows.push(row);
      return;
    }
    const name = parts[0];
    const priceRaw = parts[1];
    const statusRaw = parts[2] ?? "موجود";
    if (!name || name.length < 2) {
      row.error = "نام محصول معتبر نیست";
      rows.push(row);
      return;
    }
    const priceToman = parsePrice(priceRaw);
    if (!priceToman) {
      row.error = "قیمت معتبر نیست";
      rows.push(row);
      return;
    }
    const status = parseStatus(statusRaw);
    if (!status) {
      row.error = "وضعیت باید «موجود» یا «ناموجود» باشد";
      rows.push(row);
      return;
    }
    row.name = name;
    row.priceToman = priceToman;
    row.status = status;
    row.valid = true;
    rows.push(row);
  });
  return rows;
}

// Stored price is in RIALS (priceToman * 10)
export function toStoragePrice(toman: number): number {
  return Math.round(toman * 10);
}

export const importInputSchema = z.object({
  text: z.string().min(1).max(100_000),
});
