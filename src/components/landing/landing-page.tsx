import * as React from "react";
import Link from "next/link";
import { PLANS } from "@/lib/config/pricing";
import { formatToman, toPersianDigits } from "@/lib/utils/format";
import { PublicShell } from "@/components/public/public-shell";
import { SITE_DESCRIPTION, absolute, siteUrl } from "@/lib/config/site";
import { SelloraEmblem, SelloraMark, BrandAura } from "@/components/brand/sellora";
import { IconArrowRight, IconCheck, IconSparkle } from "@/components/layout/icons";

const PLAN_LABELS: Record<string, string> = {
  WEEKLY: "هفتگی",
  MONTHLY: "ماهانه",
  QUARTERLY: "سه‌ماهه",
};

const PROBLEMS = [
  "صبح که بیدار می‌شوی، ده‌ها دایرکت بی‌جواب مانده از شب قبل.",
  "قیمت و موجودی را دستی و دیر جواب می‌دهی؛ مشتری همان لحظه از دست می‌رود.",
  "مشتری جدی از مشتری کنجکاو قابل تشخیص نیست؛ وقتت صرف همه می‌شود.",
  "نیمه‌شب یا وسط شلوغی، سوال تکراری «قیمت چند؟» دوباره و دوباره.",
];

const FEATURES = [
  {
    icon: "💬",
    title: "پاسخ خودکار به دایرکت",
    desc: "سلورا پیام‌های مشتری را می‌فهمد — فارسی، فینگلیش یا عربی — و همان لحظه جواب می‌دهد.",
  },
  {
    icon: "💰",
    title: "قیمت و موجودی از دیتابیس خودت",
    desc: "قبل از هر پاسخ حساس، قیمت و موجودی از محصولات ثبت‌شده‌ی خودتان خوانده می‌شود؛ نه از حدس.",
  },
  {
    icon: "🔥",
    title: "شناسایی مشتری داغ",
    desc: "وقتی مشتری قصد خرید نشان می‌دهد، امتیاز می‌گیرد و در فهرست مشتری‌های داغ بالا می‌آید.",
  },
  {
    icon: "🤝",
    title: "تحویل گفتگو به شما",
    desc: "مکالمه‌ی پیچیده یا حساس خودکار ادامه پیدا نمی‌کند؛ با یک دکمه کنترل را به دست می‌گیرید.",
  },
  {
    icon: "🛍",
    title: "مدیریت محصولات",
    desc: "افزودن تکی یا ورود دسته‌جمعی با قالب ساده‌ی «نام | قیمت | وضعیت»، همراه با پیش‌نمایش.",
  },
  {
    icon: "🔔",
    title: "اعلان‌ها و داشبورد",
    desc: "مشتری داغ، گفتگوی منتظر شما، وضعیت اینستاگرام و اشتراک — همه در یک نگاه روی موبایل.",
  },
];

const STEPS = [
  { n: "۱", title: "حساب بساز و محصولاتت را اضافه کن", desc: "ثبت‌نام با ایمیل؛ محصولات را تکی یا دسته‌جمعی وارد کن." },
  { n: "۲", title: "اینستاگرام کسب‌وکار را متصل کن", desc: "از طریق ورود رسمی متا؛ رمز اینستاگرام تو هرگز ذخیره نمی‌شود." },
  { n: "۳", title: "سلورا پاسخ می‌دهد و داغ‌ها را خبرت می‌کند", desc: "پاسخ خودکار روشن می‌شود؛ مشتری‌های داغ با اعلان به تو می‌رسند." },
];

