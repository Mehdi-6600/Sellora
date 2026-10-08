import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config/site";

/**
 * Sitemap — public, indexable pages only. Authenticated routes are never
 * listed here (they are also blocked in robots.txt and noindexed via the
 * (app) layout).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/why-sellora`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
