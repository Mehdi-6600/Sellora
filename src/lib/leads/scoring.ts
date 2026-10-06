// Lead engine — deterministic scoring based on explicit signals.
// Never a random number. Every score change must be traceable through signals.

import type { Intent } from "@/lib/conversation/intents";

export type LeadSignal = {
  type: string;
  weight: number; // 0..100 contribution increment at time of hit
  label: string;  // human-friendly Persian reason
  at: string;     // ISO timestamp
};

const SIGNALS: Record<string, { weight: number; label: string }> = {
  ORDER_INTENT: { weight: 35, label: "مشتری قصد خرید را اعلام کرد" },
  CONTACT_REQUEST: { weight: 20, label: "مشتری درخواست شماره تماس کرد" },
  VARIANT_SELECTED: { weight: 15, label: "مشتری رنگ/سایز را مشخص کرد" },
  AVAILABILITY_CONFIRMED: { weight: 10, label: "موجودی محصول را پرسید" },
  PRICE_CONFIRMED: { weight: 8, label: "قیمت محصول را پرسید" },
  SHIPPING_CITY: { weight: 10, label: "مشتری شهر ارسال را مشخص کرد" },
  PAYMENT_QUESTION: { weight: 10, label: "مشتری سوال پرداخت داشت" },
  REPEAT_FOLLOWUP: { weight: 8, label: "مشتری دوباره پیگیری کرد" },
  CONTACT_PROVIDED: { weight: 30, label: "مشتری اطلاعات تماس را داد" },
  EXPLICIT_BUY_PHRASE: { weight: 20, label: "عبارت خرید قطعی را به کار برد" },
};

export function scoreFromSignals(signals: LeadSignal[]): {
  score: number;
  temperature: "COLD" | "WARM" | "HOT";
  reason: string;
} {
  // Simple additive score capped at 100. Dedup by type (but repeated follow-ups count).
  const seenTypes = new Map<string, number>();
  let total = 0;
  let topLabel = "";
  let topWeight = 0;
  for (const s of signals) {
    // Cap repeat signals of same type to 2
    const count = seenTypes.get(s.type) ?? 0;
    const multiplier = count >= 2 ? 0.3 : count >= 1 ? 0.7 : 1;
    const w = Math.round(s.weight * multiplier);
    total += w;
    seenTypes.set(s.type, count + 1);
    if (s.weight > topWeight) {
      topWeight = s.weight;
      topLabel = s.label;
    }
  }
  total = Math.min(100, total);
  let temperature: "COLD" | "WARM" | "HOT" = "COLD";
  if (total >= 70) temperature = "HOT";
  else if (total >= 35) temperature = "WARM";

  const reason = topLabel || "مشتری به تازگی گفتگو را شروع کرده";
  return { score: total, temperature, reason };
}

export function signalsFromIntents(intents: Intent[], entities: { colors: string[]; sizes: string[]; city?: string }): LeadSignal[] {
  const out: LeadSignal[] = [];
  const now = new Date().toISOString();
  if (intents.includes("ORDER_INTENT")) out.push({ type: "ORDER_INTENT", ...SIGNALS.ORDER_INTENT, at: now });
  if (intents.includes("CONTACT_REQUEST")) out.push({ type: "CONTACT_REQUEST", ...SIGNALS.CONTACT_REQUEST, at: now });
  if (intents.includes("PRICE")) out.push({ type: "PRICE_CONFIRMED", ...SIGNALS.PRICE_CONFIRMED, at: now });
  if (intents.includes("AVAILABILITY")) out.push({ type: "AVAILABILITY_CONFIRMED", ...SIGNALS.AVAILABILITY_CONFIRMED, at: now });
  if (entities.colors.length || entities.sizes.length) out.push({ type: "VARIANT_SELECTED", ...SIGNALS.VARIANT_SELECTED, at: now });
  if (entities.city) out.push({ type: "SHIPPING_CITY", ...SIGNALS.SHIPPING_CITY, at: now });
  if (intents.includes("PAYMENT")) out.push({ type: "PAYMENT_QUESTION", ...SIGNALS.PAYMENT_QUESTION, at: now });

  // Explicit buy phrases in Persian (strong):
  return out;
}

export function detectExplicitBuyPhrase(text: string): boolean {
  const n = text.toLowerCase();
  return /(همینو میخوام|همین رو میخوام|چطور سفارش|ثبت سفارش|برام بفرست|میخوام بخرم|بخرمش|شماره کارت بفرستید|پرداختش کنم)/.test(n);
}
