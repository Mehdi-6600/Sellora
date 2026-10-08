"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import { toEnglishDigits } from "@/lib/utils/format";
import type { Dict } from "@/lib/i18n/dictionaries/fa";

/**
 * Single-product creation form. POST /api/products expects the stored unit
 * (rials); the owner types toman, which is the colloquial unit, and we convert
 * with the same helper the bulk importer uses.
 */
export function ProductForm({ dict }: { dict: Dict }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    priceToman: "",
    sku: "",
    description: "",
    status: "AVAILABLE" as "AVAILABLE" | "UNAVAILABLE",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const digits = toEnglishDigits(form.priceToman.replace(/[^\d۰-۹-٩]/g, ""));
    const toman = Number(digits);
    if (!form.name.trim()) {
      setError("نام محصول الزامی است.");
      return;
    }
    if (!digits || !Number.isFinite(toman) || toman <= 0) {
      setError("قیمت را به تومان و با عدد وارد کنید.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          price: Math.round(toman * 10),
          sku: form.sku.trim() || null,
          description: form.description.trim() || null,
          status: form.status,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code = data?.error?.code;
        setError(code === "product_exists" ? dict.errors.productExists : dict.errors.invalidInput);
        return;
      }
      toast.push("محصول ذخیره شد ✅", "success");
      router.push("/products");
      router.refresh();
    } catch {
      setError(dict.errors.generic);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Card className="p-4 space-y-4">
        <div>
          <Label htmlFor="product-name">{dict.products.name}</Label>
          <Input
            id="product-name"
            name="name"
            required
            maxLength={200}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="مثلاً مانتو آوا"
          />
        </div>
        <div>
          <Label htmlFor="product-price">قیمت (تومان)</Label>
          <Input
            id="product-price"
            name="price"
            required
            inputMode="numeric"
            value={form.priceToman}
            onChange={(e) => setForm({ ...form, priceToman: e.target.value })}
            placeholder="مثلاً ۲۴۰۰۰"
          />
        </div>
        <div>
          <Label htmlFor="product-sku">{dict.products.sku}</Label>
          <Input
            id="product-sku"
            name="sku"
            maxLength={60}
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            placeholder="اختیاری"
            dir="ltr"
          />
        </div>
        <div>
          <Label htmlFor="product-status">{dict.products.status}</Label>
          <select
            id="product-status"
            name="status"
            className="input"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as "AVAILABLE" | "UNAVAILABLE" })}
          >
            <option value="AVAILABLE">{dict.common.available}</option>
            <option value="UNAVAILABLE">{dict.common.unavailable}</option>
          </select>
        </div>
        <div>
          <Label htmlFor="product-description">{dict.products.description}</Label>
          <Textarea
            id="product-description"
            name="description"
            maxLength={2000}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="اختیاری"
          />
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? dict.common.loading : dict.common.save}
          </Button>
          <Link href="/products" className="btn-secondary flex-1 inline-flex">
            {dict.common.cancel}
          </Link>
        </div>
      </Card>
    </form>
  );
}
