import * as React from "react";
import { BottomNav } from "./bottom-nav";
import Link from "next/link";

export function AppShell({
  title,
  subtitle,
  backHref,
  actions,
  children,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  backHref?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink-50 pb-20">
      <header className="sticky top-0 z-30 bg-ink-50/85 backdrop-blur border-b border-ink-100">
        <div className="mx-auto w-full max-w-md px-4 py-3 flex items-center gap-2">
          {backHref ? (
            <Link href={backHref} className="p-2 -m-2 rounded-lg hover:bg-ink-100" aria-label="بازگشت">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-brand-600 text-white grid place-items-center font-bold text-sm">S</div>
              <div className="font-bold text-ink-900">سلورا</div>
            </Link>
          )}
          <div className="flex-1" />
          {actions}
        </div>
        {(title || subtitle) && (
          <div className="mx-auto w-full max-w-md px-4 pb-3">
            {title && <h1 className="text-xl font-bold text-ink-900">{title}</h1>}
            {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
          </div>
        )}
      </header>
      <main className="mx-auto w-full max-w-md px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}
