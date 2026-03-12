import type { ServiceCategory, BookingStatus } from "@/types";

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
