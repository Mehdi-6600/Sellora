import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { SelloraEmblem } from "@/components/brand/sellora";
import { Badge } from "@/components/ui/badge";
import { META_APP_ID } from "@/lib/meta/config";
import { cx, toPersianDigits } from "@/lib/utils/format";
import { IconArrowRight, IconCheck } from "@/components/layout/icons";

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
      cta: "افزودن محصول",
    },
    {
      n: 2,
      title: "اطلاعات کسب‌وکار را کامل کن",
      desc: "آدرس، تماس، ارسال و ساعات کاری؛ تا سلورا بدون حدس جواب بدهد.",
      done: businessInfoDone,
      href: "/settings/business",
      optional: false,
      cta: "تکمیل اطلاعات",
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
      cta: dict.dashboard.connectInstagram,
    },
    {
      n: 4,
      title: "پاسخ‌گویی خودکار را روشن کن",
      desc: "تا سلورا به‌جای تو به دایرکت‌ها جواب بدهد و داغ‌ها را خبرت کند.",
      done: Boolean(auto?.enabled),
      href: "/settings",
      optional: false,
      cta: "تنظیم پاسخ خودکار",
    },
  ];

  const applicable = steps.filter((s) => !s.optional);
  const doneCount = applicable.filter((s) => s.done).length;
  const finished = doneCount === applicable.length;
  const progress = applicable.length > 0 ? Math.round((doneCount / applicable.length) * 100) : 100;

  return (
    <AppShell title={dict.onboarding.welcome} subtitle={dict.onboarding.welcomeDesc}>
      <div className="mx-auto w-full max-w-2xl space-y-4">
        {/* ------------------------------------------------------- progress card */}
        <section className="relative overflow-hidden rounded-card border border-white/10 bg-premium-gradient p-5 text-white shadow-premium">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-12 end-0 opacity-25"
          >
            <SelloraEmblem size={200} tone="white" />
          </span>
          <div className="relative flex items-center gap-4">
            <SelloraEmblem size={86} />
            <div className="min-w-0 flex-1">
              <h2 className="text-[17px] font-extrabold leading-7">
                {finished ? "همه‌چیز آماده است 🎉" : `${toPersianDigits(doneCount)} از ${toPersianDigits(applicable.length)} قدم انجام شده`}
              </h2>
              <p className="mt-1 text-[12.5px] leading-6 text-white/85">
                {finished
                  ? "سلورا آماده است تا دایرکت‌های مشتری‌ها را جواب بدهد."
                  : "هر قدم را می‌توانید همین حالا انجام دهید؛ بقیه‌اش با سلورا."}
              </p>
            </div>
          </div>

          <div className="relative mt-4">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-white/25"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="پیشرفت راه‌اندازی"
            >
              <div
                className="h-full rounded-full bg-white transition-all duration-500 ease-smooth"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="tnum mt-2 block text-[11px] font-bold text-white/85">
              {toPersianDigits(progress)}٪
            </span>
          </div>
        </section>

        {/* ---------------------------------------------------------- step list */}
        <ul className="space-y-2.5">
          {steps.map((s) => (
            <li key={s.n}>
              <Link
                href={s.href}
                className={cx(
                  "flex items-start gap-3.5 rounded-card border p-4 transition-all duration-200 ease-smooth hover:-translate-y-[2px] hover:shadow-card-hover",
                  s.done
                    ? "border-emerald-400/30 bg-emerald-400/15"
                    : "border-ink-100/90 bg-white/[0.06] shadow-card"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    "grid h-11 w-11 shrink-0 place-items-center rounded-2xl border text-[15px] font-extrabold",
                    s.done
                      ? "border-emerald-400/30 bg-white/[0.06] text-emerald-300"
                      : "border-brand-100 bg-brand-50 text-brand-700"
                  )}
                >
                  {s.done ? <IconCheck size={19} /> : toPersianDigits(s.n)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span
                      className={cx(
                        "text-[13.5px] font-bold",
                        s.done ? "text-ink-700" : "text-ink-900"
                      )}
                    >
                      {s.title}
                    </span>
                    {s.done ? <Badge tone="green">انجام شد</Badge> : null}
                    {s.optional ? <Badge tone="gray">اختیاری</Badge> : null}
                  </span>
                  <span className="mt-1 block text-[12px] leading-6 text-ink-500">{s.desc}</span>
                  {!s.done ? (
                    <span className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold text-brand-700">
                      {s.cta}
                      <IconArrowRight size={15} className="rtl:rotate-180" />
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/dashboard" className="btn-primary min-h-[48px] sm:flex-1">
            رفتن به داشبورد
          </Link>
          <Link href="/automations" className="btn-secondary min-h-[48px] sm:flex-1">
            {dict.nav.automations}
          </Link>
        </div>

        <p className="text-center text-[11.5px] leading-6 text-ink-500">
          بعداً — هر وقت خواستید از بخش تنظیمات همین مراحل را ادامه دهید.
        </p>
      </div>
    </AppShell>
  );
}
