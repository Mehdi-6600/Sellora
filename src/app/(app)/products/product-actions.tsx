"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";

export function ProductActions({ productId, currentStatus }: { productId: string; currentStatus: "AVAILABLE" | "UNAVAILABLE" | "ARCHIVED" }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  async function toggleAvailability() {
    const next = currentStatus === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
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
    <Button
      size="sm"
      variant={currentStatus === "AVAILABLE" ? "secondary" : "primary"}
      onClick={toggleAvailability}
      disabled={pending}
      className="text-xs"
    >
      {currentStatus === "AVAILABLE" ? "ناموجود" : "موجود شد"}
    </Button>
  );
}
