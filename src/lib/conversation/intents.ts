// Intent detection and entity extraction.
// Deterministic + keyword/pattern based. Designed to be reasonably robust
// against Persian/Arabic variants and common Finglish.
//
// Supported intents:
//   PRICE, AVAILABILITY, PRODUCT_INFO, VARIANT_QUERY, SHIPPING,
//   DELIVERY_TIME, LOCATION, BUSINESS_HOURS, PAYMENT, RETURNS, DISCOUNT,
//   ORDER_INTENT, CONTACT_REQUEST, HUMAN_REQUEST, GREETING, THANKS, UNKNOWN

import { normalize, tokenize } from "./normalize";

export type Intent =
  | "PRICE"
  | "AVAILABILITY"
  | "PRODUCT_INFO"
  | "VARIANT_QUERY"
  | "SHIPPING"
  | "DELIVERY_TIME"
  | "LOCATION"
  | "BUSINESS_HOURS"
  | "PAYMENT"
  | "RETURNS"
  | "DISCOUNT"
  | "ORDER_INTENT"
  | "CONTACT_REQUEST"
  | "HUMAN_REQUEST"
  | "GREETING"
  | "THANKS"
  | "UNKNOWN";

const INTENT_PATTERNS: Array<{ intent: Intent; patterns: RegExp[] }> = [
  {
    intent: "GREETING",
    patterns: [/سلام/, /درود/, /هلو/, /hello/, /hi\b/, /صبح بخیر/, /شب بخیر/, /چطوری/, /چطورین/],
  },
  {
    intent: "THANKS",
    patterns: [/ممنون/, /متشکر/, /مرسی/, /سپاس/, /ثانکس/, /thanks/, /thank you/],
  },
  {
    intent: "PRICE",
    patterns: [
      /قیمت/,
      /چنده\??/,
      /چقدر(ه| است| میشه| میشود)/,
      /بها/,
      /هزینه/,
      /نرخ/,
    ],
  },
  {
    intent: "AVAILABILITY",
    patterns: [
      /موجود/,
      /هست\??/,
      /دارید\??/,
      /داری\??/,
      /دارین\??/,
      /میشه بخر/,
      /میخوام بخرم/,
      /کجا(م|یید)?\b/,
      /موند(ه|ن)\b/,
      /تموم شده/,
    ],
  },
  {
    intent: "VARIANT_QUERY",
    patterns: [
      /سایز/,
      /اندازه/,
      /رنگ/,
      /مشکی/,
      /سفید/,
      /قرمز/,
      /آبی/,
      /سبز/,
      /صورتی/,
      /قهوه/,
      /کرم/,
      /طلایی/,
      /نقره/,
      /سرمه/,
    ],
  },
  {
    intent: "PRODUCT_INFO",
    patterns: [/جنس/, /مدل/, /ویژگی/, /توضیح/, /مشخصات/, /چیه\?*/, /چیه/, /چیه؟/],
  },
  {
    intent: "SHIPPING",
    patterns: [/ارسال/, /پست/, /فرستاد/, /ارسالش/, /ارسالم/, /ارسالمون/, /شهر/, /شهری/, /کشور/],
  },
  {
    intent: "DELIVERY_TIME",
    patterns: [
      /چقدر طول می/,
      /کی میرسه/,
      /کی میرسد/,
      /چند روز/,
      /چند روزه/,
      /فردا میرسه/,
      /امروز میرسه/,
      /چند وقته/,
      /زمان.*ارسال/,
    ],
  },
  {
    intent: "LOCATION",
    patterns: [/آدرس/, /ادرس/, /کجایید/, /کجایین/, /کجا هستید/, /شعبه/, /لوکیشن/, /مکان/, /نقشه/],
  },
  {
    intent: "BUSINESS_HOURS",
    patterns: [/ساعت کاری/, /ساعت کار/, /ساعت(ی| ها|ها)?\s*(چند|باز|بسته|کی)/, /کی باز/, /کی بازید/, /باز هستید/],
  },
  {
    intent: "PAYMENT",
    patterns: [/پرداخت/, /چطور.*پرداخت/, /درگاه/, /کارت به کارت/, /شماره کارت/, /شبا/, /زبال/, /پول/, /پیش پرداخت/, /قسط/],
  },
  {
    intent: "RETURNS",
    patterns: [/مرجوع/, /عودت/, /پس دادن/, /برگرداندن/, /ضمانت/, /گارانتی/, /بازگشت کالا/],
  },
  {
    intent: "DISCOUNT",
    patterns: [/تخفیف/, /آف/, /off\b/, /حراج/, /جشنواره/, /تخفیف ویژه/, /کمتر/, /ارزانتر/],
  },
  {
    intent: "ORDER_INTENT",
    patterns: [
      /همینو میخوام/,
      /همین رو میخوام/,
      /چطور سفارش/,
      /چجوری سفارش/,
      /میخوام سفارش بدم/,
      /سفارش بدم/,
      /بخرمش/,
      /ثبت سفارش/,
      /نهایی/,
      /ثبت کن/,
      /پرداختش کنم/,
      /برام بفرست/,
      /برام بیار/,
      /من میخوام/,
    ],
  },
  {
    intent: "CONTACT_REQUEST",
    patterns: [/شماره تماس/, /شماره موبایل/, /شماره تلگرام/, /شماره واتس/, /تماس بگیر/, /زنگ بزن/, /تماس/, /ارتباط/],
  },
    {
      intent: "HUMAN_REQUEST",
      patterns: [
        /با ا?دم حرف بزنم/,
        /با انسان/,
        /با صاحب فروش/,
        /با صاحب(?:\s|ِ)?فروشگاه/,
        /خودش حرف بزنم/,
        /شما رباتید/,
        /ربات هستید/,
        /رباتی/,
        /واقعی/,
        /انسان/,
        /صاحب فروشگاه/,
        /لطفا.*شخص/,
        /پشتیبانی انسانی/,
        /چرا ربات/,
        /ا?دم/,
        /حرف بزنم با/,
      ],
    },
];

