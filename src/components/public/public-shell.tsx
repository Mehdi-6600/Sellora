import Link from "next/link";
import { SITE_NAME } from "@/lib/config/site";
import { SelloraLockup, SelloraMark } from "@/components/brand/sellora";
import { IconGrid, IconClose } from "@/components/layout/icons";

/**
 * Shared chrome for public (unauthenticated) marketing pages: a real semantic
 * header with navigation, and a footer. The authenticated app keeps its own
 * mobile AppShell; this shell is deliberately separate so marketing pages can
 * use a wider, content-first layout.
 *
 * The mobile menu is a native <details> disclosure — no client JavaScript, and
 * it works with a keyboard exactly like any other disclosure.
 */
const NAV = [
  { href: "#features", label: "قابلیت‌ها" },
  { href: "#pricing", label: "قیمت‌ها" },
  { href: "/why-sellora", label: "چرا سلورا؟" },
];

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col text-ink-900">
      <header className="sticky top-0 z-30 border-b border-ink-100/70 glass-bar">
        <nav
          aria-label="ناوبری اصلی"
          className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6"
        >
          <Link href="/" className="inline-flex rounded-2xl focus-visible:outline-none">
            <SelloraLockup size={38} />
          </Link>

          <div className="flex-1" />

          <ul className="hidden items-center gap-1 text-[13px] font-semibold text-ink-600 sm:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="inline-flex min-h-[44px] items-center rounded-xl px-3 transition hover:bg-canvas-soft hover:text-ink-900"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <Link
            href="/login"
            className="hidden min-h-[44px] items-center rounded-xl px-3 text-[13px] font-semibold text-ink-700 transition hover:bg-canvas-soft sm:inline-flex"
          >
            ورود
          </Link>
          <Link href="/signup" className="btn-primary min-h-[44px] px-4 py-2 text-[13px]">
            شروع رایگان
          </Link>

          {/* Mobile menu (native disclosure) */}
          <details className="group relative sm:hidden">
            <summary
              aria-label="منوی صفحه"
              className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-xl border border-ink-100 bg-white/70 text-ink-700 transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
            >
              <IconGrid size={18} className="group-open:hidden" />
              <IconClose size={18} className="hidden group-open:block" />
            </summary>
            <div className="card absolute end-0 top-12 z-40 w-52 animate-fade-up p-2">
              <ul className="text-[13px] font-semibold">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="flex min-h-[44px] items-center rounded-xl px-3 text-ink-700 transition hover:bg-canvas-soft"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
                <li>
                  <Link
                    href="/login"
                    className="flex min-h-[44px] items-center rounded-xl px-3 text-ink-700 transition hover:bg-canvas-soft"
                  >
                    ورود
                  </Link>
                </li>
              </ul>
            </div>
          </details>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-ink-100/70 bg-white/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <SelloraMark size={40} glow />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-extrabold text-ink-950">{SITE_NAME}</span>
                <span className="text-[11px] font-semibold text-ink-400" dir="ltr">
                  Sellora
                </span>
              </div>
              <p className="mt-0.5 max-w-md text-[11.5px] leading-6 text-ink-500">
                فروشنده و پشتیبان خودکار اینستاگرام برای کسب‌وکارهای کوچک ایرانی.
              </p>
            </div>
          </div>

          <nav
            aria-label="پیوندهای پانوشت"
            className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] font-semibold text-ink-600 lg:ms-auto"
          >
            <Link href="/why-sellora" className="inline-flex min-h-[44px] items-center hover:text-brand-700">
              چرا سلورا؟
            </Link>
            <Link href="/signup" className="inline-flex min-h-[44px] items-center hover:text-brand-700">
              ثبت‌نام
            </Link>
            <Link href="/login" className="inline-flex min-h-[44px] items-center hover:text-brand-700">
              ورود
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
