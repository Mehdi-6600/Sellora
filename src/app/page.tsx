import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LandingPage } from "@/components/landing/landing-page";

export const dynamic = "force-dynamic";

/**
 * Root route:
 *   authenticated visitor  → /dashboard
 *   anonymous visitor      → public landing page (indexable)
 *
 * The redirect for anonymous visitors that used to live here (and in
 * middleware) made the product invisible to anyone who had not signed up yet.
 */
export default async function RootPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");
  return <LandingPage />;
}
