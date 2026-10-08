import Link from "next/link";
import { PLANS } from "@/lib/config/pricing";
import { formatToman } from "@/lib/utils/format";
import { PublicShell } from "@/components/public/public-shell";
import { SITE_DESCRIPTION, absolute, siteUrl } from "@/lib/config/site";

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
      className="card p-4 w-full max-w-sm mx-auto text-start"
      role="img"
      aria-label="نمایش نمونه‌ای از یک گفتگوی مشتری با سلورا"
    >
      <div className="text-[11px] text-ink-400 mb-3 text-center">نمایش نمونه گفتگو</div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-start">
          <div className="bg-ink-50 border border-ink-100 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%] leading-6">
            سلام، قیمت مانتو آوا چند؟ 🙏
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-brand-600 text-white rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] leading-6">
            سلام! مانتو آوا ۲۴۰٬۰۰۰ تومان موجود است. رنگ‌های مشکی و کرم داریم. 🙂
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-ink-50 border border-ink-100 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[85%] leading-6">
            همینو میخوام، چطوری سفارش بدم؟
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-ink-900 text-white rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] leading-6">
            مشتری داغ شناسایی شد 🔥 — گفتگو به صاحب فروشگاه تحویل داده شد.
          </div>
        </div>
      </div>
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
      <section className="bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="mx-auto w-full max-w-5xl px-4 pt-14 pb-12 sm:pt-20 sm:pb-16 grid gap-10 sm:grid-cols-2 items-center">
          <div>
            <p className="text-sm font-semibold text-brand-700 mb-3">
              برای فروشگاه‌های اینستاگرامی فارسی‌زبان
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-[1.35] text-ink-950">
              فروشنده‌ای که هیچ‌وقت نمی‌خوابد؛
              <span className="text-brand-600"> قیمت‌ها را هم از خودت می‌پرسد</span>
            </h1>
            <p className="mt-4 text-base leading-8 text-ink-600">
              سلورا به دایرکت مشتری‌هایت جواب می‌دهد، قیمت و موجودی را از محصولات خودت می‌گوید،
              مشتری‌های داغ را جدا می‌کند و گفتگوهای حساس را به خودت تحویل می‌دهد.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="btn-primary text-base min-h-[48px]">
                شروع رایگان
              </Link>
              <Link href="/login" className="btn-secondary text-base min-h-[48px]">
                ورود
              </Link>
            </div>
            <p className="mt-4 text-xs text-ink-500 leading-6">
              ثبت‌نام فقط با ایمیل. برای پاسخ خودکار، اتصال اینستاگرام کسب‌وکار لازم است.
            </p>
          </div>
          <ChatDemo />
        </div>
      </section>

      {/* ---------------- Problem ---------------- */}
      <section className="py-12 sm:py-16 bg-white" aria-labelledby="problem-title">
        <div className="mx-auto w-full max-w-5xl px-4">
          <h2 id="problem-title" className="text-2xl font-extrabold text-ink-950 mb-6">
            فروش در اینستاگرام یعنی جواب دادن، دوباره و دوباره
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {PROBLEMS.map((p) => (
              <li key={p} className="card p-4 text-sm leading-7 text-ink-700 flex gap-3">
                <span aria-hidden="true" className="text-red-500 font-bold">
                  ✗
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------- Solution ---------------- */}
      <section className="py-12 sm:py-16 bg-ink-50" aria-labelledby="solution-title">
        <div className="mx-auto w-full max-w-5xl px-4">
          <h2 id="solution-title" className="text-2xl font-extrabold text-ink-950 mb-4">
            سلورا همان کارمند فروش است، بدون شیفت شب
          </h2>
          <p className="text-base leading-8 text-ink-600 max-w-3xl mb-8">
            سلورا یک ربات پاسخ‌ ثابت نیست: پیام مشتری را می‌فهمد، محصول موردنظرش را پیدا می‌کند،
            قیمت و موجودی را لحظه‌ای از دیتابیس شما می‌خواند و اگر مطمئن نباشد، به‌جای حدس زدن،
            گفتگو را به شما می‌سپارد.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" id="features">
            {FEATURES.map((f) => (
              <article key={f.title} className="card p-5">
                <div aria-hidden="true" className="text-2xl mb-3">
                  {f.icon}
                </div>
                <h3 className="font-bold text-ink-900 mb-1">{f.title}</h3>
                <p className="text-sm leading-7 text-ink-600">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="py-12 sm:py-16 bg-white" aria-labelledby="how-title">
        <div className="mx-auto w-full max-w-5xl px-4">
          <h2 id="how-title" className="text-2xl font-extrabold text-ink-950 mb-8">
            در سه قدم روشن می‌شود
          </h2>
          <ol className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="card p-5">
                <div
                  aria-hidden="true"
                  className="h-10 w-10 rounded-2xl bg-brand-600 text-white grid place-items-center font-bold mb-3"
                >
                  {s.n}
                </div>
                <h3 className="font-bold text-ink-900 mb-1">{s.title}</h3>
                <p className="text-sm leading-7 text-ink-600">{s.desc}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-ink-600">
            می‌خواهی بدانی سلورا چه فرقی با یک ربات ساده دارد؟{" "}
            <Link href="/why-sellora" className="text-brand-600 font-semibold hover:underline">
              چرا سلورا؟
            </Link>
          </p>
        </div>
      </section>

      {/* ---------------- Pricing ---------------- */}
      <section className="py-12 sm:py-16 bg-ink-50" id="pricing" aria-labelledby="pricing-title">
        <div className="mx-auto w-full max-w-5xl px-4">
          <h2 id="pricing-title" className="text-2xl font-extrabold text-ink-950 mb-2">
            قیمت‌ها
          </h2>
          <p className="text-sm text-ink-600 mb-8 leading-7">
            بدون قرارداد بلندمدت. پرداخت کارت‌به‌کارت با بررسی دستی؛ پس از تأیید، اشتراک فعال می‌شود.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {PLANS.map((p) => (
              <article
                key={p.id}
                className={`card p-5 relative overflow-hidden ${
                  p.badge ? "border-brand-400 ring-2 ring-brand-100" : ""
                }`}
              >
                {p.badge && (
                  <span className="chip bg-brand-600 text-white absolute top-3 end-3">{p.badge}</span>
                )}
                <h3 className="font-bold text-ink-900">{PLAN_LABELS[p.id]}</h3>
                <div className="mt-3 text-2xl font-extrabold text-ink-950">
                  {formatToman(p.price * 10)} <span className="text-sm font-medium text-ink-500">تومان</span>
                </div>
                <div className="text-xs text-ink-500 mt-1">{p.durationDays} روز</div>
                <Link href="/signup" className="btn-secondary w-full mt-4 min-h-[44px] text-sm">
                  شروع با این پلن
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="py-12 sm:py-16 bg-white" aria-labelledby="faq-title">
        <div className="mx-auto w-full max-w-3xl px-4">
          <h2 id="faq-title" className="text-2xl font-extrabold text-ink-950 mb-6">
            سوال‌های پرتکرار
          </h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="card p-4 group">
                <summary className="cursor-pointer font-semibold text-ink-900 text-sm leading-7 list-none flex items-center justify-between gap-3 min-h-[44px]">
                  {f.q}
                  <span aria-hidden="true" className="text-ink-400 transition group-open:rotate-45">
                    ＋
                  </span>
                </summary>
                <p className="text-sm leading-8 text-ink-600 mt-2">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Final CTA ---------------- */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="mx-auto w-full max-w-3xl px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-relaxed mb-3">
            امشب، دایرکت‌هایت بی‌جواب نمی‌مانند
          </h2>
          <p className="text-sm sm:text-base leading-8 text-white/85 mb-6 max-w-xl mx-auto">
            حسابت را بساز، محصولاتت را اضافه کن و بقیه‌اش با سلورا.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-white text-brand-700 font-bold px-8 min-h-[48px] hover:bg-brand-50"
          >
            شروع رایگان
          </Link>
        </div>
      </section>
      <StructuredData />
    </PublicShell>
  );
}
