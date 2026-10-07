import Link from "next/link";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: "🎯",
    title: "پاسخ خودکار به سوالات مشتری",
    desc: "قیمت، موجودی، زمان ارسال، آدرس، شرایط گارانتی — هر سوالی که مشتری زیاد می‌پرسه، Sellora خودش جواب می‌ده.",
    color: "from-pink-50 to-white",
  },
  {
    icon: "💰",
    title: "قیمت و موجودی لحظه‌ای",
    desc: "قبل از هر پاسخ حساس، Sellora به دیتابیس نگاه می‌کنه. قیمت‌ها همیشه از دیتابیس خودت خونده می‌شن، نه از حدس و گمان.",
    color: "from-emerald-50 to-white",
  },
  {
    icon: "🔥",
    title: "شناسایی مشتری‌های داغ",
    desc: "Sellora می‌فهمه کی جدی می‌خواد بخره. وقتی مشتری می‌گه «می‌خوام بخرم»، فوراً بهت خبر می‌ده تا دیر نشه.",
    color: "from-red-50 to-white",
  },
  {
    icon: "🤝",
    title: "تحویل به شما وقتی لازمه",
    desc: "مکالمات پیچیده یا حساس رو Sellora خودش ادامه نمی‌ده. بهت پاس می‌ده تا خودت تصمیم بگیری. یه دکمه، همه‌چی دست تو.",
    color: "from-amber-50 to-white",
  },
  {
    icon: "🌍",
    title: "فهمیدن فارسی، فینگلیش، عربی، انگلیسی",
    desc: "چه کسی رسمی سلام کنه، چه فینگلیش بنویسه (salam gheymat chande?)، Sellora هر چهار حالت رو می‌فهمه و جواب می‌ده.",
    color: "from-sky-50 to-white",
  },
  {
    icon: "📊",
    title: "آمار و گزارش شفاف",
    desc: "چند تا مکالمه خودکار حل شد؟ چند تا مشتری داغ؟ چند درصد پاسخ‌ها خودکار بودن؟ همه توی داشبورد، بدون پیچیدگی.",
    color: "from-violet-50 to-white",
  },
  {
    icon: "🔒",
    title: "امنیت و جداسازی داده‌ها",
    desc: "اطلاعات هر فروشگاه کاملاً جدا نگه‌داری می‌شه. توکن‌های اینستاگرام با رمزنگاری AES-256 محافظت می‌شن.",
    color: "from-slate-50 to-white",
  },
  {
    icon: "🧠",
    title: "هیچ‌وقت از خودش چیزی نمی‌سازه",
    desc: "Sellora فقط بر اساس اطلاعاتی که تو وارد کردی جواب می‌ده. اگه چیزی رو ندونه، صادقانه می‌گه «نمی‌دونم» و از تو می‌پرسه.",
    color: "from-cyan-50 to-white",
  },
];

const COMPARISON = [
  { label: "پاسخ خودکار ۲۴/۷", sellora: true, manual: false, bot: true },
  { label: "قیمت و موجودی از دیتابیس خودت", sellora: true, manual: true, bot: false },
  { label: "شناسایی مشتری داغ", sellora: true, manual: false, bot: false },
  { label: "تحویل مکالمه به صاحب فروشگاه", sellora: true, manual: false, bot: false },
  { label: "گزارش و آمار", sellora: true, manual: false, bot: false },
  { label: "بدون نیاز به دانش فنی", sellora: true, manual: true, bot: false },
  { label: "هیچ‌وقت اطلاعات اشتباه نمی‌ده", sellora: true, manual: false, bot: false },
];

function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="text-emerald-600 font-bold text-lg">✓</span>
  ) : (
    <span className="text-red-400 font-bold text-lg">✗</span>
  );
}

