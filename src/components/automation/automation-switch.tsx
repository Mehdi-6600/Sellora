"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toaster";
import { SwitchVisual } from "@/components/ui/switch";
import { cx } from "@/lib/utils/format";
import { Spinner } from "@/components/ui/button";

/**
 * Master automation switch.
 *
 * Posts to the endpoint that already exists (POST /api/rules/automation) with
 * the same form field the settings page uses, so there is one source of truth
 * and no API change. `redirect: "manual"` keeps the endpoint's 303 from pulling
 * the settings page into this fetch; the router refresh below re-renders with
 * the persisted value. A <noscript> form fallback is rendered by the page, so
 * the switch still works without JavaScript.
 */
export function AutomationSwitch({
  enabled,
  label,
  size = "md",
}: {
  enabled: boolean;
  label: string;
  size?: "sm" | "md";
}) {
  const [checked, setChecked] = React.useState(enabled);
  const [busy, setBusy] = React.useState(false);
  const router = useRouter();
  const toast = useToast();

  // Keep in sync when the server sends a new value after refresh.
  React.useEffect(() => {
    setChecked(enabled);
  }, [enabled]);

  async function toggle() {
    const next = !checked;
    setChecked(next);
    setBusy(true);
    try {
      const body = new FormData();
      body.set("enabled", next ? "true" : "false");
      await fetch("/api/rules/automation", {
        method: "POST",
        body,
        redirect: "manual",
      });
      toast.push(
        next ? "پاسخ‌گویی خودکار روشن شد" : "پاسخ‌گویی خودکار خاموش شد",
        next ? "success" : "info"
      );
      router.refresh();
    } catch {
      setChecked(!next);
      toast.push("ذخیره نشد؛ دوباره تلاش کنید.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={toggle}
      disabled={busy}
      className={cx(
        "relative min-h-[44px] min-w-[52px] rounded-full p-0.5 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:opacity-70",
        checked && "drop-shadow-sm"
      )}
    >
      <SwitchVisual checked={checked} size={size} />
      {busy ? (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner className="h-4 w-4 text-white drop-shadow" />
        </span>
      ) : null}
    </button>
  );
}
