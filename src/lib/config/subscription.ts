// Shared Persian labels + helpers for the subscription domain.
// Single source of truth so no page hand-rolls its own enum→label map
// (and so raw enum values never reach the owner-facing UI).

import { PLANS } from "./pricing";

export const PLAN_LABELS: Record<string, string> = {
  WEEKLY: "هفتگی",
  MONTHLY: "ماهانه",
  QUARTERLY: "سه‌ماهه",
};

export function planLabel(plan: string): string {
  return PLAN_LABELS[plan] ?? plan;
}

export function planDurationDays(plan: string): number | null {
  return PLANS.find((p) => p.id === plan)?.durationDays ?? null;
}

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  TRIAL: "آزمایشی",
  ACTIVE: "فعال",
  EXPIRED: "منقضی شده",
  CANCELED: "لغو شده",
};

export function subscriptionStatusLabel(status: string): string {
  return SUBSCRIPTION_STATUS_LABELS[status] ?? status;
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "در انتظار بررسی",
  APPROVED: "تأیید شده",
  REJECTED: "رد شده",
};

export function paymentStatusLabel(status: string | null): string {
  if (!status) return "ثبت‌نشده";
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

/** Whole days remaining until endsAt; negative when already past. */
export function daysLeft(endsAt: Date | string | null | undefined): number | null {
  if (!endsAt) return null;
  const t = new Date(endsAt).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.ceil((t - Date.now()) / 86_400_000);
}
