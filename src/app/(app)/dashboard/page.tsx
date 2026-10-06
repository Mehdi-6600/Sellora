import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Badge, Dot } from "@/components/ui/badge";
import { formatToman } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { dict } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch (e: any) {
    if (e instanceof Response) {
      const headers: Record<string, string> = {};
      e.headers.forEach((v, k) => (headers[k] = v));
      if (e.status === 401) redirect("/login");
    }
    throw e;
  }

  const [convoCount, hotLeadCount, waitingCount, ig, productCount, auto, leads, totalResolved, totalMessages] =
    await Promise.all([
      prisma.conversation.count({ where: { businessId: auth.businessId } }),
      prisma.lead.count({ where: { businessId: auth.businessId, temperature: "HOT" } }),
      prisma.conversation.count({ where: { businessId: auth.businessId, state: "WAITING_OWNER" } }),
      prisma.instagramAccount.findUnique({ where: { businessId: auth.businessId } }),
      prisma.product.count({ where: { businessId: auth.businessId } }),
      prisma.automationConfig.findUnique({ where: { businessId: auth.businessId } }),
      prisma.lead.findMany({
        where: { businessId: auth.businessId, temperature: "HOT" },
        include: { conversation: true },
        orderBy: { score: "desc" },
        take: 3,
      }),
      prisma.conversation.count({ where: { businessId: auth.businessId, state: { in: ["COMPLETED", "WAITING_CUSTOMER"] } } }),
      prisma.message.count({
        where: { businessId: auth.businessId, senderType: "SELLORA", deliveryState: "SENT" },
      }),
    ]);

  const resolutionRate = convoCount > 0 ? Math.round((totalResolved / convoCount) * 100) : 0;

  const showOnboarding = !auto?.enabled || ig?.status !== "CONNECTED" || productCount === 0;

  return (
    <AppShell
      title={
        <span>
          {dict.dashboard.greeting}، {auth.user.name || auth.business.name} 👋
        </span>
      }
      subtitle={dict.app.tagline}
    >
      {showOnboarding && (
        <Link
          href="/onboarding"
          className="block card p-4 mb-4 bg-gradient-to-l from-brand-50 to-white border-brand-200"
        >
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-brand-600 text-white grid place-items-center">🚀</div>
            <div>
              <div className="font-semibold text-ink-900">{dict.dashboard.startOnboarding}</div>
              <div className="text-sm text-ink-600 mt-0.5">
                {ig?.status === "CONNECTED" ? dict.dashboard.addProductsDesc : dict.dashboard.connectInstagramDesc}
              </div>
            </div>
            <div className="ms-auto text-brand-600 rtl:rotate-180">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </div>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-gradient-to-br from-brand-600 to-brand-500 text-white border-0 shadow-none">
          <div className="text-xs opacity-80">خودکار حل شد</div>
          <div className="mt-1 text-2xl font-bold">{totalResolved}</div>
          <div className="text-xs opacity-80 mt-0.5">
            از {convoCount} گفتگو ({resolutionRate}٪)
          </div>
        </Card>
        <Link href="/leads" className="card p-4">
          <div className="text-xs text-ink-500">{dict.dashboard.hotLeads}</div>
          <div className="mt-1 text-2xl font-bold text-red-600">{hotLeadCount}</div>
          <div className="text-xs text-ink-500 mt-0.5">{dict.dashboard.hotLeadsDesc}</div>
        </Link>
        <Link href="/conversations" className="card p-4">
          <div className="text-xs text-ink-500">{dict.dashboard.conversationsOpen}</div>
          <div className="mt-1 text-2xl font-bold">{convoCount}</div>
          <div className="text-xs text-ink-500 mt-0.5">
            {waitingCount > 0 ? `${waitingCount} ${dict.dashboard.conversationsWaiting}` : "همه تحت کنترل ✨"}
          </div>
        </Link>
        <Card className="p-4">
          <div className="text-xs text-ink-500">{dict.dashboard.autoRate}</div>
          <div className="mt-1 text-2xl font-bold">{resolutionRate}٪</div>
          <div className="text-xs text-ink-500 mt-0.5">{totalMessages} پاسخ خودکار</div>
        </Card>
      </div>

      <div className="section-title">{dict.dashboard.hotLeads}</div>
      {leads.length === 0 ? (
        <Card className="p-6 text-center text-sm text-ink-500">هنوز مشتری داغی شناسایی نشده.</Card>
      ) : (
        <div className="space-y-2">
          {leads.map((lead: any) => (
            <Link key={lead.id} href={`/conversations`} className="card p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-50 text-red-600 grid place-items-center font-bold">🔥</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink-900 truncate">
                  {lead.conversation.customerName || lead.conversation.customerUsername || "مشتری"}
                </div>
                <div className="text-xs text-ink-500 truncate">{lead.reason}</div>
              </div>
              <Badge tone="red">{lead.score}/100</Badge>
            </Link>
          ))}
        </div>
      )}

      <div className="section-title">وضعیت سرویس</div>
      <div className="grid grid-cols-1 gap-2">
        <StatusRow
          label={dict.nav.instagram}
          connected={ig?.status === "CONNECTED"}
          okText={dict.settings.instagram.statusConnected}
          badText={dict.settings.instagram.statusDisconnected}
          href="/settings/instagram"
        />
        <StatusRow
          label={dict.nav.products}
          connected={productCount > 0}
          okText={`${productCount} محصول ثبت شده`}
          badText="محصولی ثبت نشده"
          href="/products"
        />
        <StatusRow
          label="پاسخ‌گویی خودکار"
          connected={auto?.enabled ?? false}
          okText="فعال"
          badText="غیرفعال"
          href="/settings"
        />
      </div>
    </AppShell>
  );
}

function StatusRow({
  label,
  connected,
  okText,
  badText,
  href,
}: {
  label: string;
  connected: boolean;
  okText: string;
  badText: string;
  href: string;
}) {
  return (
    <Link href={href} className="card p-3 flex items-center gap-3">
      <Dot tone={connected ? "green" : "amber"} />
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-ink-500">{connected ? okText : badText}</div>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-400 rtl:rotate-180">
        <path d="m15 18-6-6 6-6" />
      </svg>
    </Link>
  );
}

// formatToman is imported to keep tree-shaking happy in locales where prices might be shown later.
void formatToman;
