import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { SHEET_NAV, ADMIN_NAV } from "@/components/layout/nav-items";
import { IconCard, IconInstagram, IconChevronLeft } from "@/components/layout/icons";

export const dynamic = "force-dynamic";
export default async function MorePage() {
  let auth;
  try { auth = await requireAuth(); } catch { redirect("/login"); }
  const groups = [
    { title: "حساب و اتصال‌ها", items: [SHEET_NAV.find(i => i.href === "/settings")!, {href:"/settings/subscription", label:"اشتراک و پرداخت", Icon:IconCard}, {href:"/settings/instagram", label:"اتصال اینستاگرام", Icon:IconInstagram}] },
    { title: "ابزارها و راهنما", items: SHEET_NAV.filter(i => i.href !== "/settings") },
    ...(auth.user.isAdmin ? [{title:"مدیریت", items:ADMIN_NAV}] : []),
  ];
  return <AppShell title="بیشتر" subtitle="حساب، ابزارها و راهنما" backHref="/dashboard">
    <div className="max-w-2xl space-y-7">
      <p className="text-sm text-ink-500">{auth.business.name} · {auth.user.name || auth.user.email}</p>
      {groups.map(group => <section key={group.title}>
        <h2 className="mb-3 text-sm font-bold text-ink-700">{group.title}</h2>
        <ul className="card divide-y divide-ink-100 overflow-hidden">
          {group.items.map(item => <li key={item.href}><Link href={item.href} className="flex min-h-[64px] items-center gap-3 px-4 py-3 hover:bg-ink-50">
            <span className="icon-tile"><item.Icon size={20}/></span>
            <span className="flex-1 text-sm font-semibold">{item.label}</span>
            <IconChevronLeft size={17} className="rtl:rotate-180 text-ink-400"/>
          </Link></li>)}
        </ul>
      </section>)}
    </div>
  </AppShell>;
}
