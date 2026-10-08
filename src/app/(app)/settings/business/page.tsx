import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { RulesetForm } from "./ruleset-form";
import { IconInfo } from "@/components/layout/icons";

export const dynamic = "force-dynamic";

export default async function BusinessSettingsPage() {
  const { dict } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }

  const ruleset =
    (await prisma.businessRuleset.findFirst({
      where: { businessId: auth.businessId, isActive: true },
      orderBy: { version: "desc" },
    })) ?? ({} as any);

  return (
    <AppShell
      title={dict.settings.business.title}
      backHref="/settings"
      subtitle="اطلاعاتی که سلورا در پاسخ‌های خودکار به مشتری‌ها می‌گوید"
    >
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <div className="flex items-start gap-2.5 rounded-card border border-brand-100 bg-brand-50/70 p-3.5">
          <IconInfo size={17} className="mt-0.5 shrink-0 text-brand-500" />
          <p className="text-[12px] leading-6 text-brand-900">
            هرچه این اطلاعات دقیق‌تر باشد، پاسخ‌های خودکار کامل‌تر می‌شود. سلورا برای سوال‌های ارسال،
            آدرس، پرداخت و بازگشت کالا دقیقاً همین متن‌ها را استفاده می‌کند.
          </p>
        </div>
        <RulesetForm dict={dict} initial={JSON.parse(JSON.stringify(ruleset))} />
      </div>
    </AppShell>
  );
}
