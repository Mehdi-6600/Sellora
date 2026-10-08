import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Badge, Dot, StatusPulse } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat";
import { AutomationSwitch } from "@/components/automation/automation-switch";
import { IconArrowRight, IconBolt, IconCheck, IconInfo, IconSparkle } from "@/components/layout/icons";
import { cx, formatRelativeTime, toPersianDigits } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

/**
 * Automations.
 *
 * Every card below describes a flow that really runs inside Sellora (see
 * src/lib/conversation/intents.ts, responses.ts, resolve.ts and the policy
 * engine). Numbers come from the tenant's own Message/Conversation rows — no
 * invented statistics and no per-flow toggles that the backend cannot honour:
 * one master switch controls the whole engine, and every card states the
 * current effective state honestly.
 */
type Stage = { kind: "trigger" | "condition" | "action"; text: string };

const FLOWS: Array<{
  id: string;
  title: string;
  icon: string;
  summary: string;
  stages: Stage[];
  source: string;
}> = [
  {
    id: "price",
    title: "قیمت و موجودی",
    icon: "💰",
    summary: "پرتکرارترین سوال دایرکت، بدون دخالت شما.",
    stages: [
      { kind: "trigger", text: "مشتری می‌پرسد «قیمت چند؟»، «چنده؟»، «موجود دارید؟»" },
      { kind: "condition", text: "قیمت و وضعیت موجودی همان لحظه از محصولات ثبت‌شده‌ی شما خوانده می‌شود" },
      { kind: "action", text: "پاسخ فوری با قیمت و موجودی واقعی + امتیاز گرفتن مشتری" },
    ],
    source: "دیتابیس محصولات شما",
  },
  {
    id: "product",
    title: "مشخصات محصول و تنوع‌ها",
    icon: "🧵",
    summary: "رنگ، سایز و جزئیات محصول را خودش پیدا می‌کند.",
    stages: [
      { kind: "trigger", text: "«رنگ‌هاش چیه؟»، «سایز L دارید؟»" },
      { kind: "condition", text: "محصول مورد نظر از گفتگو شناسایی و تنوع‌هایش بررسی می‌شود" },
      { kind: "action", text: "فهرست رنگ/سایز موجود همان محصول ارسال می‌شود" },
    ],
    source: "محصولات و تنوع‌ها",
  },
  {
    id: "shipping",
    title: "ارسال، زمان تحویل و شهرها",
    icon: "🚚",
    summary: "اطلاعات ارسال فروشگاه، همیشه یکسان و درست.",
    stages: [
      { kind: "trigger", text: "«چطور می‌فرستید؟»، «کی به دستم می‌رسه؟»، «به شیراز می‌فرستید؟»" },
      { kind: "condition", text: "اطلاعات ارسال و شهرهای تحت پوشش از تنظیمات کسب‌وکار خوانده می‌شود" },
      { kind: "action", text: "پاسخ دقیق درباره روش ارسال، هزینه و بازه‌ی زمانی" },
    ],
    source: "اطلاعات کسب‌وکار",
  },
  {
    id: "policy",
    title: "آدرس، ساعات کاری، پرداخت و بازگشت",
    icon: "🧾",
    summary: "سوال‌های همیشگی، بدون پاسخ‌های متناقض.",
    stages: [
      { kind: "trigger", text: "«آدرس فروشگاه؟»، «چند تا بازید؟»، «کارت به کارت؟»، «مرجوعی دارید؟»" },
      { kind: "condition", text: "پاسخ از قوانین ثبت‌شده‌ی فروشگاه خوانده می‌شود (نه از حدس)" },
      { kind: "action", text: "پاسخ رسمی و یکسان برای همه‌ی مشتری‌ها" },
    ],
    source: "اطلاعات کسب‌وکار",
  },
  {
    id: "leads",
    title: "شناسایی مشتری داغ",
    icon: "🔥",
    summary: "مشتری جدی را از کنجکاو جدا می‌کند.",
    stages: [
      { kind: "trigger", text: "«همینو می‌خوام»، «برام بفرست»، درخواست ثبت سفارش یا شماره تماس" },
      { kind: "condition", text: "سیگنال‌ها امتیاز می‌گیرند (نشانه‌های تکراری با وزن کمتر)" },
      { kind: "action", text: "نشان‌دار شدن مشتری + اعلان فوری برای شما" },
    ],
    source: "موتور امتیازدهی سلورا",
  },
  {
    id: "handoff",
    title: "تحویل گفتگو به شما",
    icon: "🤝",
    summary: "جاهایی که ربات‌ها اشتباه می‌کنند، سلورا ساکت می‌شود.",
    stages: [
      { kind: "trigger", text: "«با پشتیبانی حرف بزنم»، شکایت، یا سوالی که سلورا مطمئن نیست" },
      { kind: "condition", text: "قوانین ایمنی اجازه‌ی پاسخ خودکار را نمی‌دهد" },
      { kind: "action", text: "توقف پاسخ خودکار، انتقال گفتگو به شما و ثبت اعلان" },
    ],
    source: "موتور سیاست و ایمنی",
  },
];

