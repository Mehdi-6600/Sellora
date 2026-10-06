"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function PayForm({ planId }: { planId: "WEEKLY" | "MONTHLY" | "QUARTERLY" }) {
  const router = useRouter();
  const [trackingCode, setTrackingCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const code = trackingCode.trim();
    if (code.length < 6 || code.length > 30) {
      setError("کد رهگیری باید بین ۶ تا ۳۰ کاراکتر باشد.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/subscription/submit-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, trackingCode: code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || data?.error || "خطا در ثبت درخواست");
        setLoading(false);
        return;
      }
      router.push("/settings/subscription/status");
    } catch (e) {
      setError("خطا در ارتباط با سرور");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card className="p-4 space-y-4">
        <div>
          <Label htmlFor="trackingCode">کد رهگیری واریز</Label>
          <Input
            id="trackingCode"
            name="trackingCode"
            placeholder="مثلاً ۱۲۳۴۵۶۷۸"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            dir="ltr"
            maxLength={30}
            required
          />
          <p className="text-xs text-ink-500 mt-1.5 leading-5">
            این کد پس از واریز، توسط بانک به شما داده می‌شود.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? "در حال ثبت..." : "ثبت درخواست پرداخت"}
        </Button>
      </Card>
    </form>
  );
}
