import { notFound, redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { ConversationList } from "@/components/inbox/conversation-list";
import { InboxLayout } from "@/components/inbox/inbox-layout";
import { MessageThread } from "@/components/inbox/message-thread";
import { CustomerPanel } from "@/components/inbox/customer-panel";
import { Badge, Dot } from "@/components/ui/badge";
import { ChatPanel } from "./chat-panel";
import { automationStatus } from "@/lib/ui/labels";

export const dynamic = "force-dynamic";

/**
 * A single conversation.
 *
 * Phone: the thread (list is one tap back in the header), with the customer
 * details available through the in-thread disclosure.
 * Desktop: list · thread · customer panel side by side.
 */
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

  const messages = Array.isArray(convo.messages) ? convo.messages : [];
  const name = convo.customerName || convo.customerUsername || "مشتری";
  const status = automationStatus(convo.automationLock, convo.state, dict);

  const details = (
    <CustomerPanel
      convo={convo as any}
      messageCount={messages.length}
      dict={dict}
      locale={locale}
    />
  );

  const thread = (
    <div className="flex min-h-[60vh] flex-col lg:h-[calc(100dvh-9.5rem)] lg:min-h-0">
      {/* Scrollable part of the pane: status strip + messages. The composer is
          a sibling below it, so on desktop it never scrolls out of view. */}
      <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pe-1">
      {/* Thread status strip + phone-only details disclosure */}
      <div className="card mb-3 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={status.tone}>
            <Dot tone={status.tone} />
            {status.label}
          </Badge>
          {convo.lead?.temperature === "HOT" ? (
            <Badge tone="red">🔥 {dict.leads.hot}</Badge>
          ) : null}
          {convo.state === "QUALIFIED" ? <Badge tone="green">علاقه‌مند</Badge> : null}
          <span className="ms-auto text-[11px] font-medium text-ink-500">
            {messages.length === 0
              ? "بدون پیام"
              : `${messages.length.toLocaleString("fa-IR")} پیام`}
          </span>
        </div>

        <details className="group mt-2.5 border-t border-ink-100 pt-2.5 lg:hidden">
          <summary className="flex min-h-[40px] cursor-pointer list-none items-center justify-between gap-2 text-[12.5px] font-bold text-ink-700">
            اطلاعات مشتری و وضعیت گفتگو
            <span
              aria-hidden="true"
              className="text-ink-400 transition group-open:rotate-180"
            >
              ▾
            </span>
          </summary>
          <div className="pt-3">{details}</div>
        </details>
      </div>

      <MessageThread messages={messages as any} dict={dict} locale={locale} />

      {/* Room for the pinned composer + bottom navigation on phones. */}
      <div aria-hidden="true" className="h-36 lg:h-2" />
      </div>

      <ChatPanel
        conversationId={convo.id}
        isHuman={convo.automationLock === "HUMAN"}
        dict={dict}
      />
    </div>
  );

  return (
    <AppShell
      backHref="/conversations"
      title={name}
      subtitle={convo.customerUsername ? `@${convo.customerUsername.replace(/^@/, "")}` : undefined}
      wide
    >
      <InboxLayout
        mobileView="thread"
        list={<ConversationList businessId={auth.businessId} activeId={convo.id} />}
        thread={thread}
        details={details}
      />
    </AppShell>
  );
}
