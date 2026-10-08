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
      className="btn-secondary text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
      style={{ padding: "0.5rem 0.75rem" }}
    >
      {pending ? "…" : label}
    </button>
  );
}
