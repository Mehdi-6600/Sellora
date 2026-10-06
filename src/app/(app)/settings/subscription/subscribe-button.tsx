"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SubscribeButton({ planId }: { planId: "WEEKLY" | "MONTHLY" | "QUARTERLY" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function goToPay() {
    setLoading(true);
    router.push(`/settings/subscription/pay/${planId}`);
  }

  return (
    <Button
      onClick={goToPay}
      disabled={loading}
      className="w-full mt-3"
      variant={planId === "QUARTERLY" ? "primary" : "secondary"}
    >
      {loading ? "در حال انتقال..." : "انتخاب این پلن"}
    </Button>
  );
}