const FAQ = [
  {
    q: "آیا سلورا از خودش قیمت یا موجودی می‌سازد؟",
    a: "نه. سلورا فقط از محصولات و اطلاعات کسب‌وکاری که خودتان ثبت کرده‌اید جواب می‌دهد. اگر چیزی را نداند، صادقانه می‌گوید نمی‌دانم و از شما می‌پرسد.",
  },
  {
    q: "اتصال اینستاگرام چگونه انجام می‌شود؟",
    a: "فقط از طریق OAuth رسمی متا (Meta Graph API). رمز عبور اینستاگرام شما هیچ‌وقت در سلورا ذخیره نمی‌شود و توکن دسترسی با رمزنگاری AES-256 نگهداری می‌شود. برای استفاده‌ی واقعی در اینستاگرام، اپلیکیشن متا باید App Review را گذرانده باشد.",
  },
  {
    q: "پرداشت اشتراک چگونه است؟",
    a: "در این نسخه پرداخت کارت‌به‌کارت با بررسی دستی است: مبلغ پلن را واریز می‌کنید، کد رهگیری را ثبت می‌کنید و درخواست حداکثر تا ۲۴ ساعت بررسی و فعال می‌شود. درگاه پرداخت آنلاین هنوز فعال نیست.",
  },
  {
    q: "اگر مکالمه‌ای پیچیده یا حساس شود چه؟",
    a: "سلورا گفتگو را به شما تحویل می‌دهد و پاسخ خودکار را متوقف می‌کند. خودتان ادامه می‌دهید و هر وقت خواستید دوباره به سلورا برمی‌گردانید.",
  },
  {
    q: "اطلاعات فروشگاه من از بقیه جداست؟",
    a: "بله. هر فروشگاه فقط و فقط داده‌های خودش را می‌بیند؛ جداسازی tenant در همه‌ی پرس‌وجوها و APIها اعمال می‌شود.",
  },
];

function ChatDemo() {
  return (
    <div
      className="card relative w-full max-w-sm p-4 text-start shadow-raised"
      role="img"
      aria-label="نمایش نمونه‌ای از یک گفتگوی مشتری با سلورا"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <SelloraMark size={26} />
          <span className="text-[11.5px] font-bold text-ink-700">سلورا در دایرکت</span>
        </span>
        <span className="chip bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/25">آنلاین</span>
      </div>

      <div className="space-y-2 text-[13px]">
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-2xl rounded-ss-md border border-ink-100 bg-canvas-soft px-3 py-2 leading-6 text-ink-800">
            سلام، قیمت مانتو آوا چند؟ 🙏
          </div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-se-md bg-brand-gradient px-3 py-2 leading-6 text-white shadow-glowSoft">
            سلام! مانتو آوا ۲۴۰٬۰۰۰ تومان موجود است. رنگ‌های مشکی و کرم داریم. 🙂
          </div>
        </div>
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-2xl rounded-ss-md border border-ink-100 bg-canvas-soft px-3 py-2 leading-6 text-ink-800">
            همینو میخوام، چطوری سفارش بدم؟
          </div>
        </div>
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-se-md bg-violet-400/15 px-3 py-2 leading-6 text-violet-200 ring-1 ring-violet-400/25">
            مشتری داغ شناسایی شد 🔥 — گفتگو به صاحب فروشگاه تحویل داده شد.
          </div>
        </div>
      </div>

      <p className="mt-3 border-t border-ink-100 pt-2.5 text-[10.5px] font-medium leading-5 text-ink-400">
        پاسخ‌ها از محصولات و اطلاعات خود فروشگاه ساخته می‌شوند.
      </p>
    </div>
  );
}

/**
 * Structured data, generated from real configuration only:
 * Organization + WebSite + an OfferCatalog built from the single pricing
 * source of truth. Prices are emitted in RIALS with the ISO 4217 code IRR
 * (the display unit toman has no ISO code). No SearchAction: Sellora has no
 * public search endpoint to back one.
 */
