import type { SubscriptionPlan, SubscriptionStatus } from "@/types/database";

export const PLANS = {
  starter: {
    name: "Starter",
    price: 29,
    bookingsPerMonth: 50,
    maxTeams: 1,
    features: [
      "Contractor profile + map presence",
      "Up to 50 bookings per month",
      "1 team",
      "Basic messaging",
      "Client reviews and ratings",
      "Basic invoicing",
    ],
  },
  professional: {
    name: "Pro",
    price: 59,
    bookingsPerMonth: Infinity,
    maxTeams: 5,
    features: [
      "Everything in Starter",
      "Unlimited bookings",
      "Up to 5 teams",
      "Priority map placement",
      "Portfolio photo gallery",
      "Estimates and quick invoicing",
      "Availability calendar",
      "Analytics dashboard",
    ],
  },
  enterprise: {
    name: "Max",
    price: 99,
    bookingsPerMonth: Infinity,
    maxTeams: Infinity,
    features: [
      "Everything in Pro",
      "Unlimited teams",
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

export function canAddTeam(
  plan: SubscriptionPlan,
  currentTeamCount: number
): boolean {
  const limit = PLANS[plan].maxTeams;
  return currentTeamCount < limit;
}

export function getTrialDaysLeft(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0;
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
