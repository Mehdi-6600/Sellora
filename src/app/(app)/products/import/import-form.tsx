"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { Badge } from "@/components/ui/badge";
import type { Dict } from "@/lib/i18n/dictionaries/fa";
import { parseImportInput, type ImportRow } from "@/lib/products/importer";
import { formatToman, toPersianDigits } from "@/lib/utils/format";
import { IconCheck, IconClose, IconUpload } from "@/components/layout/icons";

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
    toast.push(
      `${valid} ${dict.products.validRows} — ${invalid} ${dict.products.invalidRows}`,
      invalid ? "error" : "success"
    );
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

  const validCount = preview?.filter((r) => r.valid).length ?? 0;
  const total = preview?.length ?? 0;

  return (
    <div className="space-y-4 pb-4">
      <div>
        <Label htmlFor="import-text">{dict.products.importHelp}</Label>
        <Textarea
          id="import-text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setPreview(null);
          }}
          rows={9}
          className="font-mono text-[12.5px] leading-7"
          placeholder={"مانتو آوا | ۲۴۰۰۰۰ | موجود\nکفش نایک | ۳۹۰۰۰۰ | ناموجود"}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="secondary" onClick={doPreview} disabled={!text.trim()} className="sm:flex-1">
          {dict.products.parsePreview}
        </Button>
        <Button
          onClick={doImport}
          disabled={!preview || loading || validCount === 0}
          loading={loading}
          className="sm:flex-1"
        >
          <IconUpload size={17} />
          {dict.products.saveValid}
        </Button>
      </div>

      {preview && preview.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[12px] font-semibold text-ink-500">
              پیش‌نمایش <span className="tnum">{toPersianDigits(total)}</span> ردیف
            </span>
            <span className="flex items-center gap-1.5">
              <Badge tone="green">
                <IconCheck size={12} />
                <span className="tnum">{toPersianDigits(validCount)}</span>
              </Badge>
              {total - validCount > 0 ? (
                <Badge tone="red">
                  <IconClose size={12} />
                  <span className="tnum">{toPersianDigits(total - validCount)}</span>
                </Badge>
              ) : null}
            </span>
          </div>

          <ul className="space-y-2">
            {preview.map((r) => (
              <li
                key={r.line}
                className="card flex items-center gap-3 p-3 text-[12.5px]"
              >
                <span className="tnum grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-canvas-soft font-bold text-ink-500">
                  {toPersianDigits(r.line)}
                </span>
                <span className="min-w-0 flex-1">
                  {r.valid ? (
                    <>
                      <span className="block truncate font-bold text-ink-900">{r.name}</span>
                      <span className="tnum mt-0.5 block text-[11px] text-ink-500">
                        {formatToman((r.priceToman || 0) * 10)} تومان —{" "}
                        {r.status === "AVAILABLE" ? dict.common.available : dict.common.unavailable}
                      </span>
                    </>
                  ) : (
                    <span className="block truncate text-red-300">{r.error}</span>
                  )}
                </span>
                <span
                  aria-hidden="true"
                  className={
                    r.valid
                      ? "grid h-7 w-7 place-items-center rounded-lg bg-emerald-400/15 text-emerald-300"
                      : "grid h-7 w-7 place-items-center rounded-lg bg-red-400/15 text-red-300"
                  }
                >
                  {r.valid ? <IconCheck size={15} /> : <IconClose size={15} />}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
