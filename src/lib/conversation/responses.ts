// Deterministic response templates (Persian first, English/Arabic extensible).
// Sellora MUST NOT invent prices, availability, addresses, or policies.
// If data is missing, the response must say so honestly.

import type { ProductRecord, ProductVariantRecord, BusinessRulesetRecord } from "@/types/prisma-shim";
import { formatToman, toPersianDigits } from "@/lib/utils/format";

type Product = ProductRecord;
type ProductVariant = ProductVariantRecord;
type BusinessRuleset = BusinessRulesetRecord;

type Ctx = {
  product?: (Product & { variants: ProductVariant[] }) | null;
  variant?: ProductVariant | null;
  ruleset?: BusinessRuleset | null;
  city?: string | null;
  entities?: { colors: string[]; sizes: string[]; city?: string };
};

const NOT_KNOWN = {
  shipping: (city?: string) =>
    city
      ? `هزینه و زمان ارسال به ${city} هنوز در اطلاعات فروشگاه ثبت نشده. اگه بخوای، صاحب فروشگاه می‌تونه راهنماییت کنه.`
      : `هزینه و زمان ارسال هنوز در اطلاعات فروشگاه ثبت نشده. اگه بخوای، صاحب فروشگاه می‌تونه راهنماییت کنه.`,
  address: "آدرس فروشگاه هنوز ثبت نشده. صاحب فروشگاه اطلاع‌رسانی می‌کنه.",
  hours: "ساعات کاری فروشگاه هنوز ثبت نشده.",
  payment: "اطلاعات روش پرداخت هنوز ثبت نشده؛ صاحب فروشگاه راهنماییت می‌کنه.",
  returns: "شرایط بازگشت کالا هنوز ثبت نشده؛ برای اطلاعات دقیق با پشتیبانی هماهنگ کنید.",
  discount: "در حال حاضر تخفیف فعالی ثبت نشده.",
  delivery: "زمان دقیق ارسال به شهر شما در اطلاعات فروشگاه ثبت نشده.",
};

function priceLine(arg: { price: number }): string {
  return `${formatToman(arg.price)} تومان`;
}

