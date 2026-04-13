import type { SubscriptionPlan, SubscriptionStatus } from "@/types/database";

export const PLANS = {
  starter: {
    name: "Starter",
    price: 0,
    bookingsPerMonth: 10,
    features: [
      "Contractor profile",
      "Get discovered by nearby clients",
      "Up to 10 bookings per month",
      "Basic messaging",
      "Client reviews and ratings",
    ],
  },
  professional: {
    name: "Professional",
    price: 29,
    bookingsPerMonth: Infinity,
    features: [
      "Everything in Starter",
      "Unlimited bookings",
      "Priority map placement",
      "Portfolio photo gallery",
      "Analytics dashboard",
      "Quick invoicing",
      "Availability calendar",
      "Custom service pricing",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: 79,
    bookingsPerMonth: Infinity,
    features: [
      "Everything in Professional",
      "Multiple team members",
      "Route optimization",
      "Custom branding",
      "API access",
      "Priority support",
      "White label options",
      "Dedicated account manager",
    ],
  },
} as const;

export function isTrialExpired(
  status: SubscriptionStatus,
  trialEndsAt: string | null
): boolean {
  if (status !== "trialing") return false;
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt) < new Date();
}

export function isLockedOut(
  status: SubscriptionStatus,
  trialEndsAt: string | null
): boolean {
  if (status === "active") return false;
  if (status === "trialing" && !isTrialExpired(status, trialEndsAt)) return false;
  return true;
}

export function canAcceptBooking(
  plan: SubscriptionPlan,
  currentMonthBookings: number
): boolean {
  const limit = PLANS[plan].bookingsPerMonth;
  return currentMonthBookings < limit;
}

export function getTrialDaysLeft(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
