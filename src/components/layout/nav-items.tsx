import * as React from "react";
import {
  IconGrid,
  IconBag,
  IconBolt,
  IconBell,
  IconCog,
  IconDashboard,
  IconFlame,
  IconInbox,
  IconPulse,
  IconSparkle,
  IconCard,
  type IconProps,
} from "./icons";

/**
 * The single navigation model for the whole app.
 *
 * Rules this file exists to enforce:
 *  · Every item points at a route that really exists and really works —
 *    no dead links, no "coming soon" placeholders in the nav.
 *  · Sidebar (desktop), bottom bar (phone) and the More page all read from
 *    this one list, so labels and icons can never drift apart.
 */

export type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<IconProps>;
  /** When true only the exact path matches (section roots with sub-pages). */
  exact?: boolean;
};

/** The four destinations that earn a permanent slot on the phone. */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "داشبورد", Icon: IconDashboard },
  { href: "/conversations", label: "گفتگوها", Icon: IconInbox },
  { href: "/automations", label: "خودکارسازی", Icon: IconBolt },
  { href: "/products", label: "محصولات", Icon: IconBag },
];

export const MORE_NAV: NavItem = { href: "/more", label: "بیشتر", Icon: IconGrid };
export const MAIN_NAV = [...PRIMARY_NAV, MORE_NAV];

/** Secondary tools, grouped on More on every screen. */
export const SECONDARY_NAV: NavItem[] = [
  { href: "/leads", label: "مشتری‌های داغ", Icon: IconFlame },
  { href: "/onboarding", label: "راه‌اندازی سریع", Icon: IconSparkle },
];

export const ACCOUNT_NAV: NavItem[] = [
  { href: "/notifications", label: "اعلان‌ها", Icon: IconBell },
  { href: "/settings", label: "تنظیمات", Icon: IconCog },
  // Public feature/comparison page — reachable for signed-in owners from the
  // sidebar and the phone "بیشتر" sheet (both read this list).
  { href: "/why-sellora", label: "چرا Sellora؟", Icon: IconSparkle },
];

/** Secondary destinations for the More page. */
export const SHEET_NAV: NavItem[] = [...SECONDARY_NAV, ...ACCOUNT_NAV];

/** Admin-only operational screens (wired to real admin routes). */
export const ADMIN_NAV: NavItem[] = [
  { href: "/admin/subscriptions", label: "بررسی اشتراک‌ها", Icon: IconCard },
  { href: "/admin/system", label: "سلامت سیستم", Icon: IconPulse },
];

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href + "/");
}
