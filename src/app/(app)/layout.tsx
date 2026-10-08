import type { Metadata } from "next";

/**
 * Every route in the (app) group is part of the authenticated application.
 * Keep it out of search engines entirely — private URLs must never surface
 * in results, and robots.txt alone is only advisory.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
