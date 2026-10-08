"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function MarkAllReadButton({ label }: { label: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  async function run() {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
    } catch {
      // Non-fatal: the refresh below still shows the current server state.
    }
    start(() => router.refresh());
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={pending}
      className="btn-secondary min-h-[40px] px-3 py-2 text-[12px]"
    >
      {pending ? "…" : label}
    </button>
  );
}