export default async function AutomationsPage() {
  const { dict, locale } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [auto, ig, automatedTotal, automatedToday, underAutomation, handoffs, lastAutomated] =
    await Promise.all([
      prisma.automationConfig.findUnique({ where: { businessId: auth.businessId } }),
      prisma.instagramAccount.findUnique({ where: { businessId: auth.businessId } }),
      prisma.message.count({
        where: {
          businessId: auth.businessId,
          senderType: "SELLORA",
          deliveryState: "SENT",
        },
      }),
      prisma.message.count({
        where: {
          businessId: auth.businessId,
          senderType: "SELLORA",
          deliveryState: "SENT",
          createdAt: { gte: startOfDay },
        },
      }),
      prisma.conversation.count({ where: { businessId: auth.businessId, automationLock: "AUTO" } }),
      prisma.conversation.count({ where: { businessId: auth.businessId, automationLock: "HUMAN" } }),
      prisma.message.findFirst({
        where: { businessId: auth.businessId, senderType: "SELLORA" },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

  const igConnected = ig?.status === "CONNECTED";
  const engineOn = Boolean(auto?.enabled);
  const running = engineOn && igConnected;

  const stateLabel = running
    ? { text: "در حال پاسخ‌گویی", tone: "green" as const }
    : engineOn
    ? { text: "متوقف — اینستاگرام قطع است", tone: "amber" as const }
    : { text: "غیرفعال", tone: "gray" as const };

  return (
    <AppShell
      title={dict.nav.automations}
      subtitle="چه چیزی، چه زمانی و با چه شرطی خودکار پاسخ داده می‌شود"
      wide

    >
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        {/* ================================================ main column */}
        <div className="space-y-4 lg:col-span-2 lg:space-y-5">
          {/* ------------------------------------------------ master status */}
          <section
            aria-label="وضعیت موتور خودکارسازی"
            className="relative overflow-hidden rounded-card border border-white/10 bg-premium-gradient p-5 text-white shadow-premium"
          >

            <div className="relative">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-ink-200 pb-3">
                <span className="text-sm font-bold">پاسخ‌گویی خودکار</span>
                <AutomationSwitch enabled={engineOn} label="پاسخ‌گویی خودکار" />
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold ring-1 ring-white/25 backdrop-blur">
                <StatusPulse tone={running ? "green" : engineOn ? "amber" : "gray"} />
                {stateLabel.text}
              </span>
              <h2 className="mt-3 text-[19px] font-extrabold leading-8">
                {running
                  ? "سلورا خودش به دایرکت‌های تکراری جواب می‌دهد"
                  : engineOn
                  ? "یک قدم مانده: اتصال اینستاگرام"
                  : "پاسخ‌گویی خودکار خاموش است"}
              </h2>
              <p className="mt-1 max-w-xl text-[13px] leading-7 text-white/85">
                {running
                  ? "همه‌ی پاسخ‌ها از داده‌های خودتان می‌آید: محصولات، قیمت‌ها، اطلاعات ارسال و قوانین فروشگاه. اگر پاسخ مطمئنی وجود نداشته باشد، سلورا حدس نمی‌زند و گفتگو را به شما می‌سپارد."
                  : engineOn
                  ? "تا وقتی حساب اینستاگرام کسب‌وکار متصل نشود، پاسخ‌های خودکار ارسال نمی‌شوند."
                  : "با روشن کردن این سوئیچ، سلورا پاسخ‌های تکراری را خودش می‌دهد و موارد حساس را به شما می‌سپارد."}
              </p>
              {!igConnected ? (
                <Link href="/settings/instagram" className="btn-glass mt-4 min-h-[44px]">
                  {dict.dashboard.connectInstagram}
                  <IconArrowRight size={17} className="rtl:rotate-180" />
                </Link>
              ) : null}

              {/* <noscript> path: the switch above works without JavaScript too. */}
              <noscript>
                <form action="/api/rules/automation" method="post" className="mt-4">
                  <input type="hidden" name="enabled" value={engineOn ? "false" : "true"} />
                  <button type="submit" className="btn-glass min-h-[44px]">
                    {engineOn ? "خاموش کردن پاسخ خودکار" : "روشن کردن پاسخ خودکار"}
                  </button>
                </form>
              </noscript>
            </div>
          </section>

          {/* ------------------------------------------------------- metrics */}
          <section aria-label="آمار خودکارسازی">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                label="پاسخ خودکار"
                value={toPersianDigits(automatedTotal)}
                hint="از ابتدای فعالیت"
                icon={<IconSparkle size={18} />}
              />
              <StatCard
                label="امروز"
                value={toPersianDigits(automatedToday)}
                hint="پاسخ ارسال‌شده"
                icon={<IconBolt size={18} />}
              />
              <StatCard
                label="گفتگو تحت خودکارسازی"
                value={toPersianDigits(underAutomation)}
                hint={handoffs > 0 ? `${toPersianDigits(handoffs)} در دست شما` : "همه خودکار"}
                icon={<IconCheck size={18} />}
                tone="success"
              />
              <StatCard
                label="آخرین پاسخ خودکار"
                value={
                  lastAutomated?.createdAt
                    ? formatRelativeTime(lastAutomated.createdAt, locale)
                    : "—"
                }
                hint={lastAutomated ? "فعال و به‌روز" : "هنوز پاسخی ارسال نشده"}
                icon={<IconInfo size={18} />}
                tone="neutral"
              />
            </div>
          </section>

          {/* --------------------------------------------------------- flows */}
          <section aria-label="جریان‌های خودکار">
            <div className="section-title">
              <IconBolt size={16} className="text-brand-500" />
              جریان‌های خودکار
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
              {FLOWS.map((flow) => (
                <FlowCard key={flow.id} flow={flow} empty={!running} />
              ))}
            </div>
          </section>
        </div>

        {/* ================================================ side column */}
        <aside className="space-y-4 lg:space-y-5">
          {/* ---------------------------------------------------- capabilities */}
          <details className="card p-4">
            <summary className="cursor-pointer text-sm font-bold text-ink-900">قابلیت‌های موتور</summary>
            <p className="mt-1 text-[11.5px] leading-6 text-ink-500">
              وضعیت واقعی تنظیمات خودکارسازی این فروشگاه.
            </p>
            <ul className="mt-3 space-y-2 text-[12px]">
              <CapabilityRow
                label="پاسخ به کامنت‌های پست‌ها"
                on={Boolean(auto?.autoReplyComments)}
              />
              <CapabilityRow label="پاسخ هوش مصنوعی برای موارد نامشخص" on={Boolean(auto?.useAiFallback)} />
              <li className="flex items-center justify-between gap-2 rounded-2xl border border-ink-100/70 bg-canvas-soft/60 px-3 py-2">
                <span className="text-ink-600">لحن پاسخ‌ها</span>
                <span className="font-bold text-ink-900">
                  {auto?.defaultTone === "formal" ? "رسمی" : "دوستانه"}
                </span>
              </li>
            </ul>
            <p className="mt-3 rounded-xl bg-canvas-soft px-3 py-2 text-[11px] leading-6 text-ink-500">
              این دو قابلیت به‌صورت پیش‌فرض خاموش‌اند و از سمت سرور فعال می‌شوند؛ وضعیت آن‌ها همین‌جا
              درست نمایش داده می‌شود تا هیچ‌وقت ادعای اشتباه نداشته باشیم.
            </p>
          </details>

          {/* -------------------------------------------------------- guardrails */}
          <details className="card p-4">
            <summary className="cursor-pointer text-sm font-bold text-ink-900">قوانین ایمنی</summary>
            <ul className="mt-3 space-y-2 text-[11.5px] leading-6 text-ink-600">
              <li className="flex gap-2">
                <Dot tone="green" />
                <span>خارج از بازه‌ی ۲۴ ساعته‌ی متا هیچ پیام خودکاری ارسال نمی‌شود.</span>
              </li>
              <li className="flex gap-2">
                <Dot tone="green" />
                <span>اگر شما گفتگویی را تحویل بگیرید، سلورا تا بازگرداندن آن ساکت می‌ماند.</span>
              </li>
              <li className="flex gap-2">
                <Dot tone="green" />
                <span>قیمت و موجودی هیچ‌وقت از حافظه پاسخ داده نمی‌شود؛ هر بار از دیتابیس خوانده می‌شود.</span>
              </li>
              <li className="flex gap-2">
                <Dot tone="green" />
                <span>برای اطلاعات ناموجود، سلورا «نمی‌دانم» می‌گوید و از شما می‌پرسد.</span>
              </li>
            </ul>
          </details>

          <section aria-label="پیشنهاد بعدی" className="card p-4">
            <h2 className="flex items-center gap-2 text-[13px] font-bold text-ink-900">
              <IconSparkle size={16} className="text-brand-500" />
              قدم بعدی
            </h2>
            <p className="mt-1 text-[12px] leading-6 text-ink-500">
              کیفیت پاسخ‌ها به اطلاعاتی بستگی دارد که ثبت کرده‌اید.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href="/settings/business" className="btn-secondary min-h-[44px] text-[12px]">
                اطلاعات فروشگاه
              </Link>
              <Link href="/products" className="btn-secondary min-h-[44px] text-[12px]">
                {dict.nav.products}
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ helpers */

function CapabilityRow({ label, on }: { label: string; on: boolean }) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-2xl border border-ink-100/70 bg-canvas-soft/60 px-3 py-2">
      <span className="text-ink-600">{label}</span>
      <Badge tone={on ? "green" : "gray"}>{on ? "فعال" : "غیرفعال"}</Badge>
    </li>
  );
}

/**
 * One automation flow, shown as TRIGGER → CONDITION → ACTION so the behaviour
 * is understandable at a glance instead of hidden in a dense form.
 */
function FlowCard({
  flow,
  empty,
}: {
  flow: { title: string; icon: string; summary: string; stages: Stage[]; source: string };
  empty: boolean;
}) {
  const LABELS: Record<Stage["kind"], string> = {
    trigger: "رویداد",
    condition: "شرط",
    action: "پاسخ",
  };
  const TONES: Record<Stage["kind"], string> = {
    trigger: "border-brand-100 bg-brand-50 text-brand-700",
    condition: "border-amber-400/25 bg-amber-400/15 text-amber-700",
    action: "border-emerald-400/25 bg-emerald-400/15 text-emerald-700",
  };

  return (
    <article className={cx("card p-4 transition", empty && "opacity-80")}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-ink-100 bg-canvas-soft text-lg"
        >
          <IconBolt size={20} className="text-brand-700" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[13.5px] font-bold text-ink-900">{flow.title}</h3>
          <p className="mt-0.5 text-[11.5px] leading-5 text-ink-500">{flow.summary}</p>
        </div>
        <Badge tone={empty ? "gray" : "green"}>{empty ? "غیرفعال" : "فعال"}</Badge>
      </div>

      <details className="mt-3 border-t border-ink-100 pt-2">
      <summary className="flex cursor-pointer items-center text-xs font-bold text-brand-700">نحوه پاسخ‌گویی و شرایط +</summary>
      <ol className="mt-3 space-y-0">
        {flow.stages.map((stage, i) => (
          <li key={stage.kind} className="relative ps-0">
            <div className="flex items-start gap-2.5">
              <span
                className={cx(
                  "mt-0.5 inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold",
                  TONES[stage.kind]
                )}
              >
                {LABELS[stage.kind]}
              </span>
              <span className="min-w-0 flex-1 text-[11.5px] leading-6 text-ink-700">
                {stage.text}
              </span>
            </div>
            {i < flow.stages.length - 1 ? (
              <span
                aria-hidden="true"
                className="ms-[1.1rem] block h-3 w-px bg-gradient-to-b from-ink-200 to-transparent"
              />
            ) : null}
          </li>
        ))}
      </ol>

      <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-2.5">
        <span className="text-[10.5px] font-medium text-ink-500">منبع پاسخ</span>
        <span className="text-[10.5px] font-bold text-ink-700">{flow.source}</span>
      </div>
      </details>
    </article>
  );
}
