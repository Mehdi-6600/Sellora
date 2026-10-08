"use client";

// App-wide error boundary. Deliberately shows NO stack traces, error ids or
// internal messages: the details are logged server-side only.

import { useEffect } from "react";
import Link from "next/link";
import { SelloraEmblem, SelloraLockup } from "@/components/brand/sellora";
import { IconAlert } from "@/components/layout/icons";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side logs already contain the real error; this keeps a client
    // breadcrumb without exposing internals in the UI.
    console.error("[sellora] page error", error.digest ?? "unknown");
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-5 w-fit">
          <SelloraLockup size={44} />
        </div>
        <div className="mx-auto w-fit">
          <SelloraEmblem size={124} feather />
        </div>

        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700">
          <IconAlert size={14} />
          خطای موقت
        </span>
        <h1 className="mt-2 text-[20px] font-extrabold text-ink-950">خطایی پیش آمد</h1>
        <p className="mt-2 text-[13px] leading-7 text-ink-500">
          مشکلی در نمایش این صفحه رخ داد. داده‌های شما دست‌نخورده است؛ یک‌بار دیگر تلاش کنید. اگر
          تکرار شد، کمی بعد سر بزنید.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="btn-primary min-h-[48px] sm:w-auto"
          >
            تلاش دوباره
          </button>
          <Link href="/dashboard" className="btn-secondary min-h-[48px] sm:w-auto">
            داشبورد
          </Link>
        </div>
      </div>
    </div>
  );
}
