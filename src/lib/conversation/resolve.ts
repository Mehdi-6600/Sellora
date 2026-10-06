// Product resolution from conversation context + fuzzy name match against the
// business catalog. Multi-product aware: a later product mention replaces the
// active product, but we keep recency so stale mentions don't stick.

import { prisma } from "@/lib/db/prisma";
import { tokenize, normalize } from "./normalize";

const CONTEXT_TTL_MS = 1000 * 60 * 60; // 60 minutes of inactivity resets active product

/**
 * Find the best-matching product by fuzzy token overlap against the business's
 * available catalog (including archived, but not if explicitly searching for an
 * unavailable item — we still show the best match and let the response layer say
 * it's unavailable).
 */
type ResolvedProduct = {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  imageUrl: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  variants: Array<{ id: string; productId: string; size: string | null; color: string | null; sku: string | null; price: number | null; status: string }>;
};

export async function resolveProduct(
  businessId: string,
  text: string
): Promise<{ product: ResolvedProduct; score: number } | null> {
  const n = normalize(text);
  const tokens = tokenize(n);
  if (tokens.length === 0) return null;

  // Load active products for this business. For MVP we load in-process; if
  // catalog > 1000 this should become a search index or use PG trigram.
  const products = await prisma.product.findMany({
    where: { businessId, status: { not: "ARCHIVED" } },
    include: { variants: true },
    orderBy: { updatedAt: "desc" },
    take: 1000,
  });
  if (products.length === 0) return null;

  let best: { product: (typeof products)[number]; score: number } | null = null;
  for (const p of products) {
    const nameN = normalize(p.name);
    const nameTokens = new Set(tokenize(nameN));
    if (nameTokens.size === 0) continue;
    let score = 0;
    for (const t of tokens) {
      if (nameTokens.has(t)) score += 2;
      else if (nameN.includes(t)) score += 1;
    }
    // Bonus for exact substring match of product name
    if (n.includes(nameN)) score += 4;
    if (!best || score > best.score) best = { product: p as unknown as ResolvedProduct, score };
  }
  if (!best || best.score < 2) return null;
  return best as any;
}

/**
 * Find the relevant variant given size/color preferences.
 */
export function resolveVariant(
  product: { variants: Array<{ id: string; size: string | null; color: string | null; status: string; price: number | null; sku: string | null }> },
  opts: { colors?: string[]; sizes?: string[] }
): (typeof product.variants)[number] | null {
  if (!product.variants.length) return null;
  const colors = opts.colors ?? [];
  const sizes = opts.sizes ?? [];
  // Exact match on both color and size if provided.
  if (colors.length && sizes.length) {
    const m = product.variants.find(
      (v) => v.color === colors[0] && String(v.size) === String(sizes[0])
    );
    if (m) return m;
  }
  if (colors.length) {
    const m = product.variants.find((v) => v.color === colors[0]);
    if (m) return m;
  }
  if (sizes.length) {
    const m = product.variants.find((v) => String(v.size) === String(sizes[0]));
    if (m) return m;
  }
  return null;
}

/**
 * Whether the active context should be considered stale.
 */
export function isContextStale(lastMentionedAt: Date | null | undefined, now = new Date()): boolean {
  if (!lastMentionedAt) return true;
  return now.getTime() - lastMentionedAt.getTime() > CONTEXT_TTL_MS;
}
