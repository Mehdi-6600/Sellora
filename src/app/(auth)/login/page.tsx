import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SITE_NAME, absolute } from "@/lib/config/site";

export const metadata: Metadata = {
  title: `ورود | ${SITE_NAME}`,
  description: "ورود به حساب سلورا برای مدیریت گفتگوها، محصولات و مشتری‌های داغ.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/login" },
  openGraph: { url: absolute("/login"), title: `ورود | ${SITE_NAME}` },
};
import { getServerDict } from "@/lib/i18n";
import { AuthLayout } from "@/components/public/auth-layout";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const { dict } = await getServerDict();
  return (
    <AuthLayout
      title={dict.auth.loginCta}
      subtitle={dict.app.tagline}
      footer={
        <>
          {dict.auth.noAccount}{" "}
          <Link href="/signup" className="font-bold text-brand-700 hover:underline">
            {dict.auth.signup}
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="h-32 skeleton" />}>
        <LoginForm dict={dict} />
      </Suspense>
    </AuthLayout>
  );
}

export const dynamic = "force-dynamic";
