import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Empty } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat";
import { IconFlame, IconSparkle } from "@/components/layout/icons";
import { cx, formatRelativeTime, toPersianDigits } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

/**
 * Hot leads.
 *
 * Phone: one column, hottest first. Desktop: the same list plus a summary of
 * how the scoring is doing. Ordering is applied here (HOT → WARM → COLD, then
 * by score) so the list always reads hottest-first regardless of how the
 * database collates the enum strings.
 */
const ORDER = ["HOT", "WARM", "COLD"] as const;

export default async function LeadsPage() {
  const { dict, locale } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }

  const leads = await prisma.lead.findMany({
    where: { businessId: auth.businessId },
    include: { conversation: true },
    orderBy: { score: "desc" },
    take: 200,
  });

  const grouped = ORDER.map((temperature) => ({
    temperature,
    items: leads
      .filter((l: any) => l.temperature === temperature)
      .sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0)),
  })).filter((g) => g.items.length > 0);

  const hot = grouped.find((g) => g.temperature === "HOT")?.items.length ?? 0;
  const warm = grouped.find((g) => g.temperature === "WARM")?.items.length ?? 0;
  const withContact = leads.filter((l: any) => l.capturedContact).length;

  const LABELS: Record<string, { label: string; tone: "red" | "amber" | "gray"; desc: string }> = {
    HOT: {
      label: dict.leads.hot,
      tone: "red",
      desc: "قصد خرید نشان داده‌اند؛ اولویت شما همین‌ها هستند.",
    },
    WARM: {
      label: dict.leads.warm,
      tone: "amber",
      desc: "در حال بررسی‌اند؛ یک پیام به‌موقع خرید را قطعی می‌کند.",
    },
    COLD: {
      label: dict.leads.cold,
      tone: "gray",
      desc: "فعلاً فقط سوال پرسیده‌اند؛ سلورا این‌ها را گرم می‌کند.",
    },
  };

  return (
    <AppShell title={dict.leads.title} subtitle={dict.leads.subtitle} wide>
      {leads.length === 0 ? (
        <Empty
          title="هنوز مشتری داغی شناسایی نشده"
          subtitle="سلورا به هر پیام مشتری امتیاز می‌دهد: پرسیدن قیمت یک نشانه است، اما «همینو می‌خوام» یا گذاشتن شماره تماس نشانه‌ی جدی خرید است."
          nextStep="کافی است پاسخ خودکار فعال باشد؛ مشتری‌های داغ همین‌جا و در اعلان‌ها ظاهر می‌شوند."
          action={
            <Link href="/automations" className="btn-primary w-full">
              مدیریت خودکارسازی
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="space-y-5 lg:col-span-2">
            {grouped.map((group) => {
              const meta = LABELS[group.temperature];
              return (
                <section key={group.temperature} aria-label={meta.label}>
                  <div className="section-title">
                    <span
                      aria-hidden="true"
                      className={cx(
                        "h-2 w-2 rounded-full",
                        group.temperature === "HOT"
                          ? "bg-red-500"
                          : group.temperature === "WARM"
                          ? "bg-amber-500"
                          : "bg-ink-300"
                      )}
                    />
                    {meta.label}
                    <span className="tnum text-[11px] font-semibold text-ink-400">
                      {toPersianDigits(group.items.length)}
                    </span>
                  </div>
                  <p className="mb-3 text-[12px] leading-6 text-ink-500">{meta.desc}</p>

                  <div className="space-y-2">
                    {group.items.map((l: any) => {
                      const convo = l.conversation;
                      const name = convo?.customerName || convo?.customerUsername || "مشتری";
                      return (
                        <Link
                          key={l.id}
                          href={`/conversations/${l.conversationId}`}
                          className="card-link flex items-start gap-3 p-3.5"
                        >
                          <Avatar name={name} src={convo?.customerProfilePic} size={46} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="truncate text-[13.5px] font-bold text-ink-900">
                                {name}
                              </span>
                              <Badge tone={meta.tone}>{meta.label}</Badge>
                              {l.capturedContact ? <Badge tone="blue">تماس ثبت شد</Badge> : null}
                            </div>
                            {l.reason ? (
                              <p className="mt-1 line-clamp-2 text-[12px] leading-6 text-ink-600">
                                {l.reason}
                              </p>
                            ) : null}
                            <div className="mt-2 flex items-center gap-2">
                              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-ink-100">
                                <div
                                  className={cx(
                                    "h-full rounded-full",
                                    group.temperature === "HOT"
                                      ? "bg-gradient-to-r from-brand-400 to-brand-700"
                                      : group.temperature === "WARM"
                                      ? "bg-gradient-to-r from-amber-400 to-brand-500"
                                      : "bg-ink-300"
                                  )}
                                  style={{ width: `${Math.max(5, Math.min(100, l.score ?? 0))}%` }}
                                />
                              </div>
                              <span className="tnum text-[11px] font-bold text-ink-600">
                                {toPersianDigits(l.score ?? 0)}/۱۰۰
                              </span>
                              <span className="ms-auto text-[11px] text-ink-400">
                                {formatRelativeTime(convo?.lastMessageAt ?? l.updatedAt, locale)}
                              </span>
                            </div>
                            {(l.contactPhone || l.contactCity) && (
                              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-ink-500">
                                {l.contactPhone ? (
                                  <span dir="ltr" className="rounded-lg bg-canvas-soft px-2 py-0.5">
                                    {l.contactPhone}
                                  </span>
                                ) : null}
                                {l.contactCity ? (
                                  <span className="rounded-lg bg-canvas-soft px-2 py-0.5">
                                    {l.contactCity}
                                  </span>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          {/* ------------------------------------------------------ summary */}
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              <StatCard
                label={dict.leads.hot}
                value={toPersianDigits(hot)}
                hint="آماده خرید"
                icon={<IconFlame size={18} />}
                tone="danger"
              />
              <StatCard
                label={dict.leads.warm}
                value={toPersianDigits(warm)}
                hint="در حال بررسی"
                icon={<IconSparkle size={18} />}
                tone="warning"
              />
            </div>
            <div className="card p-4">
              <h2 className="text-[13px] font-bold text-ink-900">تماس‌های ثبت‌شده</h2>
              <p className="mt-1 text-[12px] leading-6 text-ink-500">
                {withContact > 0
                  ? `${toPersianDigits(withContact)} مشتری شماره یا شهر خود را داده‌اند؛ می‌توانید مستقیم پیگیری کنید.`
                  : "هنوز تماسی ثبت نشده. وقتی مشتری شماره یا آدرس بدهد، اینجا جمع می‌شود."}
              </p>
              <Link href="/notifications" className="btn-secondary mt-3 w-full min-h-[44px]">
                {dict.notifications.title}
              </Link>
            </div>
          </aside>
        </div>
      )}
    </AppShell>
  );
}