function StructuredData() {
  const base = siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: "Sellora",
        alternateName: "سلورا",
        url: base,
        logo: absolute("/icons/icon-512.png"),
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: "سلورا",
        inLanguage: "fa",
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${base}/#organization` },
      },
      {
        "@type": "Product",
        "@id": `${base}/#product`,
        name: "اشتراک سلورا",
        description: SITE_DESCRIPTION,
        brand: { "@id": `${base}/#organization` },
        offers: {
          "@type": "OfferCatalog",
          name: "پلن‌های اشتراک سلورا",
          itemListElement: PLANS.map((p) => ({
            "@type": "Offer",
            name: PLAN_LABELS[p.id],
            price: p.price * 10,
            priceCurrency: "IRR",
            availability: "https://schema.org/InStock",
            url: absolute("/signup"),
          })),
        },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function LandingPage() {
  return (
    <PublicShell>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-2 lg:gap-12 lg:pb-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-[11.5px] font-bold text-brand-700">
              <IconSparkle size={14} />
              برای فروشگاه‌های اینستاگرامی فارسی‌زبان
            </p>
            <h1 className="mt-4 text-[28px] font-extrabold leading-[1.35] text-ink-950 sm:text-[38px]">
              فروشنده‌ای که هیچ‌وقت نمی‌خوابد؛
              <span className="bg-gradient-to-l from-brand-600 to-brand-800 bg-clip-text text-transparent">
                {" "}
                قیمت‌ها را هم از خودت می‌پرسد
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-[14px] leading-8 text-ink-600 sm:text-[15px]">
              سلورا به دایرکت مشتری‌هایت جواب می‌دهد، قیمت و موجودی را از محصولات خودت می‌گوید،
              مشتری‌های داغ را جدا می‌کند و گفتگوهای حساس را به خودت تحویل می‌دهد.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn-primary min-h-[52px] text-[15px] sm:w-auto">
                شروع رایگان
                <IconArrowRight size={18} className="rtl:rotate-180" />
              </Link>
              <Link href="/login" className="btn-secondary min-h-[52px] text-[15px]">
                ورود به حساب
              </Link>
            </div>

            <ul className="mt-6 grid gap-2 text-[12.5px] text-ink-600 sm:grid-cols-3">
              {["بدون نیاز به دانش فنی", "رمز اینستاگرام ذخیره نمی‌شود", "لغو در هر زمان"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                      <IconCheck size={12} />
                    </span>
                    {t}
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <span
              aria-hidden="true"
              className="absolute -top-6 start-0 hidden lg:block"
            >
              <SelloraEmblem size={132} />
            </span>
            <ChatDemo />
          </div>
        </div>
      </section>

      {/* ---------------- Problem ---------------- */}
      <section className="py-12 sm:py-16" aria-labelledby="problem-title">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 id="problem-title" className="mb-6 text-[22px] font-extrabold text-ink-950 sm:text-2xl">
            فروش در اینستاگرام یعنی جواب دادن، دوباره و دوباره
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {PROBLEMS.map((p) => (
              <li key={p} className="card flex gap-3 p-4 text-[13px] leading-7 text-ink-700">
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-red-400/15 font-bold text-red-400"
                >
                  ✕
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- Solution ---------------- */}
      <section className="py-12 sm:py-16" aria-labelledby="solution-title">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="rounded-card border border-brand-100 bg-brand-gradient-soft p-5 sm:p-7">
            <h2 id="solution-title" className="text-[22px] font-extrabold text-ink-950 sm:text-2xl">
              سلورا همان کارمند فروش است، بدون شیفت شب
            </h2>
            <p className="mt-3 max-w-3xl text-[13.5px] leading-8 text-ink-600">
              سلورا یک ربات پاسخ‌ ثابت نیست: پیام مشتری را می‌فهمد، محصول موردنظرش را پیدا می‌کند،
              قیمت و موجودی را لحظه‌ای از دیتابیس شما می‌خواند و اگر مطمئن نباشد، به‌جای حدس زدن،
              گفتگو را به شما می‌سپارد.
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" id="features">
            {FEATURES.map((f) => (
              <article key={f.title} className="card p-5">
                <div
                  aria-hidden="true"
                  className="grid h-12 w-12 place-items-center rounded-2xl border border-brand-100 bg-brand-50 text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                >
                  {f.icon}
                </div>
                <h3 className="mt-3 text-[14px] font-bold text-ink-900">{f.title}</h3>
                <p className="mt-1 text-[12.5px] leading-7 text-ink-600">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="py-12 sm:py-16" aria-labelledby="how-title">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 id="how-title" className="mb-8 text-[22px] font-extrabold text-ink-950 sm:text-2xl">
            در سه قدم روشن می‌شود
          </h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="card relative p-5">
                <div
                  aria-hidden="true"
                  className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient text-[15px] font-extrabold text-white shadow-glowSoft"
                >
                  {s.n}
                </div>
                <h3 className="mt-3 text-[14px] font-bold text-ink-900">{s.title}</h3>
                <p className="mt-1 text-[12.5px] leading-7 text-ink-600">{s.desc}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-[13px] text-ink-600">
            می‌خواهی بدانی سلورا چه فرقی با یک ربات ساده دارد؟{" "}
            <Link href="/why-sellora" className="font-bold text-brand-700 hover:underline">
              چرا سلورا؟
            </Link>
          </p>
        </div>
      </section>

      {/* ---------------- Pricing ---------------- */}
      <section className="py-12 sm:py-16" id="pricing" aria-labelledby="pricing-title">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 id="pricing-title" className="text-[22px] font-extrabold text-ink-950 sm:text-2xl">
            قیمت‌ها
          </h2>
          <p className="mb-8 mt-2 text-[13px] leading-7 text-ink-600">
            بدون قرارداد بلندمدت. پرداخت کارت‌به‌کارت با بررسی دستی؛ پس از تأیید، اشتراک فعال می‌شود.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {PLANS.map((p) => (
              <article
                key={p.id}
                className={
                  p.badge
                    ? "relative overflow-hidden rounded-card border border-brand-200 bg-white/[0.06] p-5 shadow-glowSoft ring-1 ring-brand-100"
                    : "card p-5"
                }
              >
                {p.badge ? (
                  <span className="chip absolute end-4 top-4 bg-brand-600 text-white">{p.badge}</span>
                ) : null}
                <h3 className="text-[14px] font-bold text-ink-900">{PLAN_LABELS[p.id]}</h3>
                <div className="tnum mt-3 text-[26px] font-extrabold text-ink-950">
                  {formatToman(p.price * 10)}
                  <span className="ms-1 text-[12px] font-semibold text-ink-400">تومان</span>
                </div>
                <div className="mt-1 text-[11.5px] text-ink-500">
                  {toPersianDigits(p.durationDays)} روز اعتبار
                </div>
                <Link href="/signup" className="btn-secondary mt-4 w-full min-h-[44px]">
                  شروع با این پلن
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="py-12 sm:py-16" aria-labelledby="faq-title">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <h2 id="faq-title" className="mb-6 text-[22px] font-extrabold text-ink-950 sm:text-2xl">
            سوال‌های پرتکرار
          </h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="card group p-4">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 text-[13.5px] font-bold leading-7 text-ink-900">
                  {f.q}
                  <span
                    aria-hidden="true"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-canvas-soft text-ink-500 transition group-open:rotate-45"
                  >
                    ＋
                  </span>
                </summary>
                <p className="mt-2 text-[12.5px] leading-8 text-ink-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Final CTA ---------------- */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-card border border-white/10 bg-premium-gradient p-7 text-center text-white shadow-premium sm:p-10">
            <BrandAura />
            <span aria-hidden="true" className="relative mx-auto mb-4 block w-fit">
              <SelloraEmblem size={104} tone="white" />
            </span>
            <h2 className="relative text-[22px] font-extrabold leading-relaxed sm:text-3xl">
              امشب، دایرکت‌هایت بی‌جواب نمی‌مانند
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-[13px] leading-8 text-white/85 sm:text-[14px]">
              حسابت را بساز، محصولاتت را اضافه کن و بقیه‌اش با سلورا.
            </p>
            <div className="relative mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-white px-7 text-[14px] font-extrabold text-brand-600 shadow-soft transition hover:bg-brand-950"
              >
                شروع رایگان
              </Link>
              <Link href="/why-sellora" className="btn-glass min-h-[48px] px-7 text-[14px]">
                چرا سلورا؟
              </Link>
            </div>
          </div>
        </div>
      </section>
      <StructuredData />
    </PublicShell>
  );
}
