import type { Dict } from "@/lib/i18n/dictionaries/fa";

/**
 * Presentation-only label helpers.
 *
 * These map the enums that already exist in the database/API to the badge
 * copy and tone used across the inbox, dashboard and settings. No business
 * logic lives here — the values come straight from the existing dictionaries
 * and API payloads.
 */

export type Tone = "brand" | "green" | "red" | "amber" | "gray" | "blue";

export function conversationState(
  state: string,
  dict: Dict
): { label: string; tone: Tone } {
  const s = dict.states;
  switch (state) {
    case "NEW":
      return { label: s.new, tone: "brand" };
    case "ACTIVE":
      return { label: s.active, tone: "brand" };
    case "WAITING_CUSTOMER":
      return { label: s.waitingCustomer, tone: "gray" };
    case "WAITING_OWNER":
      return { label: s.waitingOwner, tone: "amber" };
    case "OWNER_ACTIVE":
      return { label: s.ownerActive, tone: "blue" };
    case "QUALIFIED":
      return { label: s.qualified, tone: "green" };
    case "COMPLETED":
      return { label: s.completed, tone: "green" };
    case "EXPIRED":
      return { label: s.expired, tone: "gray" };
    default:
      return { label: state, tone: "gray" };
  }
}

export function leadTemperature(
  temperature: string,
  dict: Dict
): { label: string; tone: Tone } {
  switch (temperature) {
    case "HOT":
      return { label: dict.leads.hot, tone: "red" };
    case "WARM":
      return { label: dict.leads.warm, tone: "amber" };
    default:
      return { label: dict.leads.cold, tone: "gray" };
  }
}

export function deliveryState(state: string, dict: Dict): string {
  const map = dict.states.delivery as Record<string, string | undefined>;
  return map[state] ?? state;
}

/** The single most important status of a conversation row/detail header. */
export function automationStatus(
  automationLock: string,
  state: string,
  dict: Dict
): { label: string; tone: Tone } {
  if (automationLock === "HUMAN") return { label: "در حال پاسخ‌گویی شما", tone: "blue" };
  if (state === "WAITING_OWNER") return { label: dict.conversations.needsYou, tone: "amber" };
  return { label: dict.conversations.active, tone: "green" };
}
