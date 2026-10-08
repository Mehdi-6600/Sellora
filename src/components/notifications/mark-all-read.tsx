"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toaster";
import { NOTIFICATIONS_CHANGED } from "./use-unread-count";

export function MarkAllReadButton({ label }: { label: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, setPending] = useState(false);
  async function run() {
    if (pending) return;
    setPending(true);
    try {
      const response = await fetch("/api/notifications/read-all", { method: "POST" });
      if (!response.ok) throw new Error("read failed");
      window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
      router.refresh();
    } catch {
      toast.push("اعلان‌ها خوانده نشدند. دوباره تلاش کنید.", "error");
    } finally { setPending(false); }
  }
  return <button type="button" onClick={run} disabled={pending} aria-busy={pending} className="btn-secondary px-3 text-xs">
    {pending ? "در حال ثبت…" : label}
  </button>;
}
