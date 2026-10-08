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
import { formatToman } from "@/lib/utils/format";

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
  return ok ? (
    <span aria-label="دارد" className="text-emerald-600 font-bold text-lg">
      ✓
    </span>
  ) : (
    <span aria-label="ندارد" className="text-red-400 font-bold text-lg">
      ✗
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
      <section className="bg-gradient-to-br from-brand-600 via-brand-500 to-pink-500 text-white">
        <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:py-20">
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-[1.4] mb-4">
            سلورا کارمند فروشی است که ۲۴ ساعته بیدار است
          </h1>
          <p className="text-white/90 text-base leading-9 max-w-3xl mb-6">
            به پیام‌های اینستاگرام مشتری‌هایتان خودکار جواب می‌دهد، قیمت و موجودی را از روی
            محصولات خودتان می‌گوید، مشتری‌های جدی را شناسایی می‌کند و وقتی خوابید یا سرتان
            شلوغ است، تنهایتان نمی‌گذارد.
          </p>
          <div className="bg-white/15 rounded-2xl p-4 text-sm leading-8 backdrop-blur max-w-3xl">
            <strong>مزیتش چیست؟</strong> دیگر لازم نیست پشت گوشی بایستید، پاسخ‌های تکراری
            بدهید یا نگران مشتری‌هایی باشید که در دایرکت گم می‌شوند.
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white" aria-labelledby="who-title">
        <div className="mx-auto w-full max-w-5xl px-4 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 id="who-title" className="text-2xl font-extrabold text-ink-950 mb-4">
              سلورا برای چه کسانی است؟
            </h2>
            <p className="text-sm leading-8 text-ink-600">
              برای فروشگاه‌های اینستاگرامی که فروش‌شان در دایرکت اتفاق می‌افتد: پوشاک، کیف و
              کفش، اکسسوری، لوازم خانگی کوچک، آرایشی و بهداشتی و هر کسب‌وکاری که روزانه ده‌ها
              پیام تکراری می‌گیرد و می‌خواهد هیچ مشتری‌ای بی‌جواب نماند.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-ink-950 mb-4">چطور کار می‌کند؟</h2>
            <ol className="text-sm leading-8 text-ink-600 list-decimal pr-5 space-y-1">
              <li>محصولات و اطلاعات کسب‌وکار (آدرس، ارسال، ساعات کاری) را ثبت می‌کنید.</li>
              <li>حساب اینستاگرام کسب‌وکار را از طریق ورود رسمی متا متصل می‌کنید.</li>
              <li>سلورا پیام‌ها را می‌فهمد، جواب می‌دهد و داغ‌ها را با اعلان به شما می‌دهد.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-ink-50" aria-labelledby="compare-title">
        <div className="mx-auto w-full max-w-5xl px-4">
          <h2 id="compare-title" className="text-2xl font-extrabold text-ink-950 mb-6">
            سلورا در برابر راه‌های دیگر
          </h2>
          <div className="card overflow-hidden">
            <div className="grid grid-cols-4 text-xs font-semibold bg-ink-50 border-b border-ink-100">
              <div className="p-3 text-start">ویژگی</div>
              <div className="p-3 text-center text-brand-600">سلورا</div>
              <div className="p-3 text-center text-ink-500">دستی</div>
              <div className="p-3 text-center text-ink-500">ربات ساده</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-4 text-xs items-center ${
                  i < COMPARISON.length - 1 ? "border-b border-ink-100" : ""
                }`}
              >
                <div className="p-3 text-start font-medium text-ink-800">{row.label}</div>
                <div className="p-3 text-center bg-brand-50/50">
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

      <section className="py-12 sm:py-16 bg-white" aria-labelledby="features-title">
        <div className="mx-auto w-full max-w-5xl px-4">
          <h2 id="features-title" className="text-2xl font-extrabold text-ink-950 mb-6">
            سلورا چه کاری انجام می‌دهد؟
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <article key={f.title} className="card p-5">
                <div className="flex items-start gap-3">
                  <div aria-hidden="true" className="text-2xl shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-ink-900 mb-1">{f.title}</h3>
                    <p className="text-sm text-ink-600 leading-7">{f.desc}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-ink-50" aria-labelledby="before-after-title">
        <div className="mx-auto w-full max-w-5xl px-4">
          <h2 id="before-after-title" className="text-2xl font-extrabold text-ink-950 mb-6">
            تفاوت را حس کنید
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-5 border-red-200 bg-red-50/50">
              <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                <span aria-hidden="true">😰</span> بدون سلورا
              </h3>
              <ul className="text-sm text-red-700/90 leading-8 space-y-1 list-disc pr-5">
                <li>صبح بیدار می‌شوی، ده‌ها پیام نخونده داری</li>
                <li>بعضی‌ها دیر جواب می‌گیری و از دست می‌روند</li>
                <li>قیمت‌ها را دستی می‌دهی و اشتباه پیش می‌آید</li>
                <li>وقتت صرف جواب‌های تکراری می‌شود</li>
              </ul>
            </div>
            <div className="card p-5 border-emerald-200 bg-emerald-50/50">
              <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                <span aria-hidden="true">🚀</span> با سلورا
              </h3>
              <ul className="text-sm text-emerald-700/90 leading-8 space-y-1 list-disc pr-5">
                <li>صبح بیدار می‌شوی، سلورا همه را جواب داده</li>
                <li>فقط داغ‌ها را پیگیری می‌کنی و سفارش می‌گیری</li>
                <li>قیمت‌ها همیشه از دیتابیس خودت درست است</li>
                <li>وقتت صرف فروش و رشد می‌شود</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white" aria-labelledby="principles-title">
        <div className="mx-auto w-full max-w-3xl px-4">
          <h2 id="principles-title" className="text-2xl font-extrabold text-ink-950 mb-6">
            اصل‌های ما درباره داده و امنیت
          </h2>
          <ul className="space-y-3 text-sm leading-8 text-ink-700">
            <li className="card p-4">
              <strong>جداسازی کامل tenant:</strong> هر فروشگاه فقط داده‌های خودش را می‌بیند؛ این
              جداسازی در همه‌ی پرس‌وجوها و APIها اعمال می‌شود.
            </li>
            <li className="card p-4">
              <strong>بدون ذخیره رمز اینستاگرام:</strong> اتصال فقط از طریق OAuth رسمی متا است و
              توکن دسترسی با AES-256-GCM رمزنگاری می‌شود.
            </li>
            <li className="card p-4">
              <strong>صداقت در پاسخ:</strong> سلورا قیمت، موجودی یا سیاستی را از خودش نمی‌سازد؛
              اگر نداند، می‌گوید نمی‌دانم.
            </li>
            <li className="card p-4">
              <strong>کنترل دست شما:</strong> هر گفتگو هر لحظه قابل تحویل گرفتن است و پاسخ خودکار
              با یک دکمه متوقف می‌شود.
            </li>
          </ul>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-ink-50" aria-labelledby="pricing-link-title">
        <div className="mx-auto w-full max-w-3xl px-4">
          <h2 id="pricing-link-title" className="text-2xl font-extrabold text-ink-950 mb-6">
            قیمت‌ها
          </h2>
          <div className="grid gap-3 sm:grid-cols-3 mb-6">
            {PLANS.map((p) => (
              <div key={p.id} className="card p-4 text-center">
                <div className="text-sm font-semibold text-ink-700">{PLAN_LABELS[p.id]}</div>
                <div className="text-lg font-extrabold text-ink-950 mt-1">
                  {formatToman(p.price * 10)} <span className="text-xs font-medium text-ink-500">تومان</span>
                </div>
                {p.badge && <div className="chip bg-brand-50 text-brand-700 mt-2">{p.badge}</div>}
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-500 leading-6">
            پرداخت در این نسخه کارت‌به‌کارت و با بررسی دستی است؛ پس از ثبت کد رهگیری، درخواست حداکثر
            تا ۲۴ ساعت بررسی و در صورت تأیید فعال می‌شود.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-gradient-to-br from-ink-900 to-ink-800 text-white">
        <div className="mx-auto w-full max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-extrabold mb-3">همین امروز شروع کنید</h2>
          <p className="text-sm text-white/75 mb-6 leading-7 max-w-xl mx-auto">
            ثبت‌نام رایگان است و فقط ایمیل لازم دارد. برای روشن شدن پاسخ خودکار، اتصال اینستاگرام
            کسب‌وکار و افزودن محصولات را کامل کنید.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-white text-ink-900 px-6 min-h-[48px] font-bold hover:bg-white/90"
            >
              شروع رایگان
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white px-6 min-h-[48px] font-bold hover:bg-white/20"
            >
              ورود
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