export default async function WhySelloraPage() {
  const { dict } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    // برای امنیت، اگه لاگین نبود، به /login می‌ره
    // ولی کاربر لاگین‌شده مستقیم می‌بینه
    throw new Response(null, { status: 401 });
  }

  return (
    <AppShell title="چرا Sellora؟" backHref="/settings">
      {/* بخش ۱: خلاصه */}
      <div className="rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-pink-500 text-white p-6 mb-6 shadow-lg">
        <div className="text-3xl font-bold mb-3 leading-relaxed">
          Sellora یه کارمند فروشه که ۲۴ ساعته بیداره 🌙
        </div>
        <p className="text-white/90 text-sm leading-7 mb-4">
          به پیام‌های اینستاگرام مشتری‌هات خودکار جواب می‌ده، قیمت و موجودی رو از روی محصولات خودت می‌گه،
          مشتری‌های جدی رو شناسایی می‌کنه، و وقتی خوابی یا سرت شلوغه، تنهات نمی‌ذاره.
        </p>
        <div className="bg-white/15 rounded-2xl p-3 text-xs leading-6 backdrop-blur">
          <strong className="text-white">مزیتش چیه؟</strong>{" "}
          دیگه لازم نیست پشت گوشی وایستی، پاسخ‌های تکراری بدی، یا نگران مشتری‌هایی باشی که توی دایرکت گم می‌شن.
        </div>
      </div>

      {/* بخش ۲: مقایسه */}
      <div className="section-title mb-3">Sellora vs بقیه</div>
      <Card className="overflow-hidden mb-6">
        <div className="grid grid-cols-4 text-xs font-semibold bg-ink-50 border-b border-ink-100">
          <div className="p-3 text-right">ویژگی</div>
          <div className="p-3 text-center text-brand-600">Sellora</div>
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
            <div className="p-3 text-right font-medium text-ink-800">{row.label}</div>
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
      </Card>

      {/* بخش ۳: قابلیت‌ها */}
      <div className="section-title mb-3">Sellora چیکار می‌کنه؟</div>
      <div className="space-y-3 mb-6">
        {FEATURES.map((f) => (
          <Card
            key={f.title}
            className={`p-4 bg-gradient-to-bl ${f.color} border-ink-100`}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl shrink-0">{f.icon}</div>
              <div className="flex-1">
                <div className="font-semibold text-ink-900 mb-1">{f.title}</div>
                <div className="text-sm text-ink-600 leading-7">{f.desc}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* بخش ۴: قبل و بعد */}
      <div className="section-title mb-3">تفاوت رو حس کن</div>
      <div className="grid grid-cols-1 gap-3 mb-6">
        <Card className="p-4 border-red-200 bg-red-50/50">
          <div className="font-semibold text-red-800 mb-2 flex items-center gap-2">
            <span>😰</span> بدون Sellora
          </div>
          <ul className="text-sm text-red-700/90 leading-7 space-y-1.5 list-disc pr-5">
            <li>صبح بیدار می‌شی، ۵۰ تا پیام نخونده داری</li>
            <li>بعضی‌ها دیر جواب می‌دی، از دست می‌ری</li>
            <li>قیمت‌ها اشتباه می‌دی، اعتبارت می‌ره</li>
            <li>وقتت صرف جواب‌های تکراری می‌شه</li>
          </ul>
        </Card>

        <Card className="p-4 border-emerald-200 bg-emerald-50/50">
          <div className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
            <span>🚀</span> با Sellora
          </div>
          <ul className="text-sm text-emerald-700/90 leading-7 space-y-1.5 list-disc pr-5">
            <li>صبح بیدار می‌شی، Sellora همه رو جواب داده</li>
            <li>فقط به داغ‌ها نگاه می‌کنی و سفارش می‌گیری</li>
            <li>قیمت‌ها همیشه از دیتابیس درسته</li>
            <li>وقتت صرف فروش و رشد می‌شه</li>
          </ul>
        </Card>
      </div>

      {/* بخش ۵: CTA */}
      <Card className="p-6 text-center bg-gradient-to-br from-ink-900 to-ink-800 text-white border-0">
        <div className="text-lg font-bold mb-2">همین امروز شروع کن</div>
        <p className="text-xs text-white/70 mb-4 leading-6">
          یک هفته رایگان. بدون نیاز به کارت اعتباری. هر وقت نخواستی، لغو کن.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/settings/subscription"
            className="bg-white text-ink-900 rounded-xl px-5 py-3 text-sm font-semibold hover:bg-white/90"
          >
            مشاهده پلن‌ها
          </Link>
          <Link
            href="/settings"
            className="bg-white/10 border border-white/20 text-white rounded-xl px-5 py-3 text-sm font-semibold hover:bg-white/20"
          >
            بازگشت به تنظیمات
          </Link>
        </div>
      </Card>

      <div className="h-6" />
    </AppShell>
  );
}
