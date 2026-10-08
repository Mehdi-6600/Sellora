import Link from "next/link";
import { SelloraEmblem } from "@/components/brand/sellora";
import { IconArrowRight, IconSearch } from "@/components/layout/icons";

export const metadata = {
  title: "پیدا نشد",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto w-fit">
          <SelloraEmblem size={132} />
        </div>
        <p className="mt-4 text-[11.5px] font-bold tracking-wide text-brand-600">۴۰۴</p>
        <h1 className="mt-1 text-[20px] font-extrabold text-ink-950">این صفحه پیدا نشد</h1>
        <p className="mt-2 text-[13px] leading-7 text-ink-500">
          نشانی‌ای که باز کردید وجود ندارد یا جابه‌جا شده است. از داشبورد یا صفحه اصلی ادامه بدهید —
          بقیه‌ی برنامه سر جای خودش است.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/dashboard" className="btn-primary min-h-[48px] sm:w-auto">
            رفتن به داشبورد
            <IconArrowRight size={17} className="rtl:rotate-180" />
          </Link>
          <Link href="/" className="btn-secondary min-h-[48px] sm:w-auto">
            صفحه اصلی
          </Link>
        </div>

        <p className="mt-6 inline-flex items-center gap-1.5 text-[11.5px] text-ink-400">
          <IconSearch size={14} />
          اگر لینک را از جایی گرفته‌اید، ممکن است قدیمی شده باشد.
        </p>
      </div>
    </div>
  );
}
