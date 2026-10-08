"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import type { Dict } from "@/lib/i18n/dictionaries/fa";

export function RulesetForm({ dict, initial }: { dict: Dict; initial?: any }) {
  const [form, setForm] = useState({
    address: initial?.address ?? "",
    phone: initial?.phone ?? "",
    shippingInfo: initial?.shippingInfo ?? "",
    paymentMethods: initial?.paymentMethods ?? "",
    returnPolicy: initial?.returnPolicy ?? "",
    citiesServed: initial?.citiesServed ?? "",
    generalInfo: initial?.generalInfo ?? "",
    notes: initial?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const [, start] = useTransition();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/rules", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.push("ذخیره شد ✅", "success");
      start(() => router.refresh());
    } else {
      toast.push(dict.errors.generic, "error");
    }
  }

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={save} className="space-y-4">
      <div>
        <Label>{dict.settings.business.address}</Label>
        <Input value={form.address} onChange={update("address")} placeholder="آدرس فروشگاه" />
      </div>
      <div>
        <Label>{dict.settings.business.phone}</Label>
        <Input value={form.phone} onChange={update("phone")} dir="ltr" placeholder="0912xxxxxxx" />
      </div>
      <div>
        <Label>{dict.settings.business.shipping}</Label>
        <Textarea value={form.shippingInfo} onChange={update("shippingInfo")} placeholder="مثال: ارسال به سراسر ایران با پست پیشتاز، هزینه ۵۰ هزار تومان" />
      </div>
      <div>
        <Label>{dict.settings.business.cities}</Label>
        <Input value={form.citiesServed} onChange={update("citiesServed")} placeholder="ارسال به تهران، کرج، البرز و..." />
      </div>
      <div>
        <Label>{dict.settings.business.payment}</Label>
        <Textarea value={form.paymentMethods} onChange={update("paymentMethods")} placeholder="کارت به کارت، درگاه پرداخت آنلاین، پرداخت در محل" />
      </div>
      <div>
        <Label>{dict.settings.business.returns}</Label>
        <Textarea value={form.returnPolicy} onChange={update("returnPolicy")} placeholder="شرایط بازگشت کالا (مثلاً تا ۷ روز در صورت سایز نبودن)" />
      </div>
      <div>
        <Label>{dict.settings.business.generalInfo}</Label>
        <Textarea value={form.generalInfo} onChange={update("generalInfo")} placeholder="توضیح کوتاه درباره فروشگاه" />
      </div>
      <div>
        <Label>{dict.settings.business.notes}</Label>
        <Textarea value={form.notes} onChange={update("notes")} placeholder="یادداشت‌های داخلی (به مشتری نمایش داده نمی‌شود)" />
      </div>
      <Button type="submit" disabled={saving} className="w-full" size="lg">
        {saving ? dict.common.loading : dict.common.save}
      </Button>
    </form>
  );
}
