import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public/public-shell";
import { SITE_NAME, absolute } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "چرا سلورا؟ تفاوت پاسخ‌گویی هوشمند با ربات ساده",
  description:
    "سلورا پیام مشتری را می‌فهمد، قیمت و موجودی را از محصولات خودتان می‌گوید، مشتری داغ را شناسایی می‌کند و گفتگوهای حساس را به شما تحویل می‌دهد. ببینید چه فرقی با یک ربات پاسخ ثابت دارد.",
  alternates: { canonical: "/why-sellora" },
  openGraph: {
    type: "website",
    url: absolute("/why-sellora"),
    title: `چرا سلورا؟ | ${SITE_NAME}`,
    description:
      "پاسخ‌گویی هوشمند دایرکت اینستاگرام که از خودش قیمت نمی‌سازد؛ مقایسه سلورا با پاسخ دستی و ربات ساده.",
  },
};
import { PLANS } from "@/lib/config/pricing";
import { cx, formatToman } from "@/lib/utils/format";
import { SelloraEmblem, BrandAura } from "@/components/brand/sellora";
import {
  IconBolt,
  IconCheck,
  IconShield,
  IconSparkle,
  IconUser,
} from "@/components/layout/icons";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: "🎯",
    title: "پاسخ خودکار به سوالات مشتری",
    desc: "قیمت، موجودی، زمان ارسال، آدرس، شرایط گارانتی — هر سوالی که مشتری زیاد می‌پرسد، سلورا خودش جواب می‌دهد.",
  },
  {
    icon: "💰",
    title: "قیمت و موجودی لحظه‌ای",
    desc: "قبل از هر پاسخ حساس، سلورا به دیتابیس نگاه می‌کند. قیمت‌ها همیشه از محصولات خودتان خوانده می‌شوند، نه از حدس و گمان.",
  },
  {
    icon: "🔥",
    title: "شناسایی مشتری‌های داغ",
    desc: "سلورا می‌فهمد چه کسی جدی می‌خواهد بخرد. وقتی مشتری قصد خرید نشان می‌دهد، امتیاز می‌گیرد و با اعلان به شما خبر می‌دهد.",
  },
  {
    icon: "🤝",
    title: "تحویل به شما وقتی لازمه",
    desc: "مکالمات پیچیده یا حساس را سلورا خودش ادامه نمی‌دهد؛ به شما پاس می‌دهد تا خودتان تصمیم بگیرید. با یک دکمه، همه‌چیز دست شماست.",
  },
  {
    icon: "🌍",
    title: "فهمیدن فارسی، فینگلیش، عربی، انگلیسی",
    desc: "چه کسی رسمی سلام کند، چه فینگلیش بنویسد (salam gheymat chande?)، سلورا هر چهار حالت را می‌فهمد و جواب می‌دهد.",
  },
  {
    icon: "📊",
    title: "آمار و گزارش شفاف",
    desc: "چند مکالمه خودکار حل شد؟ چند مشتری داغ دارید؟ چند درصد پاسخ‌ها خودکار بوده؟ همه در داشبورد، بدون پیچیدگی.",
  },
  {
    icon: "🔒",
    title: "امنیت و جداسازی داده‌ها",
    desc: "اطلاعات هر فروشگاه کاملاً جدا نگه‌داری می‌شود و توکن‌های اینستاگرام با رمزنگاری AES-256 محافظت می‌شوند.",
  },
  {
    icon: "🧠",
    title: "هیچ‌وقت از خودش چیزی نمی‌سازد",
    desc: "سلورا فقط بر اساس اطلاعاتی که شما وارد کرده‌اید جواب می‌دهد. اگر چیزی را نداند، صادقانه می‌گوید «نمی‌دانم» و از شما می‌پرسد.",
  },
];

const COMPARISON = [
  { label: "پاسخ خودکار ۲۴/۷", sellora: true, manual: false, bot: true },
  { label: "قیمت و موجودی از دیتابیس خودت", sellora: true, manual: true, bot: false },
  { label: "شناسایی مشتری داغ", sellora: true, manual: false, bot: false },
  { label: "تحویل مکالمه به صاحب فروشگاه", sellora: true, manual: false, bot: false },
  { label: "گزارش و آمار", sellora: true, manual: false, bot: false },
  { label: "بدون نیاز به دانش فنی", sellora: true, manual: true, bot: false },
  { label: "هیچ‌وقت اطلاعات اشتباه نمی‌دهد", sellora: true, manual: false, bot: false },
];

