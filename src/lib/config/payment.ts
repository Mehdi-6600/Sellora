// Manual card-to-card payment configuration for Sellora.
// The owner (admin) receives payment via card transfer; the customer
// submits a tracking code and the admin approves/rejects manually.

export const PAYMENT_INFO = {
  cardNumber: "6219861870466447",
  cardHolder: "مهدی ویسی",
  bankName: "بانک سامان",
  // Human-readable instructions shown to the customer on the pay page.
  instructions: [
    "مبلغ پلن انتخابی را به شماره کارت زیر واریز کنید.",
    "پس از واریز، شماره پیگیری (کد رهگیری) تراکنش را در فرم ثبت کنید.",
    "درخواست شما برای بررسی ارسال می‌شود و ظرف حداکثر ۲۴ ساعت تأیید خواهد شد.",
    "پس از تأیید، اشتراک شما به‌صورت خودکار فعال می‌شود.",
  ],
} as const;

export type PaymentInfo = typeof PAYMENT_INFO;
