import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { RulesetForm } from "./ruleset-form";

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
    <AppShell title={dict.settings.business.title} backHref="/settings" subtitle="اطلاعات فروشگاه شما که در پاسخ‌های خودکار استفاده می‌شود.">
      <RulesetForm dict={dict} initial={JSON.parse(JSON.stringify(ruleset))} />
    </AppShell>
  );
}
