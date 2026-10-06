import { notFound, redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { ChatPanel } from "./chat-panel";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { dict, locale } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }
  const convo = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      lead: true,
    },
  });
  if (!convo || convo.businessId !== auth.businessId) notFound();

  return (
    <AppShell
      backHref="/conversations"
      title={
        <div className="flex items-center gap-2">
          <span>{convo.customerName || convo.customerUsername || "مشتری"}</span>
          {convo.automationLock === "HUMAN" ? (
            <Badge tone="blue">در حال پاسخ‌گویی شما</Badge>
          ) : convo.state === "WAITING_OWNER" ? (
            <Badge tone="amber">نیاز به شما</Badge>
          ) : (
            <Badge tone="green">خودکار</Badge>
          )}
          {convo.lead?.temperature === "HOT" && <Badge tone="red">🔥 داغ</Badge>}
        </div>
      }
    >
      <div className="flex flex-col gap-2 pb-4">
        {convo.messages.length === 0 && (
          <div className="text-center text-sm text-ink-500 py-10">هنوز پیامی در این گفتگو نیست.</div>
        )}
        <div className="space-y-2" id="messages">
          {convo.messages.map((m: any) => (
            <div key={m.id} className={`flex ${m.direction === "INBOUND" ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-7 ${
                  m.direction === "INBOUND"
                    ? "bg-white border border-ink-100 text-ink-900 rounded-tr-sm"
                    : m.senderType === "OWNER"
                    ? "bg-ink-900 text-white rounded-tl-sm"
                    : "bg-brand-600 text-white rounded-tl-sm"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div className={`text-[10px] mt-1 opacity-70 ${m.direction === "INBOUND" ? "text-ink-500" : "text-white/70"} text-start`}>
                  {formatTime(m.createdAt, locale as any)}
                  {m.deliveryState !== "SENT" && m.direction === "OUTBOUND" && (
                    <span className="ms-1">• {m.deliveryState}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ChatPanel
        conversationId={convo.id}
        isHuman={convo.automationLock === "HUMAN"}
        dict={dict}
      />
    </AppShell>
  );
}
