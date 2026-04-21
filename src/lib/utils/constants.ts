import type { ServiceCategory, BookingStatus, BookingStage, ProTier, InvoiceKind, InvoiceStatus, PhotoPhase } from "@/types";

export const SERVICE_CATEGORIES: {
  value: ServiceCategory;
  label: string;
  color: string;
}[] = [
  { value: "pool", label: "Pool", color: "bg-blue-100 text-blue-800" },
  {
    value: "landscaping",
    label: "Landscaping",
    color: "bg-green-100 text-green-800",
  },
  { value: "maid", label: "Maid", color: "bg-purple-100 text-purple-800" },
];

export const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: string }
> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-800" },
  declined: { label: "Declined", color: "bg-red-100 text-red-800" },
  in_progress: {
    label: "In Progress",
    color: "bg-indigo-100 text-indigo-800",
  },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-800" },
};

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Default center (Los Angeles)
export const DEFAULT_CENTER = { lat: 34.0522, lng: -118.2437 };
export const DEFAULT_ZOOM = 11;

// ──────────────────────────────────────────────────────────
// Project pipeline stages (Phase 1 Ultimate Upgrade)
// ──────────────────────────────────────────────────────────
export const BOOKING_STAGE_CONFIG: Record<
  BookingStage,
  { label: string; color: string; step: number; description: string }
> = {
  inquiry:      { label: "Inquiry",      color: "bg-gray-100 text-gray-800",       step: 1, description: "Client requested a quote" },
  quoted:       { label: "Quoted",       color: "bg-sky-100 text-sky-800",         step: 2, description: "Pro sent a quote" },
  accepted:     { label: "Accepted",     color: "bg-blue-100 text-blue-800",       step: 3, description: "Client accepted the quote" },
  deposit_paid: { label: "Deposit Paid", color: "bg-emerald-100 text-emerald-800", step: 4, description: "Deposit received" },
  scheduled:    { label: "Scheduled",    color: "bg-violet-100 text-violet-800",   step: 5, description: "Job on the calendar" },
  on_site:      { label: "On Site",      color: "bg-indigo-100 text-indigo-800",   step: 6, description: "Pro checked in, work in progress" },
  punch_list:   { label: "Punch List",   color: "bg-amber-100 text-amber-800",     step: 7, description: "Final items being wrapped up" },
  completed:    { label: "Completed",    color: "bg-green-100 text-green-800",     step: 8, description: "Job complete" },
  cancelled:    { label: "Cancelled",    color: "bg-gray-100 text-gray-800",       step: 0, description: "Cancelled" },
  declined:     { label: "Declined",     color: "bg-red-100 text-red-800",         step: 0, description: "Pro declined" },
};

// Forward progression only — what stages follow each one
export const STAGE_NEXT: Record<BookingStage, BookingStage[]> = {
  inquiry:      ["quoted", "declined", "cancelled"],
  quoted:       ["accepted", "declined", "cancelled"],
  accepted:     ["deposit_paid", "scheduled", "cancelled"],
  deposit_paid: ["scheduled", "on_site", "cancelled"],
  scheduled:    ["on_site", "cancelled"],
  on_site:      ["punch_list", "completed"],
  punch_list:   ["completed"],
  completed:    [],
  cancelled:    [],
  declined:     [],
};

// ──────────────────────────────────────────────────────────
// Pro tier badges
// ──────────────────────────────────────────────────────────
export const TIER_CONFIG: Record<
  ProTier,
  { label: string; color: string; gradient: string; icon: string }
> = {
  new:      { label: "New",      color: "bg-gray-100 text-gray-700",   gradient: "from-gray-400 to-gray-600",     icon: "✦" },
  bronze:   { label: "Bronze",   color: "bg-orange-100 text-orange-800", gradient: "from-orange-400 to-amber-700",  icon: "●" },
  silver:   { label: "Silver",   color: "bg-slate-100 text-slate-800",  gradient: "from-slate-300 to-slate-500",   icon: "●●" },
  gold:     { label: "Gold",     color: "bg-amber-100 text-amber-800",  gradient: "from-amber-300 to-yellow-600",  icon: "★" },
  platinum: { label: "Platinum", color: "bg-violet-100 text-violet-800", gradient: "from-violet-400 to-fuchsia-600", icon: "★★" },
};

// ──────────────────────────────────────────────────────────
// Invoice configuration
// ──────────────────────────────────────────────────────────
export const INVOICE_KIND_CONFIG: Record<
  InvoiceKind,
  { label: string; color: string; description: string }
> = {
  deposit:      { label: "Deposit",      color: "bg-sky-100 text-sky-800",       description: "Upfront deposit to lock the job" },
  progress:     { label: "Progress",     color: "bg-violet-100 text-violet-800", description: "Milestone payment during work" },
  final:        { label: "Final",        color: "bg-emerald-100 text-emerald-800", description: "Final balance on completion" },
  change_order: { label: "Change Order", color: "bg-amber-100 text-amber-800",   description: "Added scope after the original quote" },
};

export const INVOICE_STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; color: string }
> = {
  draft:   { label: "Draft",   color: "bg-gray-100 text-gray-800" },
  sent:    { label: "Sent",    color: "bg-blue-100 text-blue-800" },
  paid:    { label: "Paid",    color: "bg-green-100 text-green-800" },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-800" },
  void:    { label: "Void",    color: "bg-gray-100 text-gray-600" },
};

// ──────────────────────────────────────────────────────────
// Photo phases
// ──────────────────────────────────────────────────────────
export const PHOTO_PHASE_CONFIG: Record<
  PhotoPhase,
  { label: string; color: string }
> = {
  before: { label: "Before", color: "bg-gray-100 text-gray-800" },
  during: { label: "During", color: "bg-indigo-100 text-indigo-800" },
  after:  { label: "After",  color: "bg-green-100 text-green-800" },
  issue:  { label: "Issue",  color: "bg-red-100 text-red-800" },
};
