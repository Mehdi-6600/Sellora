import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { dict } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }
  const [ig, productCount, auto] = await Promise.all([
    prisma.instagramAccount.findUnique({ where: { businessId: auth.businessId } }),
    prisma.product.count({ where: { businessId: auth.businessId } }),
    prisma.automationConfig.findUnique({ where: { businessId: auth.businessId } }),
  ]);

  const steps = [
    { n: 1, title: dict.onboarding.step1, done: ig?.status === "CONNECTED", href: "/settings/instagram" },
    { n: 2, title: dict.onboarding.step2, done: true, href: "/settings/business" },
    { n: 3, title: dict.onboarding.step3, done: true, href: "/settings/business" },
    { n: 4, title: dict.onboarding.step4, done: productCount > 0, href: "/products" },
    { n: 5, title: dict.onboarding.step5, done: true, href: "/settings/instagram" },
    { n: 6, title: dict.onboarding.step6, done: auto?.enabled ?? false, href: "/settings" },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <AppShell title={dict.onboarding.welcome} subtitle={dict.onboarding.welcomeDesc}>
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-ink-500">پیشرفت</div>
          <div className="text-sm font-semibold">{doneCount}/{steps.length}</div>
        </div>
        <div className="h-2 bg-ink-100 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
        </div>
      </Card>
      <div className="space-y-2">
        {steps.map((s) => (
          <Link key={s.n} href={s.href} className="card p-4 flex items-center gap-3">
            <div
              className={`h-9 w-9 rounded-xl grid place-items-center font-bold text-sm ${
                s.done ? "bg-emerald-100 text-emerald-700" : "bg-ink-100 text-ink-500"
              }`}
            >
              {s.done ? "✓" : s.n}
            </div>
            <div className="flex-1 font-medium">{s.title}</div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-400 rtl:rotate-180">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
        ))}
      </div>
      <div className="mt-6">
        <Link href="/dashboard" className="btn-secondary w-full inline-flex">
          بعداً — رفتن به داشبورد
        </Link>
      </div>
    </AppShell>
  );
}
