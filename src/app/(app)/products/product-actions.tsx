"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toaster";
import { Switch } from "@/components/ui/switch";
import { cx } from "@/lib/utils/format";

/**
 * Availability control.
 *
 * Same endpoint and payload as before (PATCH /api/products/:id with the next
 * status) — only the control became a premium switch, which is the honest shape
 * for a two-state field: available / unavailable.
 */
export function ProductActions({
  productId,
  currentStatus,
}: {
  productId: string;
  currentStatus: "AVAILABLE" | "UNAVAILABLE" | "ARCHIVED";
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();
  const available = currentStatus === "AVAILABLE";

  async function setStatus(next: "AVAILABLE" | "UNAVAILABLE") {
    const res = await fetch(`/api/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      toast.push(next === "AVAILABLE" ? "موجود شد ✅" : "ناموجود شد", "success");
      startTransition(() => router.refresh());
    } else {
      toast.push("خطا در ذخیره", "error");
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <Switch
        checked={available}
        disabled={pending}
        label={available ? "ناموجود کردن محصول" : "موجود کردن محصول"}
        onCheckedChange={(next) => setStatus(next ? "AVAILABLE" : "UNAVAILABLE")}
      />
      <span
        className={cx(
          "text-[10.5px] font-bold",
          available ? "text-emerald-600" : "text-ink-400"
        )}
      >
        {available ? "موجود" : "ناموجود"}
      </span>
    </div>
  );
}
