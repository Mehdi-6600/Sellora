import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Empty } from "@/components/ui/empty";
import { Badge, Dot } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const { dict, locale } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }

  const convos = await prisma.conversation.findMany({
    where: { businessId: auth.businessId },
    orderBy: { lastMessageAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      lead: true,
    },
    take: 100,
  });

  return (
    <AppShell title={dict.conversations.title}>
      {convos.length === 0 ? (
        <Empty
          title={dict.conversations.title}
          subtitle="وقتی اولین پیام مشتری از اینستاگرام برسد، اینجا نمایش داده می‌شود. برای شروع، ابتدا حساب اینستاگرام فروشگاه را متصل کنید."
        />
      ) : (
        <div className="space-y-2">
          {convos.map((c: any) => {
            const last = c.messages[0];
            const isWaiting = c.state === "WAITING_OWNER";
            const isHuman = c.automationLock === "HUMAN";
            const hot = c.lead?.temperature === "HOT";
            return (
              <Link href={`/conversations/${c.id}`} key={c.id} className="card p-3 flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-ink-100 grid place-items-center text-ink-500 font-semibold flex-shrink-0">
                  {(c.customerName || c.customerUsername || "؟").slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold truncate">{c.customerName || c.customerUsername || "مشتری"}</div>
                    {hot && <Badge tone="red">🔥 داغ</Badge>}
                    {isHuman && <Badge tone="blue">شما</Badge>}
                  </div>
                  <div className="text-sm text-ink-500 truncate">
                    {last ? last.text : "گفتگوی جدید"}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {last && (
                    <time className="text-[10px] text-ink-400" dateTime={new Date(last.createdAt).toISOString()}>
                      {formatRelativeTime(last.createdAt, locale)}
                    </time>
                  )}
                  {isWaiting ? <Dot tone="amber" /> : isHuman ? <Dot tone="blue" /> : <Dot tone="green" />}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