const PLAN_LABELS: Record<string, string> = {
  WEEKLY: "هفتگی",
  MONTHLY: "ماهانه",
  QUARTERLY: "سه‌ماهه",
};

function StatusIcon({ ok }: { ok: boolean }) {
  return (
    <span
      aria-label={ok ? "دارد" : "ندارد"}
      className={cx(
        "mx-auto grid h-7 w-7 place-items-center rounded-full",
        ok ? "bg-emerald-50 text-emerald-600" : "bg-ink-50 text-ink-300"
      )}
    >
      {ok ? <IconCheck size={15} /> : <span aria-hidden="true">—</span>}
    </span>
  );
}

/**
 * Public marketing page: what Sellora is, who it is for, how it works and how
 * it differs from a plain auto-reply bot. No authentication required — the
 * page contains no tenant data.
 */
export default function WhySelloraPage() {
  return (
    <PublicShell>
      {/* ------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden border-b border-brand-700/20 bg-brand-gradient text-white">
        <BrandAura />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-16 end-6 opacity-15">
          <SelloraEmblem size={280} tone="white" />
        </span>
        <div className="relative mx-auto w-full max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11.5px] font-bold ring-1 ring-white/25 backdrop-blur">
            <IconSparkle size={14} />
            راهنمای کامل سلورا
          </span>
          <h1 className="mt-4 max-w-3xl text-[26px] font-extrabold leading-[1.45] sm:text-[38px]">
            سلورا کارمند فروشی است که ۲۴ ساعته بیدار است
          </h1>
          <p className="mt-4 max-w-3xl text-[14px] leading-9 text-white/90 sm:text-[15px]">
            به پیام‌های اینستاگرام مشتری‌هایتان خودکار جواب می‌دهد، قیمت و موجودی را از روی
            محصولات خودتان می‌گوید، مشتری‌های جدی را شناسایی می‌کند و وقتی خوابید یا سرتان شلوغ
            است، تنهایتان نمی‌گذارد.
          </p>
          <div className="mt-6 max-w-3xl rounded-card border border-white/20 bg-white/12 p-4 text-[13px] leading-8 backdrop-blur">
            <strong className="font-extrabold">مزیتش چیست؟</strong> دیگر لازم نیست پشت گوشی
            بایستید، پاسخ‌های تکراری بدهید یا نگران مشتری‌هایی باشید که در دایرکت گم می‌شوند.
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-white px-6 text-[14px] font-extrabold text-brand-700 shadow-soft transition hover:bg-brand-50"
            >
              شروع رایگان
            </Link>
            <Link href="/login" className="btn-glass min-h-[48px] px-6 text-[14px]">
              ورود به حساب
            </Link>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- who & how */}
      <section className="py-12 sm:py-16" aria-labelledby="who-title">
        <div className="mx-auto grid w-full max-w-5xl gap-4 px-4 sm:px-6 lg:grid-cols-2">
          <div className="card p-5 sm:p-6">
            <span aria-hidden="true" className="icon-tile icon-tile-brand">
              <IconUser size={20} />
            </span>
            <h2 id="who-title" className="mt-3 text-[18px] font-extrabold text-ink-950 sm:text-xl">
              سلورا برای چه کسانی است؟
            </h2>
            <p className="mt-2 text-[13px] leading-8 text-ink-600">
              برای فروشگاه‌های اینستاگرامی که فروش‌شان در دایرکت اتفاق می‌افتد: پوشاک، کیف و
              کفش، اکسسوری، لوازم خانگی کوچک، آرایشی و بهداشتی و هر کسب‌وکاری که روزانه ده‌ها
              پیام تکراری می‌گیرد و می‌خواهد هیچ مشتری‌ای بی‌جواب نماند.
            </p>
          </div>

          <div className="card p-5 sm:p-6">
            <span aria-hidden="true" className="icon-tile icon-tile-brand">
              <IconBolt size={20} />
            </span>
            <h2 className="mt-3 text-[18px] font-extrabold text-ink-950 sm:text-xl">
              چطور کار می‌کند؟
            </h2>
            <ol className="mt-2 list-decimal space-y-1.5 ps-5 text-[13px] leading-8 text-ink-600">
              <li>محصولات و اطلاعات کسب‌وکار (آدرس، ارسال، ساعات کاری) را ثبت می‌کنید.</li>
              <li>حساب اینستاگرام کسب‌وکار را از طریق ورود رسمی متا متصل می‌کنید.</li>
              <li>سلورا پیام‌ها را می‌فهمد، جواب می‌دهد و داغ‌ها را با اعلان به شما می‌دهد.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- comparison */}
      <section className="py-12 sm:py-16" aria-labelledby="compare-title">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <h2 id="compare-title" className="text-[22px] font-extrabold text-ink-950 sm:text-2xl">
            مقایسه با پاسخ دستی و ربات ساده
          </h2>
          <p className="mt-2 text-[13px] leading-7 text-ink-600">
            این جدول همان چیزی است که در عمل تفاوت ایجاد می‌کند.
          </p>

          <div className="card mt-6 overflow-hidden">
            <div className="grid grid-cols-4 border-b border-ink-100/80 bg-canvas-soft/70 text-[11.5px] font-bold">
              <div className="p-3 text-start text-ink-500">ویژگی</div>
              <div className="p-3 text-center text-brand-700">سلورا</div>
              <div className="p-3 text-center text-ink-500">دستی</div>
              <div className="p-3 text-center text-ink-500">ربات ساده</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div
                key={row.label}
                className={cx(
                  "grid grid-cols-4 items-center text-[12.5px]",
                  i < COMPARISON.length - 1 && "border-b border-ink-100/70"
                )}
              >
                <div className="p-3 text-start font-semibold text-ink-800">{row.label}</div>
                <div className="bg-brand-50/40 p-3 text-center">
                  <StatusIcon ok={row.sellora} />
                </div>
                <div className="p-3 text-center">
                  <StatusIcon ok={row.manual} />
                </div>
                <div className="p-3 text-center">
                  <StatusIcon ok={row.bot} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- features */}
      <section className="py-12 sm:py-16" aria-labelledby="features-title">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <h2 id="features-title" className="text-[22px] font-extrabold text-ink-950 sm:text-2xl">
            سلورا چه کاری انجام می‌دهد؟
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <article key={f.title} className="card p-5">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-brand-100 bg-brand-50 text-2xl shadow-inset"
                  >
                    {f.icon}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-bold text-ink-900">{f.title}</h3>
                    <p className="mt-1 text-[12.5px] leading-7 text-ink-600">{f.desc}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ before/after */}
      <section className="py-12 sm:py-16" aria-labelledby="before-after-title">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <h2 id="before-after-title" className="text-[22px] font-extrabold text-ink-950 sm:text-2xl">
            تفاوت را حس کنید
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="card border-red-200/80 bg-red-50/40 p-5">
              <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-red-800">
                <span aria-hidden="true">😰</span> بدون سلورا
              </h3>
              <ul className="mt-3 space-y-2 text-[12.5px] leading-7 text-red-700/90">
                {[
                  "صبح بیدار می‌شوی، ده‌ها پیام نخونده داری",
                  "بعضی‌ها دیر جواب می‌گیری و از دست می‌روند",
                  "قیمت‌ها را دستی می‌دهی و اشتباه پیش می‌آید",
                  "وقتت صرف جواب‌های تکراری می‌شود",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card border-emerald-200/80 bg-emerald-50/40 p-5">
              <h3 className="flex items-center gap-2 text-[14px] font-extrabold text-emerald-800">
                <span aria-hidden="true">🚀</span> با سلورا
              </h3>
              <ul className="mt-3 space-y-2 text-[12.5px] leading-7 text-emerald-800/90">
                {[
                  "صبح بیدار می‌شوی، سلورا همه را جواب داده",
                  "فقط داغ‌ها را پیگیری می‌کنی و سفارش می‌گیری",
                  "قیمت‌ها همیشه از دیتابیس خودت درست است",
                  "وقتت صرف فروش و رشد می‌شود",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <IconCheck size={15} className="mt-1 shrink-0 text-emerald-600" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- principles */}
      <section className="py-12 sm:py-16" aria-labelledby="principles-title">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <h2 id="principles-title" className="text-[22px] font-extrabold text-ink-950 sm:text-2xl">
            اصل‌های ما درباره داده و امنیت
          </h2>
          <ul className="mt-6 space-y-3">
            {[
              {
                t: "جداسازی کامل tenant:",
                d: "هر فروشگاه فقط داده‌های خودش را می‌بیند؛ این جداسازی در همه‌ی پرس‌وجوها و APIها اعمال می‌شود.",
              },
              {
                t: "بدون ذخیره رمز اینستاگرام:",
                d: "اتصال فقط از طریق OAuth رسمی متا است و توکن دسترسی با AES-256-GCM رمزنگاری می‌شود.",
              },
              {
                t: "صداقت در پاسخ:",
                d: "سلورا قیمت، موجودی یا سیاستی را از خودش نمی‌سازد؛ اگر نداند، می‌گوید نمی‌دانم.",
              },
              {
                t: "کنترل دست شما:",
                d: "هر گفتگو هر لحظه قابل تحویل گرفتن است و پاسخ خودکار با یک دکمه متوقف می‌شود.",
              },
            ].map((p) => (
              <li key={p.t} className="card flex items-start gap-3 p-4">
                <span aria-hidden="true" className="icon-tile icon-tile-brand shrink-0">
                  <IconShield size={18} />
                </span>
                <p className="text-[12.5px] leading-8 text-ink-700">
                  <strong className="font-extrabold text-ink-900">{p.t}</strong> {p.d}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ----------------------------------------------------------- pricing */}
      <section className="py-12 sm:py-16" aria-labelledby="pricing-link-title">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <h2 id="pricing-link-title" className="text-[22px] font-extrabold text-ink-950 sm:text-2xl">
            قیمت‌ها
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.id}
                className={cx(
                  "rounded-card border p-4 text-center",
                  p.badge
                    ? "border-brand-200 bg-white shadow-glowSoft ring-1 ring-brand-100"
                    : "border-ink-100/90 bg-white shadow-card"
                )}
              >
                <div className="text-[13px] font-bold text-ink-800">{PLAN_LABELS[p.id]}</div>
                <div className="tnum mt-2 text-[19px] font-extrabold text-ink-950">
                  {formatToman(p.price * 10)}{" "}
                  <span className="text-[11px] font-semibold text-ink-400">تومان</span>
                </div>
                {p.badge ? (
                  <div className="chip mx-auto mt-2 bg-brand-600 text-white">{p.badge}</div>
                ) : null}
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12px] leading-7 text-ink-500">
            پرداخت در این نسخه کارت‌به‌کارت و با بررسی دستی است؛ پس از ثبت کد رهگیری، درخواست
            حداکثر تا ۲۴ ساعت بررسی و در صورت تأیید فعال می‌شود.
          </p>
        </div>
      </section>

      {/* --------------------------------------------------------- final CTA */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-card border border-brand-700/25 bg-brand-gradient p-7 text-center text-white shadow-glowSoft sm:p-10">
            <BrandAura />
            <span aria-hidden="true" className="relative mx-auto mb-4 block w-fit">
              <SelloraEmblem size={104} tone="white" />
            </span>
            <h2 className="relative text-[22px] font-extrabold leading-relaxed sm:text-3xl">
              همین امروز شروع کنید
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-[13px] leading-8 text-white/85 sm:text-[14px]">
              ثبت‌نام رایگان است و فقط ایمیل لازم دارد. برای روشن شدن پاسخ خودکار، اتصال
              اینستاگرام کسب‌وکار و افزودن محصولات را کامل کنید.
            </p>
            <div className="relative mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-white px-7 text-[14px] font-extrabold text-brand-700 shadow-soft transition hover:bg-brand-50"
              >
                شروع رایگان
              </Link>
              <Link href="/login" className="btn-glass min-h-[48px] px-7 text-[14px]">
                ورود
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
