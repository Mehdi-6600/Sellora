export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06ff\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "shop";
}

/** Append a short random suffix to guarantee uniqueness. */
export function uniqueSlug(base: string): string {
  const s = slugify(base).replace(/[^a-z0-9-]/g, "") || "shop";
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${s}-${suffix}`;
}
