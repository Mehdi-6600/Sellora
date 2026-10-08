import Link from "next/link";

export const metadata = {
  title: "پیدا نشد",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-ink-50 px-6">
      <div className="text-center max-w-sm">
        <div aria-hidden="true" className="text-5xl mb-4">
          🧭
        </div>
        <h1 className="text-xl font-bold text-ink-900 mb-2">صفحه پیدا نشد</h1>
        <p className="text-sm text-ink-500 leading-7 mb-6">
          نشانی‌ای که باز کردید وجود ندارد یا جابه‌جا شده است.
        </p>
        <div className="flex gap-2 justify-center">
          <Link href="/" className="btn-primary min-h-[44px]">
            صفحه اصلی
          </Link>
          <Link href="/dashboard" className="btn-secondary min-h-[44px]">
            داشبورد
          </Link>
        </div>
      </div>
    </div>
  );
}
