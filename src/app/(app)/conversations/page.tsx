import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { ConversationList } from "@/components/inbox/conversation-list";
import { InboxLayout, InboxPlaceholder } from "@/components/inbox/inbox-layout";
import { SelloraEmblem } from "@/components/brand/sellora";

export const dynamic = "force-dynamic";

/**
 * Inbox.
 *
 * Phone: a full-screen conversation list (tapping a row opens the thread).
 * Desktop: the list next to an empty pane that explains what the workspace is
 * for and how a conversation gets there.
 */
export default async function ConversationsPage() {
  const { dict } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }

  return (
    <AppShell
      title={dict.conversations.title}
      subtitle="همه‌ی دایرکت‌های اینستاگرام، با وضعیت پاسخ و امتیاز مشتری"
      wide
    >
      <InboxLayout
        mobileView="list"
        list={<ConversationList businessId={auth.businessId} />}
        thread={
          <div className="space-y-4">
            <div className="hidden lg:block">
              <InboxPlaceholder
                title="یک گفتگو را انتخاب کنید"
                hint="با انتخاب هر گفتگو از فهرست سمت راست، متن کامل مکالمه و اطلاعات مشتری همین‌جا باز می‌شود."
              />
            </div>
            {/* Explained once, on both breakpoints, for first-time owners. */}
            <div className="card p-4 lg:hidden">
              <div className="flex items-start gap-3">
                <SelloraEmblem size={64} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-ink-900">
                    سلورا پشت صحنه پاسخ می‌دهد
                  </p>
                  <p className="mt-1 text-[12px] leading-6 text-ink-500">
                    پاسخ خودکار فعال است؟ سلورا بدون شما جواب می‌دهد و فقط گفتگوهایی که به شما
                    نیاز دارند را با برچسب «پاسخ نداده» نشان می‌دهد.
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      />
    </AppShell>
  );
}
