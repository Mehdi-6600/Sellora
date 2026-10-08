import Link from "next/link";
import type { Metadata } from "next";
import { getServerDict } from "@/lib/i18n";
import { SITE_NAME, absolute } from "@/lib/config/site";
import { AuthLayout } from "@/components/public/auth-layout";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = {
  title: `ثبت‌نام | ${SITE_NAME}`,
  description:
    "حساب سلورا را بسازید: پاسخ خودکار دایرکت اینستاگرام، شناسایی مشتری داغ و مدیریت محصولات در یک داشبورد ساده.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/signup" },
  openGraph: { url: absolute("/signup"), title: `ثبت‌نام | ${SITE_NAME}` },
};

export default async function SignupPage() {
  const { dict } = await getServerDict();
  return (
    <AuthLayout
      title={dict.auth.signupCta}
      subtitle="در کمتر از یک دقیقه، فروشنده هوشمند خود را فعال کنید."
      footer={
        <>
          {dict.auth.haveAccount}{" "}
          <Link href="/login" className="font-bold text-brand-700 hover:underline">
            {dict.auth.login}
          </Link>
        </>
      }
    >
      <SignupForm dict={dict} />
    </AuthLayout>
  );
}
export const dynamic = "force-dynamic";
