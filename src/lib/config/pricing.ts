// Sellora subscription pricing (configuration-driven — single product).
// Launch pricing (in Toman):
//   1 week   =  299,000
//   1 month  =  899,000   (best value: the 3-month option)
//   3 months = 2,249,000  [best value]
//
// NEVER hard-code these prices anywhere else in the codebase.

export const CURRENCY = "IRT"; // Iranian Toman for display; DB stores integer value in same unit.
export const PLANS = [
  {
    id: "WEEKLY" as const,
    durationDays: 7,
    price: 299_000,
    badge: null as string | null,
  },
  {
    id: "MONTHLY" as const,
    durationDays: 30,
    price: 899_000,
    badge: null,
  },
  {
    id: "QUARTERLY" as const,
    durationDays: 90,
    price: 2_249_000,
    badge: "بهترین ارزش" as string | null,
  },
];

export function getPlan(id: "WEEKLY" | "MONTHLY" | "QUARTERLY") {
  return PLANS.find((p) => p.id === id)!;
}
