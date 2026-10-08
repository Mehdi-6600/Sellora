import Link from "next/link";
import { SITE_NAME } from "@/lib/config/site";

/**
 * Shared chrome for public (unauthenticated) marketing pages: a real semantic
 * header with navigation, and a footer. The authenticated app keeps its own
 * mobile AppShell; this shell is deliberately separate so marketing pages can
 * use a wider, content-first layout.
 */
export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-ink-900 flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-ink-100">
        <nav
          aria-label="ناوبری اصلی"
          className="mx-auto w-full max-w-5xl px-4 h-14 flex items-center gap-3"
        >
          <Link href="/" className="flex items-center gap-2 min-h-[44px]">
            <span
              aria-hidden="true"
              className="h-8 w-8 rounded-xl bg-brand-600 text-white grid place-items-center font-bold text-sm"
            >
              S
            </span>
            <span className="font-bold">{SITE_NAME}</span>
          </Link>
          <div className="flex-1" />
          <div className="hidden sm:flex items-center gap-1 text-sm">
            <a
              href="#features"
              className="px-3 py-2 rounded-xl text-ink-600 hover:text-ink-900 hover:bg-ink-50 min-h-[44px] inline-flex items-center"
            >
              قابلیت‌ها
            </a>
            <a
              href="#pricing"
              className="px-3 py-2 rounded-xl text-ink-600 hover:text-ink-900 hover:bg-ink-50 min-h-[44px] inline-flex items-center"
            >
              قیمت‌ها
            </a>
            <Link
              href="/why-sellora"
              className="px-3 py-2 rounded-xl text-ink-600 hover:text-ink-900 hover:bg-ink-50 min-h-[44px] inline-flex items-center"
            >
              چرا سلورا؟
            </Link>
          </div>
          <Link
            href="/login"
            className="px-3 py-2 rounded-xl text-sm font-medium text-ink-700 hover:bg-ink-50 min-h-[44px] inline-flex items-center"
          >
            ورود
          </Link>
          <Link
            href="/signup"
            className="btn-primary text-sm min-h-[44px]"
            style={{ padding: "0.6rem 1rem" }}
          >
            شروع رایگان
          </Link>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-ink-100 bg-ink-50">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-7 w-7 rounded-lg bg-brand-600 text-white grid place-items-center font-bold text-xs"
            >
              S
            </span>
            <span className="text-sm font-semibold">{SITE_NAME}</span>
          </div>
          <p className="text-xs text-ink-500 leading-6 flex-1">
            فروشنده و پشتیبان خودکار اینستاگرام برای کسب‌وکارهای کوچک ایرانی.
          </p>
          <nav aria-label="پیوندهای پانوشت" className="flex items-center gap-4 text-xs text-ink-600">
            <Link href="/why-sellora" className="hover:text-ink-900 min-h-[44px] inline-flex items-center">
              چرا سلورا؟
            </Link>
            <Link href="/signup" className="hover:text-ink-900 min-h-[44px] inline-flex items-center">
              ثبت‌نام
            </Link>
            <Link href="/login" className="hover:text-ink-900 min-h-[44px] inline-flex items-center">
              ورود
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
