"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import type { Dict } from "@/lib/i18n/dictionaries/fa";

/**
 * Business information form.
 *
 * Same payload as before (PUT /api/rules), grouped into labelled sections so
 * the owner understands which customer question each field answers. The save
 * action is pinned to the bottom of the phone screen and stays in the card on
 * desktop.
 */
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

  const update =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={save} className="space-y-4 pb-24 lg:pb-0">
      <Card className="space-y-4 p-4 sm:p-5">
        <h2 className="text-[13px] font-bold text-ink-900">تماس و حضور</h2>
        <div>
          <Label htmlFor="rs-address">{dict.settings.business.address}</Label>
          <Input
            id="rs-address"
            value={form.address}
            onChange={update("address")}
            placeholder="مثلاً تهران، خیابان ولیعصر، پلاک ۱۲"
          />
        </div>
        <div>
          <Label htmlFor="rs-phone">{dict.settings.business.phone}</Label>
          <Input
            id="rs-phone"
            value={form.phone}
            onChange={update("phone")}
            dir="ltr"
            placeholder="0912xxxxxxx"
          />
        </div>
        <div>
          <Label htmlFor="rs-cities">{dict.settings.business.cities}</Label>
          <Input
            id="rs-cities"
            value={form.citiesServed}
            onChange={update("citiesServed")}
            placeholder="ارسال به تهران، کرج، البرز…"
          />
        </div>
      </Card>

      <Card className="space-y-4 p-4 sm:p-5">
        <h2 className="text-[13px] font-bold text-ink-900">ارسال و پرداخت</h2>
        <div>
          <Label htmlFor="rs-shipping">{dict.settings.business.shipping}</Label>
          <Textarea
            id="rs-shipping"
            value={form.shippingInfo}
            onChange={update("shippingInfo")}
            placeholder="مثال: ارسال به سراسر ایران با پست پیشتاز، هزینه ۵۰ هزار تومان، ۲ تا ۴ روز کاری"
          />
          <p className="help">به سوال «چطور می‌فرستید؟» و «کی می‌رسد؟» با همین متن پاسخ داده می‌شود.</p>
        </div>
        <div>
          <Label htmlFor="rs-payment">{dict.settings.business.payment}</Label>
          <Textarea
            id="rs-payment"
            value={form.paymentMethods}
            onChange={update("paymentMethods")}
            placeholder="کارت به کارت، درگاه پرداخت آنلاین، پرداخت در محل"
          />
        </div>
      </Card>

      <Card className="space-y-4 p-4 sm:p-5">
        <h2 className="text-[13px] font-bold text-ink-900">قوانین و معرفی</h2>
        <div>
          <Label htmlFor="rs-returns">{dict.settings.business.returns}</Label>
          <Textarea
            id="rs-returns"
            value={form.returnPolicy}
            onChange={update("returnPolicy")}
            placeholder="شرایط بازگشت کالا (مثلاً تا ۷ روز در صورت سایز نبودن)"
          />
        </div>
        <div>
          <Label htmlFor="rs-general">{dict.settings.business.generalInfo}</Label>
          <Textarea
            id="rs-general"
            value={form.generalInfo}
            onChange={update("generalInfo")}
            placeholder="یک توضیح کوتاه درباره فروشگاه"
          />
        </div>
        <div>
          <Label htmlFor="rs-notes">{dict.settings.business.notes}</Label>
          <Textarea
            id="rs-notes"
            value={form.notes}
            onChange={update("notes")}
            placeholder="یادداشت‌های داخلی (به مشتری نمایش داده نمی‌شود)"
          />
          <p className="help">این یادداشت‌ها فقط برای خودتان است و در پاسخ‌ها استفاده نمی‌شود.</p>
        </div>
      </Card>

      <div className="fixed inset-x-0 bottom-[calc(3.6rem+env(safe-area-inset-bottom,0px))] z-20 border-t border-ink-100/80 glass-bar px-4 py-3 lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="mx-auto flex w-full max-w-2xl gap-2">
          <Button type="submit" loading={saving} disabled={saving} size="lg" className="flex-1">
            {saving ? dict.common.loading : dict.common.save}
          </Button>
          <Link href="/settings" className="btn-secondary min-h-[52px] flex-1">
            {dict.common.cancel}
          </Link>
        </div>
      </div>
    </form>
  );
}
