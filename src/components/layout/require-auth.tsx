"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Client-side auth guard for protected pages. Server-side route handlers and
 * server components also enforce auth; this is just for UX redirects.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    // A quick cookie probe. Real verification happens server-side.
    const hasSession = document.cookie.split(";").some((c) => c.trim().startsWith("sellora_session="));
    if (!hasSession) router.replace("/login");
  }, [router]);
  return <>{children}</>;
}
