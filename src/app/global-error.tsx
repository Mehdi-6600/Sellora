"use client";

// Last-resort boundary for failures inside the root layout itself. Must render
// a complete <html> document. No internal details are shown.

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen grid place-items-center bg-ink-50 px-6 text-ink-900">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-bold mb-2">خطایی پیش آمد</h1>
          <p className="text-sm text-ink-500 leading-7 mb-6">
            بارگذاری برنامه ممکن نشد. لطفاً دوباره تلاش کنید.
          </p>
          <button type="button" onClick={reset} className="btn-primary min-h-[44px]">
            تلاش دوباره
          </button>
        </div>
      </body>
    </html>
  );
}