const COLORS = ["مشکی", "سفید", "قرمز", "آبی", "سبز", "زرد", "صورتی", "بنفش", "قهوه‌ای", "قهوه", "کرم", "طلایی", "نقره‌ای", "نقره", "سرمه‌ای", "سرمه", "خاکستری", "گلبهی", "سبزآبی", "آجری"];
const PERSIAN_SIZES = ["xxl", "xl", "l", "m", "s", "xs", "بچه‌گانه", "بزرگ", "متوسط", "کوچک", "فری", "سایز بزرگ"];

function extractDigits(s: string): string[] {
  const matches = normalize(s).match(/\b\d{1,3}\b/g);
  return matches ?? [];
}

export type ExtractedEntities = {
  colors: string[];
  sizes: string[];
  numbers: string[];
  city?: string;
  cityQuery: boolean;
  possibleProductQuery?: string;
  mentionsOwnership: boolean;
};

const IRAN_CITIES = [
  "تهران", "کرج", "اصفهان", "مشهد", "شیراز", "تبریز", "اهواز", "قم", "کرمان", "یزد",
  "همدان", "ارومیه", "رشت", "ساری", "زاهدان", "کرمانشاه", "بوشهر", "بندرعباس", "قزوین",
  "گرگان", "خرم‌آباد", "سنندج", "اراک", "زنجان", "اردبیل", "ایلام", "بجنورد", "بیرجند", "سمنان",
  "شهرکرد", "قشم", "کیش",
];

export function extractEntities(text: string): ExtractedEntities {
  const n = normalize(text);
  const entities: ExtractedEntities = {
    colors: [],
    sizes: [],
    numbers: extractDigits(n),
    cityQuery: /(ارسال|شهر|به\s+\S+\s*دارید|به\s+\S+\s*میفرستید|شهرستان)/.test(n),
    mentionsOwnership: /(من میخوام|برام|خودم|مال من|میخرم|بخرم)/.test(n),
  };

  for (const c of COLORS) {
    if (n.includes(c)) entities.colors.push(c);
  }
  for (const sz of PERSIAN_SIZES) {
    if (n.includes(sz)) entities.sizes.push(sz);
  }
  // Persian/English digit sizes like 36..48 for shoes/clothes
  for (const num of entities.numbers) {
    const nn = Number(num);
    if (nn >= 34 && nn <= 50) entities.sizes.push(num);
  }
  for (const city of IRAN_CITIES) {
    if (n.includes(city)) {
      entities.city = city;
      break;
    }
  }
  return entities;
}

export function detectIntents(rawText: string): Intent[] {
  const n = normalize(rawText);
  const hits = new Set<Intent>();
  for (const { intent, patterns } of INTENT_PATTERNS) {
    for (const p of patterns) {
      if (p.test(n)) {
        hits.add(intent);
        break;
      }
    }
  }
  if (hits.size === 0) return ["UNKNOWN"];
  // Intent precedence: HUMAN_REQUEST is strongest if present.
  const ordered: Intent[] = [];
  const priority: Intent[] = [
    "HUMAN_REQUEST",
    "ORDER_INTENT",
    "CONTACT_REQUEST",
    "PRICE",
    "AVAILABILITY",
    "VARIANT_QUERY",
    "SHIPPING",
    "DELIVERY_TIME",
    "PAYMENT",
    "RETURNS",
    "DISCOUNT",
    "LOCATION",
    "BUSINESS_HOURS",
    "PRODUCT_INFO",
    "GREETING",
    "THANKS",
    "UNKNOWN",
  ];
  for (const i of priority) if (hits.has(i)) ordered.push(i);
  return ordered;
}

export function classifyConfidence(
  intents: Intent[],
  entities: ExtractedEntities,
  hasActiveProduct: boolean
): "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN" {
  if (intents.length === 1 && intents[0] === "UNKNOWN") return "UNKNOWN";
  // Greetings/thanks can be answered confidently without a product.
  if (intents.every((i) => i === "GREETING" || i === "THANKS")) return "HIGH";

  const needsProduct = intents.some((i) =>
    ["PRICE", "AVAILABILITY", "VARIANT_QUERY", "PRODUCT_INFO"].includes(i)
  );
  if (needsProduct && !hasActiveProduct) {
    // We need a product but don't have one.
    return "LOW";
  }

  const asksForBusinessInfo = intents.some((i) =>
    ["LOCATION", "BUSINESS_HOURS", "PAYMENT", "RETURNS", "SHIPPING", "DELIVERY_TIME", "DISCOUNT", "CONTACT_REQUEST"].includes(i)
  );
  if (asksForBusinessInfo) return "MEDIUM"; // answer only if rule is actually present (handled downstream).
  if (intents.includes("ORDER_INTENT")) return "HIGH";
  if (intents.includes("HUMAN_REQUEST")) return "HIGH";
  if (hasActiveProduct && (intents.includes("PRICE") || intents.includes("AVAILABILITY"))) return "HIGH";
  if (entities.colors.length > 0 || entities.sizes.length > 0) return "MEDIUM";
  return "MEDIUM";
}

export { tokenize, normalize };
