"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const NOTIFICATIONS_CHANGED = "sellora:notifications-changed";

/** Reconcile cached chrome with persisted read state on navigation/focus/mutation. */
export function useUnreadCount(initial: number) {
  const [count, setCount] = useState(initial);
  const pathname = usePathname();
  useEffect(() => {
    setCount(initial);
    let controller: AbortController | undefined;
    async function reconcile() {
      controller?.abort();
      controller = new AbortController();
      try {
        const response = await fetch("/api/notifications", { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const data = await response.json();
        if (data.ok && typeof data.unread === "number") setCount(data.unread);
      } catch { /* Retain last confirmed count on network failure. */ }
    }
    void reconcile();
    window.addEventListener(NOTIFICATIONS_CHANGED, reconcile);
    window.addEventListener("focus", reconcile);
    window.addEventListener("pageshow", reconcile);
    return () => {
      controller?.abort();
      window.removeEventListener(NOTIFICATIONS_CHANGED, reconcile);
      window.removeEventListener("focus", reconcile);
      window.removeEventListener("pageshow", reconcile);
    };
  }, [initial, pathname]);
  return count;
}
