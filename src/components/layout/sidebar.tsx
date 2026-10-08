"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils/format";
import { SelloraLockup } from "@/components/brand/sellora";
import {
  ACCOUNT_NAV,
  ADMIN_NAV,
  PRIMARY_NAV,
  SECONDARY_NAV,
  isActive,
  type NavItem,
} from "./nav-items";

function NavLink({ item, pathname, badge }: { item: NavItem; pathname: string; badge?: number }) {
  const active = isActive(pathname, item);
  const Icon = item.Icon;

  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cx(
          "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13.5px] transition-all duration-200 ease-smooth",
          active
            ? "bg-white font-bold text-brand-700 shadow-card"
            : "font-semibold text-ink-500 hover:bg-white/70 hover:text-ink-800"
        )}
      >
        <span
          aria-hidden="true"
          className={cx(
            "absolute inset-y-2 -start-2 w-1 rounded-full transition-opacity duration-200",
            active ? "bg-brand-gradient opacity-100" : "opacity-0"
          )}
        />
        <span
          className={cx(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-colors duration-200",
            active
              ? "border-brand-100 bg-brand-50 text-brand-600"
              : "border-transparent bg-canvas-soft text-ink-400 group-hover:text-ink-600"
          )}
        >
          <Icon size={18} active={active} />
        </span>
        <span className="truncate">{item.label}</span>
        {badge && badge > 0 ? (
          <span className="ms-auto grid min-w-[1.5rem] place-items-center rounded-full bg-brand-600 px-1.5 py-0.5 text-[10.5px] font-bold text-white">
            {badge}
          </span>
        ) : null}
      </Link>
    </li>
  );
}

function Group({
  title,
  items,
  pathname,
  badge,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  badge?: number;
}) {
  return (
    <div>
      <div className="px-4 pb-1.5 text-[10.5px] font-bold tracking-wide text-ink-300">{title}</div>
      <ul className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            badge={item.href === "/notifications" ? badge : undefined}
          />
        ))}
      </ul>
    </div>
  );
}

export type SidebarProps = {
  unread: number;
  isAdmin: boolean;
  userName: string;
  userEmail: string;
  businessName: string;
  role: string;
};

export function SidebarNav({ unread, isAdmin, userName, userEmail, businessName, role }: SidebarProps) {
  const pathname = usePathname() || "";
  const initials = (userName || userEmail || "س").trim().slice(0, 1);

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:start-0 lg:z-40 lg:flex lg:w-[17.5rem] lg:flex-col lg:border-e lg:border-ink-100/80 lg:bg-white/80 lg:px-4 lg:py-6 lg:shadow-side lg:backdrop-blur-xl">
      <Link href="/dashboard" className="mx-2 mb-6 inline-flex rounded-2xl focus-visible:outline-none">
        <SelloraLockup size={40} />
      </Link>

      <nav aria-label="ناوبری اصلی" className="flex-1 space-y-5 overflow-y-auto">
        <Group title="میزکار" items={PRIMARY_NAV} pathname={pathname} />
        <Group title="رشد و راه‌اندازی" items={SECONDARY_NAV} pathname={pathname} />
        <Group title="حساب" items={ACCOUNT_NAV} pathname={pathname} badge={unread} />
        {isAdmin ? <Group title="مدیریت" items={ADMIN_NAV} pathname={pathname} /> : null}
      </nav>

      <div className="mt-4 rounded-card border border-ink-100/80 bg-canvas-soft/70 p-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-[15px] font-extrabold text-white shadow-glowSoft"
          >
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-bold text-ink-900">{userName || userEmail}</div>
            <div className="truncate text-[11px] text-ink-500">
              {businessName}
              <span className="text-ink-300"> · </span>
              {role === "OWNER" ? "مالک" : role === "ADMIN" ? "مدیر" : "عضو"}
            </div>
          </div>
        </div>
        <form action="/api/auth/logout" method="post" className="mt-2.5">
          <button
            type="submit"
            className="flex min-h-[38px] w-full items-center justify-center gap-2 rounded-xl border border-ink-100 bg-white px-3 text-[12px] font-semibold text-ink-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
          >
            خروج از حساب
          </button>
        </form>
      </div>
    </aside>
  );
}
