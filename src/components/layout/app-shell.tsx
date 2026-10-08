import * as React from "react";
import Link from "next/link";
import { getServerDict } from "@/lib/i18n";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { unreadCount } from "@/lib/notifications";
import { SelloraMark } from "@/components/brand/sellora";
import { SidebarNav } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { NotificationBell } from "./notification-bell";
import { IconChevronLeft } from "./icons";

type Chrome = {
  unread: number;
  isAdmin: boolean;
  role: string;
  userName?: string | null;
  userEmail?: string | null;
  businessName?: string | null;
};

/**
 * Shared chrome for every authenticated page.
 *
 * Desktop: fixed sidebar + sticky page bar.
 * Mobile : compact sticky header (back or brand mark, page title, bell, page
 *          actions) + bottom navigation with a "more" sheet.
 *
 * Session, business and unread-count are resolved once here and shared with
 * the three pieces of chrome, so navigating a page costs one extra indexed
 * count query at most. Every failure path degrades to a chrome-less shell —
 * a notification hiccup must never take a page down.
 */
async function loadChrome(): Promise<Chrome> {
  const fallback = (role = "OWNER"): Chrome => ({ unread: 0, isAdmin: false, role });
  let session = null;
  try {
    session = await getSession();
  } catch {
    return fallback();
  }
  if (!session) return fallback();

  try {
    const [unread, user, business] = await Promise.all([
      unreadCount(session.bid),
      prisma.user.findUnique({
        where: { id: session.uid },
        select: { name: true, email: true, isAdmin: true },
      }),
      prisma.business.findUnique({ where: { id: session.bid }, select: { name: true } }),
    ]);
    return {
      unread,
      isAdmin: Boolean(user?.isAdmin),
      role: String(session.role ?? "OWNER"),
      userName: user?.name ?? null,
      userEmail: user?.email ?? null,
      businessName: business?.name ?? null,
    };
  } catch (err) {
    console.error("[app-shell] chrome data failed:", err);
    return fallback(session.role);
  }
}

export async function AppShell({
  title,
  subtitle,
  backHref,
  actions,
  wide = false,
  children,
}: {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  backHref?: string;
  actions?: React.ReactNode;
  /** Opt in to the wider content column (inbox, dashboard, admin tables). */
  wide?: boolean;
  children: React.ReactNode;
}) {
  const [{ dict }, chrome] = await Promise.all([getServerDict(), loadChrome()]);
  const plainTitle = typeof title === "string" ? title : "سلورا";

  return (
    <div className="min-h-screen">
      <SidebarNav
        userName={chrome.userName ?? ""}
        userEmail={chrome.userEmail ?? ""}
        businessName={chrome.businessName ?? ""}
        role={chrome.role}
        unread={chrome.unread}
        isAdmin={chrome.isAdmin}
      />

      <div className="lg:ps-[17.5rem]">
        {/* ---------------------------------------------------- mobile header */}
        <header className="sticky top-0 z-30 border-b border-ink-100/70 glass-bar lg:hidden">
          <div className="app-container flex items-center gap-2.5 py-2.5">
            {backHref ? (
              <Link
                href={backHref}
                aria-label="بازگشت"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-ink-100 bg-white/[0.06] text-ink-700 transition hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
              >
                <IconChevronLeft size={20} className="rtl:rotate-180" />
              </Link>
            ) : (
              <Link
                href="/dashboard"
                aria-label="سلورا — داشبورد"
                className="shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
              >
                <SelloraMark size={34} glow />
              </Link>
            )}

            <div className="min-w-0 flex-1">
              {/* Not a heading: the desktop bar owns the page <h1>. */}
              <div className="truncate text-[15px] font-extrabold tracking-tight text-ink-950">
                {title ?? dict.app.name}
              </div>
              {subtitle ? (
                <div className="truncate text-[11px] font-medium text-ink-500">{subtitle}</div>
              ) : null}
            </div>

            <NotificationBell unread={chrome.unread} label={dict.notifications.bellAria} />
            {actions}
          </div>
        </header>

        {/* --------------------------------------------------- desktop header */}
        <header className="sticky top-0 z-30 hidden border-b border-ink-100/70 glass-bar lg:block">
          <div className="app-container flex min-h-[76px] items-center gap-3 py-3">
            {backHref ? (
              <Link
                href={backHref}
                aria-label="بازگشت"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-ink-100 bg-white/[0.06] text-ink-700 transition hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
              >
                <IconChevronLeft size={20} className="rtl:rotate-180" />
              </Link>
            ) : null}
            <div className="min-w-0 flex-1">
              <h1 className="page-title truncate">{title ?? dict.app.name}</h1>
              {subtitle ? <p className="page-subtitle truncate">{subtitle}</p> : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {actions}
              <NotificationBell unread={chrome.unread} label={dict.notifications.bellAria} />
            </div>
          </div>
        </header>

        <main
          className={
            wide
              ? "app-container pb-28 pt-4 lg:max-w-7xl lg:pb-12 lg:pt-6"
              : "app-container pb-28 pt-4 lg:pb-12 lg:pt-6"
          }
        >
          {children}
        </main>
      </div>

      <BottomNav
        unread={chrome.unread}
        isAdmin={chrome.isAdmin}
        userName={chrome.userName}
        userEmail={chrome.userEmail}
      />
    </div>
  );
}
