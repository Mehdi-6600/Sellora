"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";

/**
 * Re-checks the Instagram connection through the existing status endpoint
 * (GET /api/instagram/status — the same call the app already exposes) and then
 * re-renders the page with whatever the server now reports. No client-side
 * guessing about the connection state.
 */
export function StatusRefresh() {
  const [busy, setBusy] = React.useState(false);
  const router = useRouter();
  const toast = useToast();

  async function check() {
    setBusy(true);
    try {
      const res = await fetch("/api/instagram/status", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.push("بررسی وضعیت ناموفق بود؛ بعداً دوباره تلاش کنید.", "error");
        return;
      }
      const status = data?.status;
      if (status === "CONNECTED") toast.push("اتصال اینستاگرام سالم است ✅", "success");
      else if (status === "REAUTH_REQUIRED")
        toast.push("دسترسی منقضی شده؛ نیاز به ورود مجدد است.", "error");
      else toast.push("وضعیت اتصال به‌روزرسانی شد.", "info");
      router.refresh();
    } catch {
      toast.push("ارتباط با سرور برقرار نشد.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="secondary" onClick={check} loading={busy} className="w-full">
      {busy ? "در حال بررسی…" : "بررسی سلامت اتصال"}
    </Button>
  );
}
