"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils/format";
import { PRIMARY_NAV, SHEET_NAV, ADMIN_NAV, isActive } from "./nav-items";
import { IconGrid, IconLogout, IconUser, IconArrowRight } from "./icons";

/**
 * Phone navigation.
 *
 * Four primary destinations stay visible in a comfortable 56px+ tap target;
 * everything else lives in a bottom sheet that opens above the bar. The sheet
 * closes on Escape, on backdrop tap and on route change, locks the page scroll
 * while open, and moves focus into the sheet so keyboard and screen-reader
 * users are not left behind the overlay.
 */
export function BottomNav({
  unread = 0,
  isAdmin = false,
  userName = "",
  userEmail = "",
}: {
  unread?: number;
  isAdmin?: boolean;
  userName?: string | null;
  userEmail?: string | null;
}) {
  const pathname = usePathname() || "";
  const [open, setOpen] = React.useState(false);
  const sheetRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  // Close the sheet whenever the route changes.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sheetRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const sheetActive =
    open || SHEET_NAV.some((i) => isActive(pathname, i)) || (isAdmin && pathname.startsWith("/admin"));

  return (
    <>
      {/* --------------------------------------------------------- more sheet */}
      <div
        className={cx(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={open ? undefined : true}
      >
        <div
          onClick={() => setOpen(false)}
          className={cx(
            "absolute inset-0 bg-ink-950/45 backdrop-blur-[2px] transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          ref={sheetRef}
          tabIndex={-1}
          role="dialog"
          aria-modal={open ? true : undefined}
          aria-label="بیشتر"
          className={cx(
            "absolute inset-x-0 bottom-0 rounded-t-sheet border border-ink-100/80 bg-canvas-soft p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] shadow-[0_-18px_40px_-24px_rgba(31,16,66,0.45)] transition-transform duration-300 ease-smooth focus:outline-none",
            open ? "translate-y-0" : "translate-y-full"
          )}
        >
          <div aria-hidden="true" className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ink-100" />

          <div className="flex items-center gap-3 rounded-2xl border border-ink-100/80 bg-white/70 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <span
              aria-hidden="true"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-[15px] font-extrabold text-white shadow-glowSoft ring-1 ring-inset ring-white/15"
            >
              {(userName || userEmail || "س").trim().slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-bold text-ink-900">{userName || "حساب من"}</div>
              <div className="truncate text-[11px] text-ink-500" dir="ltr">
                {userEmail ?? ""}
              </div>
            </div>
            <IconUser size={18} className="shrink-0 text-ink-300" />
          </div>

          <ul className="mt-3 space-y-1.5">
            {SHEET_NAV.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.Icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "flex min-h-[56px] items-center gap-3 rounded-2xl border px-3 transition-colors",
                      active
                        ? "border-brand-100 bg-brand-50/70 text-brand-700"
                        : "border-ink-100/80 bg-white text-ink-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                    )}
                  >
                    <span
                      className={cx(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                        active ? "bg-white text-brand-600" : "bg-canvas-soft text-ink-400"
                      )}
                    >
                      <Icon size={19} active={active} />
                    </span>
                    <span className="flex-1 text-[13.5px] font-semibold">{item.label}</span>
                    {item.href === "/notifications" && unread > 0 ? (
                      <span className="grid min-w-[1.5rem] place-items-center rounded-full bg-brand-600 px-1.5 py-0.5 text-[10.5px] font-bold text-white">
                        {unread}
                      </span>
                    ) : (
                      <IconArrowRight size={16} className="text-ink-300 rtl:rotate-180" />
                    )}
                  </Link>
                </li>
              );
            })}

            {isAdmin
              ? ADMIN_NAV.map((item) => {
                  const Icon = item.Icon;
                  const active = isActive(pathname, item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cx(
                          "flex min-h-[56px] items-center gap-3 rounded-2xl border px-3 transition-colors",
                          active
                            ? "border-brand-100 bg-brand-50/70 text-brand-700"
                            : "border-ink-100/80 bg-white text-ink-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                        )}
                      >
                        <span
                          className={cx(
                            "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                            active ? "bg-white text-brand-600" : "bg-canvas-soft text-ink-400"
                          )}
                        >
                          <Icon size={19} active={active} />
                        </span>
                        <span className="flex-1 text-[13.5px] font-semibold">{item.label}</span>
                        <IconArrowRight size={16} className="text-ink-300 rtl:rotate-180" />
                      </Link>
                    </li>
                  );
                })
              : null}
          </ul>

          <form action="/api/auth/logout" method="post" className="mt-3">
            <button
              type="submit"
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 text-[13px] font-bold text-red-600 transition active:scale-[0.99]"
            >
              <IconLogout size={18} />
              خروج از حساب
            </button>
          </form>
        </div>
      </div>

      {/* ------------------------------------------------------------- the bar */}
      <nav
        aria-label="ناوبری پایین"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100/80 glass-bar pb-[env(safe-area-inset-bottom,0px)] shadow-nav lg:hidden"
      >
        <ul className="mx-auto flex max-w-lg items-stretch">
          {PRIMARY_NAV.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.Icon;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="flex min-h-[3.6rem] flex-col items-center justify-center gap-1 px-1 py-2 transition-transform duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-brand-100"
                >
                  <span
                    className={cx(
                      "grid h-7 w-12 place-items-center rounded-full transition-colors duration-200",
                      active ? "bg-brand-50 text-brand-700" : "text-ink-400"
                    )}
                  >
                    <Icon size={21} active={active} />
                  </span>
                  <span
                    className={cx(
                      "text-[10.5px] leading-none",
                      active ? "font-bold text-brand-700" : "font-semibold text-ink-500"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}

          <li className="flex-1">
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-haspopup="dialog"
              className="flex min-h-[3.6rem] w-full flex-col items-center justify-center gap-1 px-1 py-2 transition-transform duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-brand-100"
            >
              <span
                className={cx(
                  "relative grid h-7 w-12 place-items-center rounded-full transition-colors duration-200",
                  sheetActive ? "bg-brand-50 text-brand-700" : "text-ink-400"
                )}
              >
                <IconGrid size={21} active={sheetActive} />
                {unread > 0 ? (
                  <span
                    aria-hidden="true"
                    className="absolute end-2 top-0 h-2 w-2 rounded-full bg-brand-600 ring-2 ring-white"
                  />
                ) : null}
              </span>
              <span
                className={cx(
                  "text-[10.5px] leading-none",
                  sheetActive ? "font-bold text-brand-700" : "font-semibold text-ink-500"
                )}
              >
                بیشتر
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
