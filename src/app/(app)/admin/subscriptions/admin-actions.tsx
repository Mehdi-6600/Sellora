"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function AdminSubscriptionActions({ subscriptionId }: { subscriptionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState<"approve" | "reject" | null>(null);
  const [showReject, setShowReject] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  async function approve() {
    setError(null);
    setLoading("approve");
    try {
      const res = await fetch(`/api/admin/subscriptions/${subscriptionId}/approve`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "خطا در تأیید");
        setLoading(null);
        return;
      }
      router.refresh();
    } catch {
      setError("خطا در ارتباط با سرور");
    }
    setLoading(null);
  }

  async function reject() {
    setError(null);
    const r = reason.trim();
    if (r.length < 1) {
      setError("دلیل رد را وارد کنید.");
      return;
    }
    setLoading("reject");
    try {
      const res = await fetch(`/api/admin/subscriptions/${subscriptionId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: r }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "خطا در رد");
        setLoading(null);
        return;
      }
      router.refresh();
    } catch {
      setError("خطا در ارتباط با سرور");
    }
    setLoading(null);
  }

  return (
    <div className="space-y-2 border-t border-ink-100/80 pt-3">
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-400/30 bg-red-400/15 px-3.5 py-2.5 text-[12px] font-medium text-red-700"
        >
          {error}
        </div>
      )}

      {!showReject ? (
        <div className="flex gap-2">
          <Button
            onClick={approve}
            disabled={loading !== null}
            loading={loading === "approve"}
            className="flex-1"
            size="sm"
          >
            تأیید
          </Button>
          <Button
            onClick={() => setShowReject(true)}
            disabled={loading !== null}
            variant="danger"
            className="flex-1"
            size="sm"
          >
            رد
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="reject-reason">دلیل رد</Label>
          <Input
            id="reject-reason"
            placeholder="دلیل رد..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
          />
          <div className="flex gap-2">
            <Button
              onClick={reject}
              disabled={loading !== null}
              loading={loading === "reject"}
              variant="danger"
              className="flex-1"
              size="sm"
            >
              تأیید رد
            </Button>
            <Button
              onClick={() => {
                setShowReject(false);
                setReason("");
                setError(null);
              }}
              disabled={loading !== null}
              variant="ghost"
              className="flex-1"
              size="sm"
            >
              انصراف
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
