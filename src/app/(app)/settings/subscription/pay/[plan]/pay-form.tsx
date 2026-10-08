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

    // Unchanged behaviour: the raw code the owner typed is what gets submitted.
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
    } catch {
      setError("خطا در ارتباط با سرور");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card className="space-y-4 p-4 sm:p-5">
        <div>
          <Label htmlFor="trackingCode">کد رهگیری واریز</Label>
          <Input
            id="trackingCode"
            name="trackingCode"
            placeholder="مثلاً ۱۲۳۴۵۶۷۸"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            inputMode="numeric"
            dir="ltr"
            maxLength={30}
            required
            className="text-center font-mono text-[15px] tracking-widest"
          />
          <p className="help">این کد پس از واریز، توسط بانک به شما داده می‌شود.</p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700"
          >
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} disabled={loading} className="w-full" size="lg">
          {loading ? "در حال ثبت…" : "ثبت درخواست پرداخت"}
        </Button>
      </Card>
    </form>
  );
}
