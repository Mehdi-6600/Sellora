"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";

export function SubscribeButton({ planId }: { planId: "WEEKLY" | "MONTHLY" | "QUARTERLY" }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  async function submit() {
    setLoading(true);
    const res = await fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planId }),
    });
    setLoading(false);
    if (res.ok) {
      toast.push("درخواست اشتراک ثبت شد. به زودی با شما تماس می‌گیریم.", "success");
      router.refresh();
    } else {
      toast.push("خطا در ثبت درخواست", "error");
    }
  }
  return (
    <Button onClick={submit} disabled={loading} className="w-full mt-3" variant={planId === "QUARTERLY" ? "primary" : "secondary"}>
      انتخاب این پلن
    </Button>
  );
}