export function buildResponse(
  intents: string[],
  confidence: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN",
  ctx: Ctx
): { text: string; clarification?: string; needsOwner: boolean } {
  // Low/unknown → ask for clarification.
  if (confidence === "UNKNOWN") {
    return {
      text: "متوجه منظورت نشدم 😊 می‌تونی اسم محصول یا سوالت رو واضح‌تر بگی؟",
      needsOwner: false,
    };
  }
  if (confidence === "LOW") {
    // Price/availability question without a product.
    if (intents.includes("PRICE") || intents.includes("AVAILABILITY")) {
      return {
        text: "منظورتون کدوم محصوله؟ اسم یا لینک محصول رو بفرستید تا اطلاعات دقیق رو بگم.",
        needsOwner: false,
      };
    }
    if (intents.includes("VARIANT_QUERY")) {
      return {
        text: "چه رنگ یا سایزی مد نظرته؟",
        needsOwner: false,
      };
    }
    return {
      text: "می‌تونی سوالت رو کمی واضح‌تر بگی؟ تا دقیق جوابت رو بدم.",
      needsOwner: false,
    };
  }

  // Greeting.
  if (intents.length === 1 && intents[0] === "GREETING") {
    return { text: "سلام! خوش اومدی 😊 چطور می‌تونم کمکت کنم؟", needsOwner: false };
  }
  if (intents.length === 1 && intents[0] === "THANKS") {
    return { text: "خواهش می‌کنم! اگر سوال دیگه‌ای داشتی، هستم.", needsOwner: false };
  }

  if (intents.includes("HUMAN_REQUEST")) {
    return {
      text: "حتماً! پیام شما به صاحب فروشگاه ارسال می‌شود و در اولین فرصت پاسخ می‌دن.",
      needsOwner: true,
    };
  }

  const parts: string[] = [];
  let needsOwner = false;

  // Multi-intent: answer each known question in order.
  // PRICE
  if (intents.includes("PRICE")) {
    if (ctx.product) {
      const line = priceLine(ctx.variant && ctx.variant.price != null ? { price: ctx.variant.price as number } : ctx.product);
      parts.push(`قیمت ${ctx.product.name} ${line} هست.`);
    } else {
      parts.push("منظورتون کدوم محصوله؟ اسمش رو بفرستید تا قیمت دقیق رو بگم.");
    }
  }

  // AVAILABILITY
  if (intents.includes("AVAILABILITY")) {
    if (ctx.product) {
      const target = ctx.variant ?? ctx.product;
      if (target.status === "AVAILABLE") {
        parts.push(`بله، ${ctx.product.name} موجوده.`);
      } else {
        parts.push(`متاسفانه ${ctx.product.name} فعلاً ناموجوده.`);
      }
    } else {
      parts.push("کدوم محصول رو می‌خواید؟ اسمش رو بفرستید تا موجودی رو چک کنم.");
    }
  }

  // VARIANT_QUERY (size/color)
  if (intents.includes("VARIANT_QUERY")) {
    if (ctx.product) {
      const wantedColor = ctx.entities?.colors[0];
      const wantedSize = ctx.entities?.sizes[0];
      const match = ctx.product.variants.find((v: any) => {
        const colorOk = wantedColor ? v.color === wantedColor : true;
        const sizeOk = wantedSize ? v.size === String(wantedSize) : true;
        return colorOk && sizeOk;
      });
      if (wantedColor || wantedSize) {
        if (match) {
          const extra = match.price != null ? ` به قیمت ${priceLine({ price: match.price as number })}` : "";
          parts.push(`${wantedColor ? wantedColor + " " : ""}${wantedSize ? "سایز " + wantedSize + " " : ""}${ctx.product.name} موجوده${extra}.`);
        } else {
          parts.push(`${wantedColor ? wantedColor + " " : ""}${wantedSize ? "سایز " + wantedSize + " " : ""}${ctx.product.name} فعلاً موجود نیست. می‌خوای از رنگ/سایز دیگه‌ای بگم؟`);
        }
      } else {
        parts.push(`چه رنگ یا سایزی از ${ctx.product.name} مد نظرته؟`);
      }
    } else {
      parts.push("اسم محصول رو بفرست تا رنگ/سایزهای موجود رو بهت بگم.");
    }
  }

  // SHIPPING
  if (intents.includes("SHIPPING")) {
    const info = ctx.ruleset?.shippingInfo;
    if (info && info.trim()) {
      parts.push(info);
    } else {
      parts.push(NOT_KNOWN.shipping(ctx.entities?.city));
    }
  }

  // DELIVERY_TIME
  if (intents.includes("DELIVERY_TIME")) {
    const info = ctx.ruleset?.shippingInfo;
    if (info && /(ارسال|تحویل|روز)/.test(info)) {
      // shipping info likely mentions delivery times.
      parts.push(info);
    } else {
      parts.push(NOT_KNOWN.delivery);
      needsOwner = true;
    }
  }

  // LOCATION
  if (intents.includes("LOCATION")) {
    if (ctx.ruleset?.address && ctx.ruleset.address.trim()) {
      parts.push(`آدرس فروشگاه: ${ctx.ruleset.address}`);
    } else {
      parts.push(NOT_KNOWN.address);
      needsOwner = true;
    }
  }

  // BUSINESS_HOURS
  if (intents.includes("BUSINESS_HOURS")) {
    if (ctx.ruleset?.workingHours && Object.keys(ctx.ruleset.workingHours as object).length > 0) {
      parts.push("ساعات کاری فروشگاه ثبت شده است.");
    } else {
      parts.push(NOT_KNOWN.hours);
      needsOwner = true;
    }
  }

  // PAYMENT
  if (intents.includes("PAYMENT")) {
    if (ctx.ruleset?.paymentMethods && ctx.ruleset.paymentMethods.trim()) {
      parts.push(ctx.ruleset.paymentMethods);
    } else {
      parts.push(NOT_KNOWN.payment);
      needsOwner = true;
    }
  }

  // RETURNS
  if (intents.includes("RETURNS")) {
    if (ctx.ruleset?.returnPolicy && ctx.ruleset.returnPolicy.trim()) {
      parts.push(ctx.ruleset.returnPolicy);
    } else {
      parts.push(NOT_KNOWN.returns);
      needsOwner = true;
    }
  }

  // DISCOUNT
  if (intents.includes("DISCOUNT")) {
    parts.push(NOT_KNOWN.discount);
  }

  // CONTACT_REQUEST
  if (intents.includes("CONTACT_REQUEST")) {
    if (ctx.ruleset?.phone && ctx.ruleset.phone.trim()) {
      parts.push(`شماره تماس فروشگاه: ${toPersianDigits(ctx.ruleset.phone)}`);
    } else {
      parts.push("شماره تماس فروشگاه هنوز ثبت نشده؛ صاحب فروشگاه به‌زودی با شما تماس می‌گیره.");
      needsOwner = true;
    }
  }

  // ORDER_INTENT — always route hot lead / handoff.
  if (intents.includes("ORDER_INTENT")) {
    parts.push("عالی! لطفاً یک لحظه صبر کنید، صاحب فروشگاه برای نهایی کردن سفارش در خدمت شماست.");
    needsOwner = true;
  }

  // Fallback if nothing matched.
  if (parts.length === 0) {
    parts.push("یک لحظه لطفاً، در حال بررسی سوال شما هستم.");
    needsOwner = true;
  }

  return { text: parts.join(" "), needsOwner };
}

export { formatToman };
