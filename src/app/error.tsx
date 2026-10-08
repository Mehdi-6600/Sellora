"use client";

// App-wide error boundary. Deliberately shows NO stack traces, error ids or
// internal messages: the details are logged server-side only.

import { useEffect } from "react";
import Link from "next/link";

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
    <div className="min-h-screen grid place-items-center bg-ink-50 px-6">
      <div className="text-center max-w-sm">
        <div aria-hidden="true" className="text-5xl mb-4">
          ⚠️
        </div>
        <h1 className="text-xl font-bold text-ink-900 mb-2">خطایی پیش آمد</h1>
        <p className="text-sm text-ink-500 leading-7 mb-6">
          مشکلی در نمایش این صفحه رخ داد. اگر با تلاش دوباره حل نشد، کمی بعد مراجعه کنید.
        </p>
        <div className="flex gap-2 justify-center">
          <button type="button" onClick={reset} className="btn-primary min-h-[44px]">
            تلاش دوباره
          </button>
          <Link href="/dashboard" className="btn-secondary min-h-[44px]">
            داشبورد
          </Link>
        </div>
      </div>
    </div>
  );
}
