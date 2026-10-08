"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MAIN_NAV, isActive } from "./nav-items";
import { cx } from "@/lib/utils/format";

/** More is a destination, not an overlay: navigation is never covered. */
export function BottomNav(_props: { unread?: number; isAdmin?: boolean; userName?: string | null; userEmail?: string | null }) {
  const pathname = usePathname() || "";
  return (
    <nav aria-label="ناوبری اصلی موبایل" className="bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 shadow-nav backdrop-blur-xl lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5 px-2">
        {MAIN_NAV.map((item) => {
          const active = item.href === "/more"
            ? !MAIN_NAV.slice(0, 4).some((i) => isActive(pathname, i))
            : isActive(pathname, item);
          return <li key={item.href}>
            <Link href={item.href} aria-current={active ? "page" : undefined} className={cx("flex min-h-[66px] flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold", active ? "text-brand-700" : "text-ink-500 hover:bg-ink-50")}>
              <span className={cx("rounded-xl px-3 py-1", active && "bg-brand-50")}><item.Icon size={21} /></span>
              {item.label}
            </Link>
          </li>;
        })}
      </ul>
    </nav>
  );
}
