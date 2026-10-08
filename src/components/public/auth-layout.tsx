import * as React from "react";
import Link from "next/link";
import { SelloraEmblem, SelloraLockup, SelloraMark, BrandAura } from "@/components/brand/sellora";
import { SITE_NAME } from "@/lib/config/site";
import { IconCheck } from "@/components/layout/icons";

/**
 * Shared shell for the login / signup screens.
 *
 * Phone: brand plate with the original artwork, a short promise and the form —
 * everything above the fold, comfortable thumb reach.
 * Desktop: a deep-violet panel carrying the character and the product promise
 * next to a frosted lavender form card, so the first impression is a product,
 * not a form on an empty page. The purple canvas is the same as every other
 * screen; only the depth changes.
 */
export function AuthLayout({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const promises = [
    "پاسخ خودکار به دایرکت، از داده‌های خودتان",
    "تشخیص مشتری داغ و اعلان فوری",
    "تحویل گفتگوهای حساس به خودتان",
  ];

  return (
    <div className="relative min-h-screen lg:flex">
      {/* ------------------------------------------------------- brand panel */}
      <aside className="relative hidden overflow-hidden bg-brand-gradient p-10 text-white lg:flex lg:w-[46%] lg:flex-col xl:w-[42%]">
        <BrandAura />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -start-10 opacity-25"
        >
          <SelloraEmblem size={340} tone="white" feather />
        </span>

        <Link
          href="/"
          aria-label="سلورا — صفحه اصلی"
          className="relative inline-flex w-fit rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
        >
          <SelloraLockup size={44} variant="bare" priority />
        </Link>

        <div className="relative mt-auto">
          <p className="text-[13px] font-semibold text-white/80">
            فروشنده و پشتیبان خودکار اینستاگرام
          </p>
          <h2 className="mt-3 max-w-md text-[30px] font-extrabold leading-[1.35]">
            هیچ دایرکتی بی‌جواب نمی‌ماند، حتی نیمه‌شب.
          </h2>
          <ul className="mt-6 space-y-2.5">
            {promises.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-[13px] leading-6 text-white/90">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/20">
                  <IconCheck size={12} />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[11.5px] leading-6 text-white/70">
            {SITE_NAME} — اتصال اینستاگرام فقط از طریق ورود رسمی متا انجام می‌شود.
          </p>
        </div>
      </aside>

      {/* -------------------------------------------------------- form panel */}
      <main className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link
              href="/"
              aria-label="سلورا — صفحه اصلی"
              className="inline-flex items-center rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
            >
              <span className="hidden min-[360px]:inline-flex">
                <SelloraLockup size={38} priority />
              </span>
              <SelloraMark size={38} glow className="min-[360px]:hidden" />
            </Link>
            <Link href="/" className="text-[12px] font-semibold text-ink-500 hover:text-brand-700">
              صفحه اصلی
            </Link>
          </div>

          <div className="relative mb-5 hidden lg:block">
            <SelloraEmblem size={92} />
          </div>

          <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-ink-950">
            {title}
          </h1>
          {subtitle ? <p className="mt-1.5 text-[13px] leading-6 text-ink-500">{subtitle}</p> : null}

          <div className="card mt-6 p-4 sm:p-6">{children}</div>

          {footer ? (
            <p className="mt-5 text-center text-[12.5px] text-ink-500">{footer}</p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
