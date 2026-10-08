"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SubscribeButton({
  planId,
  variant = "secondary",
}: {
  planId: "WEEKLY" | "MONTHLY" | "QUARTERLY";
  variant?: "primary" | "secondary";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function goToPay() {
    setLoading(true);
    router.push(`/settings/subscription/pay/${planId}`);
  }

  return (
    <Button
      onClick={goToPay}
      loading={loading}
      className="mt-4 w-full"
      variant={variant}
      size="md"
    >
      {loading ? "در حال انتقال…" : "انتخاب این پلن"}
    </Button>
  );
}
