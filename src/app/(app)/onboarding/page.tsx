import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { META_APP_ID } from "@/lib/meta/config";
import { toPersianDigits } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

/**
 * Onboarding progress is derived only from real state: every step's "done"
 * flag is computed from the tenant's actual rows. Steps whose feature is not
 * available in this deployment (Instagram connect without a configured Meta
 * app) are shown as optional and excluded from the progress denominator —
 * the progress bar never lies.
 */
export default async function OnboardingPage() {
  const { dict } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }

  const [ig, productCount, auto, ruleset] = await Promise.all([
    prisma.instagramAccount.findUnique({ where: { businessId: auth.businessId } }),
    prisma.product.count({ where: { businessId: auth.businessId, status: { not: "ARCHIVED" } } }),
    prisma.automationConfig.findUnique({ where: { businessId: auth.businessId } }),
    prisma.businessRuleset.findFirst({
      where: { businessId: auth.businessId, isActive: true },
      orderBy: { version: "desc" },
    }),
  ]);

  const businessInfoDone = Boolean(
    ruleset?.address || ruleset?.phone || ruleset?.shippingInfo || ruleset?.paymentMethods
  );

  const metaConfigured = Boolean(META_APP_ID);
  const instagramDone = ig?.status === "CONNECTED";

  const steps = [
    {
      n: 1,
      title: "محصولاتت را اضافه کن",
      desc: "تکی یا دسته‌جمعی. سلورا برای جواب دادن به قیمت و موجودی به این‌ها نیاز دارد.",
      done: productCount > 0,
      href: "/products",
      optional: false,
    },
    {
      n: 2,
      title: "اطلاعات کسب‌وکار را کامل کن",
      desc: "آدرس، تماس، ارسال و ساعات کاری؛ تا سلورا بدون حدس جواب بدهد.",
      done: businessInfoDone,
      href: "/settings/business",
      optional: false,
    },
    {
      n: 3,
      title: "اینستاگرام کسب‌وکار را متصل کن",
      desc: metaConfigured
        ? "از طریق ورود رسمی متا؛ رمز اینستاگرام تو ذخیره نمی‌شود."
        : "در این استقرار Meta پیکربندی نشده، بنابراین این قدم فعلاً اختیاری است.",
      done: instagramDone,
      href: "/settings/instagram",
      optional: !metaConfigured,
    },
    {
      n: 4,
      title: "پاسخ‌گویی خودکار را روشن کن",
      desc: "تا سلورا به‌جای تو به دایرکت‌ها جواب بدهد و داغ‌ها را خبرت کند.",
      done: Boolean(auto?.enabled),
      href: "/settings",
      optional: false,
    },
  ];

  const applicable = steps.filter((s) => !s.optional);
  const doneCount = applicable.filter((s) => s.done).length;
  const finished = doneCount === applicable.length;

  return (
    <AppShell title={dict.onboarding.welcome} subtitle={dict.onboarding.welcomeDesc}>
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-ink-500">پیشرفت راه‌اندازی</div>
          <div className="text-sm font-semibold" aria-live="polite">
            {toPersianDigits(doneCount)}/{toPersianDigits(applicable.length)}
          </div>
        </div>
        <div
          className="h-2 bg-ink-100 rounded-full mt-2 overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={applicable.length}
          aria-valuenow={doneCount}
          aria-label="پیشرفت راه‌اندازی"
        >
          <div
            className="h-full bg-brand-600 rounded-full transition-all"
            style={{ width: `${applicable.length ? (doneCount / applicable.length) * 100 : 0}%` }}
          />
        </div>
        {finished && (
          <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mt-3">
            راه‌اندازی کامل شد. سلورا آماده پاسخ‌گویی است. 🎉
          </div>
        )}
      </Card>

      <div className="space-y-2">
        {steps.map((s) => (
          <Link key={s.n} href={s.href} className="card p-4 flex items-start gap-3 min-h-[56px]">
            <div
              aria-hidden="true"
              className={`h-9 w-9 rounded-xl grid place-items-center font-bold text-sm flex-shrink-0 ${
                s.done ? "bg-emerald-100 text-emerald-700" : "bg-ink-100 text-ink-500"
              }`}
            >
              {s.done ? "✓" : toPersianDigits(s.n)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">
                {s.title}
                {s.optional && <span className="chip bg-ink-100 text-ink-600 ms-2">اختیاری</span>}
              </div>
              <div className="text-xs text-ink-500 mt-0.5 leading-6">{s.desc}</div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-400 rtl:rotate-180 mt-1" aria-hidden="true">
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
