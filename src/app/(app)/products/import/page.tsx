import { getServerDict } from "@/lib/i18n";
import { AppShell } from "@/components/layout/app-shell";
import { ImportForm } from "./import-form";
import { IconInfo } from "@/components/layout/icons";

export default async function ImportPage() {
  const { dict } = await getServerDict();
  return (
    <AppShell
      title={dict.products.importTitle}
      backHref="/products"
      subtitle={dict.products.importHelp}
    >
      <div className="mx-auto w-full max-w-xl space-y-4">
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-ink-100/80 bg-canvas-soft/70 px-4 py-2.5 text-[12px] font-bold text-ink-700">
            <IconInfo size={16} className="text-brand-600" />
            قالب هر خط
          </div>
          <pre
            dir="ltr"
            className="overflow-x-auto px-4 py-3 text-left font-mono text-[12px] leading-7 text-ink-700"
          >
            {dict.products.importExample}
          </pre>
          <p className="border-t border-ink-100/80 px-4 py-2.5 text-[11.5px] leading-6 text-ink-500">
            ترتیب ستون‌ها: نام | قیمت (تومان) | وضعیت. ردیف‌های نامعتبر نادیده گرفته می‌شوند و بقیه
            ذخیره می‌شوند.
          </p>
        </div>

        <ImportForm dict={dict} />
      </div>
    </AppShell>
  );
}
