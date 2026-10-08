import type { Dict } from "./fa";

const ar: Dict = {
  app: { name: "سيلّورا", tagline: "موظف المبيعات وخدمة العملاء على إنستغرام" },
  nav: {
    dashboard: "لوحة التحكم", conversations: "المحادثات", leads: "العملاء المهتمون",
    products: "المنتجات", settings: "الإعدادات", business: "معلومات المتجر",
    instagram: "ربط إنستغرام", subscription: "الاشتراك",
  },
  auth: {
    login: "تسجيل الدخول", signup: "إنشاء حساب", email: "البريد الإلكتروني",
    password: "كلمة المرور", name: "اسمك", businessName: "اسم المتجر",
    loginCta: "سجّل الدخول إلى حسابك", signupCta: "ابدأ متجرك على سيلّورا",
    noAccount: "ليس لديك حساب؟ أنشئ حساباً", haveAccount: "لديك حساب؟ سجّل الدخول",
    invalidCredentials: "بريد أو كلمة مرور غير صحيحة.", weakPassword: "يجب أن تكون كلمة المرور 8 أحرف على الأقل.",
    emailTaken: "هذا البريد مسجل بالفعل.",
  },
  common: {
    save: "حفظ", cancel: "إلغاء", delete: "حذف", edit: "تعديل", add: "إضافة",
    search: "بحث", loading: "جارٍ التحميل...", empty: "لا يوجد شيء للعرض",
    toman: "تومان", rial: "ريال", available: "متوفر", unavailable: "غير متوفر",
    back: "رجوع", confirm: "تأكيد", submit: "إرسال", required: "مطلوب",
    yes: "نعم", no: "لا", retry: "إعادة المحاولة",
  },
  dashboard: {
    title: "لوحة التحكم", greeting: "مرحباً",
    resolvedWithoutYou: "محادثة تم حلها بدون تدخلك",
    resolvedOfTotal: "من أصل {total}",
    hotLeads: "عملاء جاهزون", hotLeadsDesc: "جاهزون للشراء الآن",
    conversationsOpen: "محادثات مفتوحة", autoRate: "معدل الرد الآلي",
    conversationsWaiting: "بانتظارك",
    connectInstagram: "ربط إنستغرام", connectInstagramDesc: "اربط حساب إنستغرام التجاري لبدء الرد الآلي.",
    addProducts: "أضف منتجات", addProductsDesc: "أضف منتجاتك لكي تتمكن سيلّورا من الإجابة عن السعر والتوفر.",
    startOnboarding: "ابدأ الإعداد",
    funnel: {
      comment: "تعليق", dm: "رسالة خاصة", started: "محادثة",
      qualified: "مهتم", highIntent: "نية الشراء", contact: "تم أخذ بيانات التواصل", purchase: "شراء",
    },
  },
  products: {
    title: "المنتجات", addNew: "إضافة منتج جديد", import: "استيراد جماعي",
    name: "اسم المنتج", price: "السعر", sku: "الرمز", status: "الحالة",
    description: "الوصف", imageUrl: "رابط الصورة",
    markAvailable: "متوفر", markUnavailable: "غير متوفر", changePrice: "تغيير السعر",
    bulk: { selectAll: "تحديد الكل", makeAvailable: "تحديد كمخزون", makeUnavailable: "تحديد كنفاد", priceUpdate: "تحديث جماعي للأسعار" },
    importTitle: "استيراد المنتجات", importHelp: "كل منتج في سطر بالصيغة:",
    importExample: "معطف آفا | 240000 | متوفر\nحذاء نايك | 390000 | غير متوفر",
    parsePreview: "معاينة", saveValid: "حفظ الصفوف الصالحة", invalidRows: "صفوف غير صالحة", validRows: "صفوف صالحة",
  },
  conversations: {
    title: "المحادثات", empty: "لا توجد محادثات بعد.",
    takeOver: "تولي المحادثة", returnToAuto: "إرجاعها لسيلّورا",
    typingPlaceholder: "اكتب رسالة...", send: "إرسال",
    waiting: "بانتظار العميل", needsYou: "تحتاج إليك", active: "نشطة", hot: "مهم",
  },
  leads: {
    title: "العملاء المهتمون", subtitle: "عملاء لديهم نية شراء ويحتاجون متابعة سريعة",
    score: "النقاط", reason: "سبب الاهتمام", cold: "بارد", warm: "دافئ", hot: "ساخن",
    viewConversation: "عرض المحادثة",
  },
  notifications: {
    title: "الإشعارات",
    bellAria: "الإشعارات",
    unreadWord: "غير مقروء",
    markAllRead: "تعليم الكل كمقروء",
    emptyTitle: "لا توجد إشعارات",
    emptyDesc: "سنخبرك هنا عند رصد عميل مهتم، أو عند حاجة محادثة إلى تدخلك، أو عند تغيّر حالة اشتراكك.",
  },
  settings: {
    business: {
      title: "معلومات المتجر", address: "العنوان", phone: "الهاتف", hours: "ساعات العمل",
      shipping: "معلومات الشحن", payment: "طرق الدفع", returns: "سياسة الإرجاع",
      cities: "المدن المخدومة", generalInfo: "نبذة عن المتجر", notes: "ملاحظات داخلية",
    },
    instagram: {
      title: "ربط إنستغرام", statusConnected: "متصل",
      statusDegraded: "متصل جزئياً (يحتاج مراجعة)", statusReauth: "يلزم تسجيل الدخول مجدداً",
      statusDisconnected: "غير متصل", connectCta: "ربط حساب إنستغرام تجاري",
      disconnect: "قطع الاتصال", account: "الحساب", lastVerified: "آخر تحقق", scopes: "الصلاحيات",
      notConnectedMsg: "لم يتم ربط أي حساب إنستغرام تجاري بعد. اربطه لبدء استقبال الرسائل.",
      reviewNotice: "ملاحظة: الوضع الإنتاجي يتطلب مراجعة التطبيق من Meta وصلاحيات Advanced Access.",
    },
    subscription: {
      title: "الاشتراك", currentPlan: "الخطة الحالية", trial: "تجريبي",
      select: "اختر خطة", bestValue: "أفضل قيمة",
      weekly: "أسبوع", monthly: "شهر", quarterly: "٣ أشهر",
      weeklyPrice: "٢٩٩٬٠٠٠ تومان", monthlyPrice: "٨٩٩٬٠٠٠ تومان", quarterlyPrice: "٢٬٢٤٩٬٠٠٠ تومان",
      noPayments: "بوابة الدفع غير مفعلة في هذه النسخة. بعد اختيار الخطة سنتواصل معك.",
    },
  },
  onboarding: {
    step1: "ربط إنستغرام", step2: "نوع النشاط", step3: "ماذا تبيع",
    step4: "إضافة منتجات", step5: "اختيار المنشورات", step6: "التفعيل",
    welcome: "أهلاً بك في سيلّورا", welcomeDesc: "بضع خطوات سريعة لتفعيل موظف المبيعات الذكي.",
  },
  states: {
    new: "جديد", active: "نشط", waitingCustomer: "بانتظار العميل",
    waitingOwner: "بانتظارك", ownerActive: "أنت ترد الآن",
    qualified: "مهتم", completed: "مكتمل", expired: "منتهي",
  },
  errors: {
    generic: "حدث خطأ. حاول مرة أخرى.",
    unauthorized: "سجّل الدخول أولاً.",
    forbidden: "ليس لديك صلاحية لهذا القسم.",
    notFound: "غير موجود.",
    tenantMismatch: "هذا السجل لا يخص متجرك.",
    invalidInput: "البيانات غير صالحة.",
    productExists: "هذا المنتج مسجل مسبقاً.",
  },
};

export default ar;
