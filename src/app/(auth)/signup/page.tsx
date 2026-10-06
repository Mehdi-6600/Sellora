import Link from "next/link";
import { getServerDict } from "@/lib/i18n";
import { SignupForm } from "./signup-form";

export default async function SignupPage() {
  const { dict } = await getServerDict();
  return (
    <div className="min-h-screen flex flex-col items-stretch px-6 py-10 max-w-md mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <div className="h-10 w-10 rounded-2xl bg-brand-600 text-white grid place-items-center font-bold">S</div>
        <div>
          <div className="font-bold text-lg">{dict.app.name}</div>
          <div className="text-xs text-ink-500">{dict.app.tagline}</div>
        </div>
      </div>
      <h1 className="text-2xl font-bold mt-2">{dict.auth.signupCta}</h1>
      <p className="text-sm text-ink-500 mt-1">در کمتر از یک دقیقه، فروشنده هوشمند خود را فعال کنید.</p>
      <div className="mt-8">
        <SignupForm dict={dict} />
      </div>
      <div className="mt-6 text-center text-sm text-ink-500">
        {dict.auth.haveAccount}{" "}
        <Link href="/login" className="text-brand-600 font-medium">
          {dict.auth.login}
        </Link>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
