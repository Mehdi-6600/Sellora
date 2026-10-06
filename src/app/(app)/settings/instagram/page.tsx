import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Badge, Dot } from "@/components/ui/badge";
import { META_APP_ID } from "@/lib/meta/config";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function InstagramPage() {
  const { dict } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }

  const ig = await prisma.instagramAccount.findUnique({ where: { businessId: auth.businessId } });
  const status = ig?.status ?? "DISCONNECTED";
  const connected = status === "CONNECTED";

  return (
    <AppShell title={dict.settings.instagram.title} backHref="/settings" subtitle={dict.app.tagline}>
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 text-white grid place-items-center text-xl">📸</div>
          <div className="flex-1">
            <div className="font-semibold">{ig?.username || "Instagram Business"}</div>
            <div className="text-xs text-ink-500 flex items-center gap-1 mt-1">
              <Dot tone={connected ? "green" : status === "DEGRADED" ? "amber" : "red"} />
              {status === "CONNECTED" && dict.settings.instagram.statusConnected}
              {status === "DEGRADED" && dict.settings.instagram.statusDegraded}
              {status === "REAUTH_REQUIRED" && dict.settings.instagram.statusReauth}
              {status === "DISCONNECTED" && dict.settings.instagram.statusDisconnected}
            </div>
            {ig?.lastVerifiedAt && (
              <div className="text-[11px] text-ink-400 mt-1">
                آخرین بررسی: {new Date(ig.lastVerifiedAt).toLocaleString("fa-IR")}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          {connected ? (
            <form action="/api/instagram/disconnect" method="post">
              <button type="submit" className="btn-secondary w-full">
                {dict.settings.instagram.disconnect}
              </button>
            </form>
          ) : META_APP_ID ? (
            <a href="/api/instagram/connect" className="btn-primary w-full inline-flex">
              {dict.settings.instagram.connectCta}
            </a>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                Meta App هنوز در محیط پیکربندی نشده است. برای اتصال واقعی اینستاگرام،
                مقادیر <code>META_APP_ID</code> و <code>META_APP_SECRET</code> را در
                متغیرهای محیطی پروژه تنظیم کنید.
              </div>
              <button className="btn-secondary w-full" disabled>
                {dict.settings.instagram.connectCta}
              </button>
            </div>
          )}
        </div>
      </Card>

      <div className="section-title">وضعیت دسترسی</div>
      <Card className="p-4 space-y-2 text-sm text-ink-700">
        <div className="flex items-center gap-2">
          <Badge tone={connected ? "green" : "red"}>{connected ? "✓" : "✗"}</Badge>
          <span>اتصال به اینستاگرام</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="amber">!</Badge>
          <span>{dict.settings.instagram.reviewNotice}</span>
        </div>
      </Card>
    </AppShell>
  );
}
