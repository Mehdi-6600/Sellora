import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Empty } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const { dict } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }
  const leads = await prisma.lead.findMany({
    where: { businessId: auth.businessId },
    include: { conversation: true },
    orderBy: [{ temperature: "desc" }, { score: "desc" }],
    take: 200,
  });

  return (
    <AppShell title={dict.leads.title} subtitle={dict.leads.subtitle}>
      {leads.length === 0 ? (
        <Empty title="هنوز مشتری داغی شناسایی نشده" subtitle={dict.leads.subtitle} />
      ) : (
        <div className="space-y-2">
          {leads.map((l: any) => {
            const tone = l.temperature === "HOT" ? "red" : l.temperature === "WARM" ? "amber" : "gray";
            return (
              <Link href={`/conversations/${l.conversationId}`} key={l.id} className="card p-4 flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-red-50 text-red-600 grid place-items-center">🔥</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold truncate">
                      {l.conversation.customerName || l.conversation.customerUsername || "مشتری"}
                    </div>
                    <Badge tone={tone as any}>
                      {l.temperature === "HOT" ? dict.leads.hot : l.temperature === "WARM" ? dict.leads.warm : dict.leads.cold}
                    </Badge>
                  </div>
                  <div className="text-xs text-ink-500 mt-1">{l.reason}</div>
                  <div className="text-[11px] text-ink-400 mt-1">امتیاز: {l.score}/100</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
