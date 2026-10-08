import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config/site";

/**
 * robots.txt — allow crawling of the public marketing surface, block the
 * authenticated application. Rules are longest-match, so the explicit
 * disallow prefixes win over the "/" allow for private routes.
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/why-sellora", "/login", "/signup"],
        disallow: [
          "/api/",
          "/admin",
          "/dashboard",
          "/conversations",
          "/leads",
          "/products",
          "/settings",
          "/onboarding",
          "/notifications",
          "/_next/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
