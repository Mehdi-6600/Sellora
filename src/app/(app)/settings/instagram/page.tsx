import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Badge, Dot, StatusPulse } from "@/components/ui/badge";
import { META_APP_ID } from "@/lib/meta/config";
import { SelloraEmblem } from "@/components/brand/sellora";
import { StatusRefresh } from "./status-refresh";
import { IconArrowRight, IconCheck, IconInstagram, IconSparkle } from "@/components/layout/icons";
import { formatRelativeTime } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

/**
 * Instagram connection — deliberately one of the most polished screens in the
 * product, because nothing works until this is green.
 *
 * Connected  : account, live status, last verification, last activity, and the
 *              two controls that matter (health check, disconnect).
 * Disconnected: the Sellora character, why it matters and one dominant CTA.
 */
export default async function InstagramPage() {
  const { dict, locale } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }

  const ig = await prisma.instagramAccount.findUnique({ where: { businessId: auth.businessId } });
  const status = ig?.status ?? "DISCONNECTED";
  const connected = status === "CONNECTED";
  const needsReauth = status === "REAUTH_REQUIRED";
  const degraded = status === "DEGRADED";

  const lastActivity = await prisma.message.findFirst({
    where: { businessId: auth.businessId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  const statusChip = connected
    ? { label: dict.settings.instagram.statusConnected, tone: "green" as const }
    : needsReauth
    ? { label: dict.settings.instagram.statusReauth, tone: "red" as const }
    : degraded
    ? { label: dict.settings.instagram.statusDegraded, tone: "amber" as const }
    : { label: dict.settings.instagram.statusDisconnected, tone: "gray" as const };

  return (
    <AppShell
      title={dict.settings.instagram.title}
      subtitle={dict.app.tagline}
      backHref="/settings"
    >
      <div className="mx-auto w-full max-w-3xl space-y-4">
        {/* ================================================ connection card */}
        <section className="card overflow-hidden">
          <div className="relative overflow-hidden bg-premium-gradient p-5 text-white">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-10 end-2 opacity-25"
            >
              <IconInstagram size={140} />
            </span>
            <div className="relative flex items-start gap-4">
              <span
                aria-hidden="true"
                className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl border border-white/25 bg-white/15 text-2xl backdrop-blur"
              >
                <IconInstagram size={30} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-[17px] font-extrabold" dir="ltr">
                    {ig?.username ? `@${ig.username.replace(/^@/, "")}` : "Instagram Business"}
                  </h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold ring-1 ring-white/25">
                    {connected ? <StatusPulse tone="green" /> : <Dot tone="amber" />}
                    {statusChip.label}
                  </span>
                </div>
                <p className="mt-1.5 max-w-md text-[12.5px] leading-6 text-white/85">
                  {connected
                    ? "سلورا پیام‌های دایرکت این حساب را دریافت می‌کند و پاسخ‌های خودکار را از همین حساب ارسال می‌کند."
                    : needsReauth || degraded
                    ? "دسترسی این حساب کامل نیست؛ تا رفع آن، پاسخ خودکار ارسال نمی‌شود."
                    : "هنوز حسابی متصل نشده است؛ بدون اتصال، پاسخ خودکار امکان‌پذیر نیست."}
                </p>
              </div>
            </div>
          </div>

          {connected ? (
            <>
              <dl className="divide-y divide-ink-100/70 text-[12.5px]">
                <Row
                  label={dict.settings.instagram.account}
                  value={ig?.name || ig?.username || "—"}
                />
                <Row
                  label={dict.settings.instagram.lastVerified}
                  value={
                    ig?.lastVerifiedAt
                      ? formatRelativeTime(ig.lastVerifiedAt, locale)
                      : "در انتظار اولین بررسی"
                  }
                />
                <Row
                  label="آخرین فعالیت"
                  value={
                    lastActivity?.createdAt
                      ? formatRelativeTime(lastActivity.createdAt, locale)
                      : "هنوز پیامی رد و بدل نشده"
                  }
                />
                <Row
                  label="وضعیت توکن دسترسی"
                  value={
                    ig?.tokenExpiresAt
                      ? new Date(ig.tokenExpiresAt) > new Date()
                        ? `معتبر تا ${new Date(ig.tokenExpiresAt).toLocaleDateString("fa-IR")}`
                        : "منقضی شده"
                      : "بدون تاریخ انقضا"
                  }
                  tone={ig?.tokenExpiresAt && new Date(ig.tokenExpiresAt) <= new Date() ? "danger" : "ok"}
                />
              </dl>

              <div className="grid gap-2 p-3 sm:grid-cols-2">
                <StatusRefresh />
                <form action="/api/instagram/disconnect" method="post">
                  <button
                    type="submit"
                    className="btn-danger-soft w-full min-h-[44px]"
                    aria-label="قطع اتصال اینستاگرام"
                  >
                    {dict.settings.instagram.disconnect}
                  </button>
                </form>
              </div>
              <p className="border-t border-ink-100/80 px-4 py-2.5 text-[11px] leading-5 text-ink-500">
                با قطع اتصال، پاسخ خودکار متوقف می‌شود و توکن ذخیره‌شده پاک می‌شود. هر زمان
                بخواهید می‌توانید دوباره وصل کنید.
              </p>
            </>
          ) : (
            <div className="space-y-4 p-5">
              <div className="flex flex-col items-center gap-3 text-center">
                <SelloraEmblem size={112} pulse={needsReauth} />
                <h3 className="text-[15px] font-bold text-ink-900">
                  {needsReauth
                    ? "برای ادامه، دوباره وارد اینستاگرام شوید"
                    : "اینستاگرام را وصل کنید تا سلورا شروع کند"}
                </h3>
                <p className="max-w-md text-[12.5px] leading-6 text-ink-500">
                  {needsReauth
                    ? "دسترسی قبلی منقضی شده است. اتصال دوباره از طریق ورود رسمی متا انجام می‌شود و کمتر از یک دقیقه وقت می‌گیرد."
                    : "سلورا بدون اتصال نمی‌تواند پیام‌های مشتری‌ها را ببیند یا پاسخ بدهد. اتصال از طریق ورود رسمی متا (Graph API) انجام می‌شود و رمز عبور اینستاگرام شما هرگز ذخیره نمی‌شود."}
                </p>
              </div>

              {META_APP_ID ? (
                <a href="/api/instagram/connect" className="btn-primary w-full min-h-[52px]">
                  <IconInstagram size={19} />
                  {dict.settings.instagram.connectCta}
                </a>
              ) : (
                <div className="space-y-3">
                  <p className="rounded-2xl border border-amber-400/30 bg-amber-400/15 px-3.5 py-3 text-[12px] leading-6 text-amber-300">
                    اپلیکیشن متا هنوز در این محیط پیکربندی نشده است. برای اتصال واقعی، مقادیر{" "}
                    <code dir="ltr" className="font-mono font-bold">
                      META_APP_ID
                    </code>{" "}
                    و{" "}
                    <code dir="ltr" className="font-mono font-bold">
                      META_APP_SECRET
                    </code>{" "}
                    را در متغیرهای محیطی تنظیم کنید.
                  </p>
                  <button type="button" className="btn-secondary w-full min-h-[48px]" disabled>
                    <IconInstagram size={18} />
                    {dict.settings.instagram.connectCta}
                  </button>
                </div>
              )}

              <ol className="grid gap-2 sm:grid-cols-3">
                {[
                  { t: "ورود به متا", d: "با حساب فیسبوک؛ رمز اینستاگرام لازم نیست." },
                  { t: "تأیید دسترسی", d: "فقط برای پیام‌ها و کامنت‌های همین صفحه." },
                  { t: "فعال شدن سلورا", d: "همین لحظه پاسخ‌گویی خودکار شروع می‌شود." },
                ].map((s, i) => (
                  <li
                    key={s.t}
                    className="rounded-2xl border border-ink-100 bg-canvas-soft/60 p-3 text-center"
                  >
                    <span className="mx-auto grid h-8 w-8 place-items-center rounded-xl bg-white/[0.06] text-[12px] font-extrabold text-brand-700 shadow-soft">
                      {["۱", "۲", "۳"][i]}
                    </span>
                    <span className="mt-2 block text-[12px] font-bold text-ink-900">{s.t}</span>
                    <span className="mt-0.5 block text-[11px] leading-5 text-ink-500">{s.d}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        {/* =================================================== access status */}
        <section className="card p-4">
          <h2 className="text-[13px] font-bold text-ink-900">وضعیت دسترسی‌ها</h2>
          <ul className="mt-3 space-y-2.5 text-[12.5px]">
            <li className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className={
                  connected
                    ? "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-emerald-400/15 text-emerald-300"
                    : "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-red-400/15 text-red-300"
                }
              >
                <IconCheck size={14} />
              </span>
              <span className="text-ink-700">
                {connected ? "اتصال به حساب اینستاگرام برقرار است." : "اتصال به حساب اینستاگرام برقرار نیست."}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-amber-400/15 text-amber-300"
              >
                <IconSparkle size={14} />
              </span>
              <span className="leading-6 text-ink-700">{dict.settings.instagram.reviewNotice}</span>
            </li>
          </ul>
        </section>

        <section className="card p-4">
          <h2 className="text-[13px] font-bold text-ink-900">بعد از اتصال چه می‌شود؟</h2>
          <p className="mt-1 text-[12px] leading-6 text-ink-500">
            سلورا پیام‌های تکراری را خودش جواب می‌دهد و گفتگوهای حساس را به شما می‌سپارد. می‌توانید
            هر لحظه پاسخ‌گویی خودکار را خاموش کنید.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/automations" className="btn-secondary min-h-[44px] text-[12px]">
              {dict.nav.automations}
            </Link>
            <Link href="/products" className="btn-secondary min-h-[44px] text-[12px]">
              {dict.nav.products}
            </Link>
          </div>
          <Link
            href="/conversations"
            className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold text-brand-700 hover:underline"
          >
            دیدن گفتگوها
            <IconArrowRight size={15} className="rtl:rotate-180" />
          </Link>
        </section>
      </div>
    </AppShell>
  );
}

function Row({
  label,
  value,
  tone = "ok",
}: {
  label: string;
  value: string;
  tone?: "ok" | "danger";
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className={tone === "danger" ? "font-bold text-red-300" : "font-bold text-ink-800"}>
        {value}
      </dd>
    </div>
  );
}
