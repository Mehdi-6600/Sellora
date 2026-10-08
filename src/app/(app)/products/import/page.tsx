import { getServerDict } from "@/lib/i18n";
import { AppShell } from "@/components/layout/app-shell";
import { ImportForm } from "./import-form";

export default async function ImportPage() {
  const { dict } = await getServerDict();
  return (
    <AppShell title={dict.products.importTitle} backHref="/products" subtitle={dict.products.importHelp}>
      <div className="card p-4 text-xs bg-ink-50 border-ink-200 mb-4 font-mono whitespace-pre-line leading-6">
        {dict.products.importExample}
      </div>
      <ImportForm dict={dict} />
    </AppShell>
  );
}
