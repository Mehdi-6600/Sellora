"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { Badge } from "@/components/ui/badge";
import type { Dict } from "@/lib/i18n/dictionaries/fa";
import { parseImportInput, type ImportRow } from "@/lib/products/importer";
import { formatToman } from "@/lib/utils/format";

export function ImportForm({ dict }: { dict: Dict }) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<ImportRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  function doPreview() {
    const rows = parseImportInput(text);
    setPreview(rows);
    const valid = rows.filter((r) => r.valid).length;
    const invalid = rows.length - valid;
    toast.push(`${valid} ${dict.products.validRows} — ${invalid} ${dict.products.invalidRows}`, invalid ? "error" : "success");
  }

  async function doImport() {
    if (!preview) return;
    setLoading(true);
    const res = await fetch("/api/products/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.push(dict.errors.generic, "error");
      return;
    }
    toast.push(`${data.created} محصول ذخیره شد`, "success");
    router.push("/products");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder={"مانتو آوا | ۲۴۰۰۰۰ | موجود\nکفش نایک | ۳۹۰۰۰۰ | ناموجود"}
      />
      <div className="flex gap-2">
        <Button variant="secondary" onClick={doPreview}>{dict.products.parsePreview}</Button>
        <Button onClick={doImport} disabled={!preview || loading || preview.every((r) => !r.valid)}>
          {dict.products.saveValid}
        </Button>
      </div>
      {preview && (
        <div className="space-y-2">
          {preview.map((r) => (
            <div key={r.line} className="card p-3 flex items-center gap-2 text-sm">
              <div className="text-ink-400 w-6">{r.line}</div>
              <div className="flex-1 min-w-0">
                {r.valid ? (
                  <>
                    <div className="font-medium truncate">{r.name}</div>
                    <div className="text-xs text-ink-500">
                      {formatToman((r.priceToman || 0) * 10)} تومان — {r.status === "AVAILABLE" ? dict.common.available : dict.common.unavailable}
                    </div>
                  </>
                ) : (
                  <div className="text-red-600 truncate">{r.error}</div>
                )}
              </div>
              <Badge tone={r.valid ? "green" : "red"}>{r.valid ? "✓" : "✕"}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
